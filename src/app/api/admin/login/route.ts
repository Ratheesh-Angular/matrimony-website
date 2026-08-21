import { NextResponse } from "next/server";
import {
  checkAdminPassword,
  createSessionToken,
  getAdminCookieOptions,
  getClearAdminCookieOptions,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = String(body.password || "");
    if (!checkAdminPassword(password)) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
    const token = createSessionToken();
    const res = NextResponse.json({ ok: true });
    const cookie = getAdminCookieOptions(token);
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
  const cookie = getClearAdminCookieOptions();
  res.cookies.set(cookie.name, cookie.value, cookie);
  return res;
}
