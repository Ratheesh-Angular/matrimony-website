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
      phone: member.phone,
      isPremium: Boolean(member.isPremium),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Unable to load session" },
      { status: 500 },
    );
  }
}
