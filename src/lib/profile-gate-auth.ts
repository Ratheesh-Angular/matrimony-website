import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "profile_gate_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  return (
    process.env.PROFILE_GATE_SESSION_SECRET ||
    process.env.PROFILE_GATE_PASSWORD ||
    "profile-gate-dev-secret-change-me"
  );
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

export function createProfileGateSessionToken() {
  const issuedAt = Date.now().toString();
  const sig = sign(issuedAt);
  return `${issuedAt}.${sig}`;
}

export function verifyProfileGateSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [issuedAt, sig] = token.split(".");
  if (!issuedAt || !sig) return false;

  const expected = sign(issuedAt);
  try {
    if (!safeEqualStrings(sig, expected)) return false;
  } catch {
    return false;
  }

  const ageMs = Date.now() - Number(issuedAt);
  if (Number.isNaN(ageMs) || ageMs > MAX_AGE_SECONDS * 1000) return false;
  return true;
}

export async function isProfileGateAuthenticated() {
  const jar = await cookies();
  return verifyProfileGateSessionToken(jar.get(COOKIE_NAME)?.value);
}

export function getProfileGateCookieOptions(token: string) {
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

export function getClearProfileGateCookieOptions() {
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

export function checkProfileGateCredentials(username: string, password: string) {
  const expectedUser = process.env.PROFILE_GATE_USERNAME;
  const expectedPass = process.env.PROFILE_GATE_PASSWORD;
  if (!expectedUser || !expectedPass) {
    throw new Error("PROFILE_GATE_USERNAME / PROFILE_GATE_PASSWORD are not configured");
  }
  const userOk = safeEqualStrings(username, expectedUser);
  const passOk = safeEqualStrings(password, expectedPass);
  return userOk && passOk;
}

export { COOKIE_NAME as PROFILE_GATE_COOKIE_NAME };
