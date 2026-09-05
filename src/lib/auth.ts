import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "dev-secret-change-me";
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

function safeEqualStrings(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function createSessionToken() {
  const issuedAt = Date.now().toString();
  const sig = sign(issuedAt);
  return `${issuedAt}.${sig}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [issuedAt, sig] = token.split(".");
  if (!issuedAt || !sig) return false;

  const expected = sign(issuedAt);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    if (!timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }

  const ageMs = Date.now() - Number(issuedAt);
  if (Number.isNaN(ageMs) || ageMs > MAX_AGE_SECONDS * 1000) return false;
  return true;
}

export async function isAdminAuthenticated() {
  const jar = await cookies();
  return verifySessionToken(jar.get(COOKIE_NAME)?.value);
}

export function getAdminCookieOptions(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  };
}

export function getClearAdminCookieOptions() {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  };
}

/**
 * Admin login credentials.
 * Prefers ADMIN_USERNAME / ADMIN_PASSWORD when both are set;
 * otherwise uses PROFILE_GATE_USERNAME / PROFILE_GATE_PASSWORD.
 */
export function checkAdminCredentials(username: string, password: string) {
  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;
  if (adminUser && adminPass) {
    return safeEqualStrings(username, adminUser) && safeEqualStrings(password, adminPass);
  }

  const expectedUser = process.env.PROFILE_GATE_USERNAME;
  const expectedPass = process.env.PROFILE_GATE_PASSWORD;
  if (!expectedUser || !expectedPass) {
    throw new Error(
      "Admin credentials are not configured. Set PROFILE_GATE_USERNAME / PROFILE_GATE_PASSWORD (or ADMIN_USERNAME / ADMIN_PASSWORD).",
    );
  }
  return safeEqualStrings(username, expectedUser) && safeEqualStrings(password, expectedPass);
}

/** @deprecated Use checkAdminCredentials — kept for any password-only call sites */
export function checkAdminPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD || process.env.PROFILE_GATE_PASSWORD;
  if (!expected) {
    throw new Error("ADMIN_PASSWORD is not configured");
  }
  return safeEqualStrings(password, expected);
}

export { COOKIE_NAME };
