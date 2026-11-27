import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Member } from "@/models/Member";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const docs = await Member.find()
    .select(
      "name phone isPremium paymentStatus paymentReference paymentSubmittedAt paymentReviewedAt premiumPaidAt createdAt",
    )
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();

  const normalized = docs.map((m) => {
    const isPremium = Boolean(m.isPremium);
    const paymentStatus = isPremium
      ? "approved"
      : m.paymentStatus || "unpaid";

    return {
      _id: String(m._id),
      name: m.name || "",
      phone: m.phone,
      isPremium,
      paymentStatus,
      paymentReference: m.paymentReference || "",
      paymentSubmittedAt: m.paymentSubmittedAt
        ? new Date(m.paymentSubmittedAt).toISOString()
        : null,
      paymentReviewedAt: m.paymentReviewedAt
        ? new Date(m.paymentReviewedAt).toISOString()
        : null,
      premiumPaidAt: m.premiumPaidAt
        ? new Date(m.premiumPaidAt).toISOString()
        : null,
      createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : null,
    };
  });

  // Sort pending_review first (newest submission first), then others by createdAt desc
  normalized.sort((a, b) => {
    const aPending = a.paymentStatus === "pending_review" ? 0 : 1;
    const bPending = b.paymentStatus === "pending_review" ? 0 : 1;
    if (aPending !== bPending) return aPending - bPending;
    if (aPending === 0 && bPending === 0) {
      return (b.paymentSubmittedAt || "").localeCompare(
        a.paymentSubmittedAt || "",
      );
    }
    return (b.createdAt || "").localeCompare(a.createdAt || "");
  });

  return NextResponse.json(normalized);
}
