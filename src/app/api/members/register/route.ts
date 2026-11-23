import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  createMemberSessionToken,
  getMemberCookieOptions,
  hashPassword,
  normalizePhone,
} from "@/lib/member-auth";
import { Member } from "@/models/Member";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = normalizePhone(String(body.phone || ""));
    const password = String(body.password || "");
    const confirmPassword = String(body.confirmPassword || body.password || "");

    if (!phone) {
      return NextResponse.json(
        { error: "Enter a valid 10-digit Indian mobile number" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 },
      );
    }

    await connectDB();
    const existing = await Member.findOne({ phone });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this phone number already exists. Please login." },
        { status: 409 },
      );
    }

    const member = await Member.create({
      phone,
      passwordHash: hashPassword(password),
      isPremium: false,
    });

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
        error:
          err instanceof Error ? err.message : "Unable to create account",
      },
      { status: 500 },
    );
  }
}
