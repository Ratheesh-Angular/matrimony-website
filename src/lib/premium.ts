import { runtimeEnv } from "@/lib/runtime-env";
import { Member } from "@/models/Member";
import type { PaymentDoc } from "@/models/Payment";
import mongoose from "mongoose";

export const DEFAULT_PREMIUM_AMOUNT_PAISE = 26_000;

export function getPremiumAmountPaise(): number {
  const raw = runtimeEnv("PREMIUM_AMOUNT_PAISE");
  if (!raw) return DEFAULT_PREMIUM_AMOUNT_PAISE;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : DEFAULT_PREMIUM_AMOUNT_PAISE;
}

export function getPremiumAmountInr(): number {
  return Math.round(getPremiumAmountPaise() / 100);
}

function memberIdFromPayment(payment: {
  notes?: unknown;
}): string | null {
  const notes = payment.notes;
  if (!notes || typeof notes !== "object" || Array.isArray(notes)) return null;
  const memberId = (notes as Record<string, unknown>).memberId;
  return typeof memberId === "string" && mongoose.Types.ObjectId.isValid(memberId)
    ? memberId
    : null;
}

/** Idempotently mark the linked member as lifetime premium. */
export async function grantPremiumFromPayment(payment: {
  _id: mongoose.Types.ObjectId;
  notes?: unknown;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}): Promise<boolean> {
  const memberId = memberIdFromPayment(payment);
  if (!memberId) return false;

  await Member.findByIdAndUpdate(memberId, {
    $set: {
      isPremium: true,
      premiumPaidAt: new Date(),
      premiumPaymentId: payment._id,
      razorpayOrderId: payment.razorpayOrderId || "",
      razorpayPaymentId: payment.razorpayPaymentId || "",
    },
  });

  return true;
}

export type { PaymentDoc };
