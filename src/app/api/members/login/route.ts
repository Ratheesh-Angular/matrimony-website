import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  createMemberSessionToken,
  getMemberCookieOptions,
  normalizePhone,
  verifyPassword,
} from "@/lib/member-auth";
import { Member } from "@/models/Member";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = normalizePhone(String(body.phone || ""));
    const password = String(body.password || "");

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Phone number and password are required" },
        { status: 400 },
      );
    }

    await connectDB();
    const member = await Member.findOne({ phone });
    if (!member || !verifyPassword(password, member.passwordHash)) {
      return NextResponse.json(
        { error: "Invalid phone number or password" },
        { status: 401 },
      );
    }

    const token = createMemberSessionToken(String(member._id));
    const response = NextResponse.json({
      ok: true,
      phone: member.phone,
      isPremium: member.isPremium,
    });
    response.cookies.set(getMemberCookieOptions(token));
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Unable to login",
      },
      { status: 500 },
    );
  }
}
