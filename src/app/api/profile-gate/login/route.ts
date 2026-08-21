import { NextResponse } from "next/server";
import {
  checkProfileGateCredentials,
  createProfileGateSessionToken,
  getClearProfileGateCookieOptions,
  getProfileGateCookieOptions,
} from "@/lib/profile-gate-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body.username || "").trim();
    const password = String(body.password || "");
    if (!checkProfileGateCredentials(username, password)) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }
    const token = createProfileGateSessionToken();
    const res = NextResponse.json({ ok: true });
    const cookie = getProfileGateCookieOptions(token);
    res.cookies.set(cookie.name, cookie.value, cookie);
    return res;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Login failed" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  const cookie = getClearProfileGateCookieOptions();
  res.cookies.set(cookie.name, cookie.value, cookie);
  return res;
}
