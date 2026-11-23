import { NextResponse } from "next/server";
import { getClearMemberCookieOptions } from "@/lib/member-auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(getClearMemberCookieOptions());
  return response;
}
