import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Member } from "@/models/Member";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid member ID" }, { status: 400 });
  }

  let action = "";
  try {
    const body = await request.json();
    action = String(body?.action || "");
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const now = new Date();
  let update: Record<string, unknown>;

  if (action === "approve") {
    update = {
      isPremium: true,
      paymentStatus: "approved",
      premiumPaidAt: now,
      paymentReviewedAt: now,
    };
  } else if (action === "reject") {
    update = {
      isPremium: false,
      paymentStatus: "rejected",
      paymentReviewedAt: now,
    };
  } else if (action === "revoke") {
    update = {
      isPremium: false,
      paymentStatus: "unpaid",
      premiumPaidAt: null,
      paymentReviewedAt: now,
    };
  } else {
    return NextResponse.json(
      { error: "Invalid action. Expected approve, reject, or revoke." },
      { status: 400 },
    );
  }

  await connectDB();
  const member = await Member.findByIdAndUpdate(
    id,
    { $set: update },
    { returnDocument: "after" },
  )
    .select(
      "name phone isPremium paymentStatus paymentReference paymentSubmittedAt paymentReviewedAt premiumPaidAt createdAt",
    )
    .lean();

  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    member: {
      _id: String(member._id),
      name: member.name || "",
      phone: member.phone,
      isPremium: Boolean(member.isPremium),
      paymentStatus: member.isPremium
        ? "approved"
        : member.paymentStatus || "unpaid",
      paymentReference: member.paymentReference || "",
      paymentSubmittedAt: member.paymentSubmittedAt
        ? new Date(member.paymentSubmittedAt).toISOString()
        : null,
      paymentReviewedAt: member.paymentReviewedAt
        ? new Date(member.paymentReviewedAt).toISOString()
        : null,
      premiumPaidAt: member.premiumPaidAt
        ? new Date(member.premiumPaidAt).toISOString()
        : null,
      createdAt: member.createdAt
        ? new Date(member.createdAt).toISOString()
        : null,
    },
  });
}

export async function DELETE(_request: Request, { params }: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid member ID" }, { status: 400 });
  }

  await connectDB();
  const deleted = await Member.findByIdAndDelete(id);
  if (!deleted) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
