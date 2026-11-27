import { NextResponse } from "next/server";
import { getMemberFromSession } from "@/lib/member-auth";

export async function GET() {
  try {
    const member = await getMemberFromSession();
    if (!member) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      name: member.name || "",
      phone: member.phone,
      isPremium: Boolean(member.isPremium),
      paymentStatus: member.isPremium
        ? "approved"
        : member.paymentStatus || "unpaid",
      paymentSubmittedAt: member.paymentSubmittedAt ?? null,
      paymentReference: member.paymentReference || "",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Unable to load session" },
      { status: 500 },
    );
  }
}
