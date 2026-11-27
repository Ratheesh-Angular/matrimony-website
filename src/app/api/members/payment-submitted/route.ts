import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getMemberFromSession } from "@/lib/member-auth";
import { Member } from "@/models/Member";

export async function POST(request: Request) {
  try {
    const member = await getMemberFromSession();
    if (!member) {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }

    if (member.isPremium) {
      return NextResponse.json({
        ok: true,
        alreadyPremium: true,
        paymentStatus: "approved",
      });
    }

    let paymentReference = "";
    try {
      const body = await request.json();
      paymentReference = String(body?.paymentReference || "")
        .trim()
        .slice(0, 80);
    } catch {
      // Empty body is valid since UTR is optional
    }

    const now = new Date();
    await connectDB();
    await Member.findByIdAndUpdate(member._id, {
      $set: {
        paymentStatus: "pending_review",
        paymentSubmittedAt: now,
        paymentReference,
      },
    });

    return NextResponse.json({
      ok: true,
      paymentStatus: "pending_review",
      paymentSubmittedAt: now.toISOString(),
      paymentReference,
    });
  } catch (err) {
    console.error("payment-submitted failed", err);
    return NextResponse.json(
      { error: "Unable to record payment confirmation. Please try again." },
      { status: 500 },
    );
  }
}
