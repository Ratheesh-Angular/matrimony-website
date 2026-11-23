import {
  createHmac,
  pbkdf2Sync,
  randomBytes,
  timingSafeEqual,
} from "crypto";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { runtimeEnv } from "@/lib/runtime-env";
import { Member, type MemberDoc } from "@/models/Member";

const COOKIE_NAME = "member_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEYLEN = 32;

function getSecret() {
  return (
    runtimeEnv("MEMBER_SESSION_SECRET") ||
    runtimeEnv("ADMIN_SESSION_SECRET") ||
    "dev-member-secret-change-me"
  );
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

function safeEqualHex(a: string, b: string) {
  try {
    const bufA = Buffer.from(a, "hex");
    const bufB = Buffer.from(b, "hex");
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/** Normalize to 10-digit Indian mobile or null. */
export function normalizePhone(input: string): string | null {
  let digits = String(input || "").replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) {
    digits = digits.slice(2);
  }
  if (digits.startsWith("0") && digits.length === 11) {
    digits = digits.slice(1);
  }
  if (!/^[6-9]\d{9}$/.test(digits)) return null;
  return digits;
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(
    password,
    salt,
    PBKDF2_ITERATIONS,
    PBKDF2_KEYLEN,
    "sha256",
  ).toString("hex");
  return `pbkdf2$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [algo, salt, hash] = String(stored || "").split("$");
  if (algo !== "pbkdf2" || !salt || !hash) return false;
  const attempt = pbkdf2Sync(
    password,
    salt,
    PBKDF2_ITERATIONS,
    PBKDF2_KEYLEN,
    "sha256",
  ).toString("hex");
  return safeEqualHex(hash, attempt);
}

export function createMemberSessionToken(memberId: string): string {
  const issuedAt = Date.now().toString();
  const payload = `${memberId}.${issuedAt}`;
  return `${payload}.${sign(payload)}`;
}

export function parseMemberSessionToken(
  token: string | undefined | null,
): { memberId: string; issuedAt: number } | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [memberId, issuedAtStr, sig] = parts;
  if (!memberId || !issuedAtStr || !sig) return null;
  if (!mongoose.Types.ObjectId.isValid(memberId)) return null;

  const expected = sign(`${memberId}.${issuedAtStr}`);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  const issuedAt = Number(issuedAtStr);
  if (Number.isNaN(issuedAt)) return null;
  const ageMs = Date.now() - issuedAt;
  if (ageMs > MAX_AGE_SECONDS * 1000 || ageMs < 0) return null;

  return { memberId, issuedAt };
}

export function getMemberCookieOptions(token: string) {
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

export function getClearMemberCookieOptions() {
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

export async function getMemberFromSession(): Promise<MemberDoc | null> {
  const jar = await cookies();
  const parsed = parseMemberSessionToken(jar.get(COOKIE_NAME)?.value);
  if (!parsed) return null;

  await connectDB();
  const member = await Member.findById(parsed.memberId);
  return member as MemberDoc | null;
}

export async function isMemberPremium(): Promise<boolean> {
  const member = await getMemberFromSession();
  return Boolean(member?.isPremium);
}

export { COOKIE_NAME as MEMBER_COOKIE_NAME, MAX_AGE_SECONDS as MEMBER_SESSION_MAX_AGE };
