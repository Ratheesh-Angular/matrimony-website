import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { grantPremiumFromPayment } from "@/lib/premium";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { Payment } from "@/models/Payment";
import { Subscription } from "@/models/Subscription";

type WebhookPayload = {
  event?: string;
  payload?: {
    payment?: { entity?: Record<string, unknown> };
    subscription?: { entity?: Record<string, unknown> };
  };
};

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function unixToDate(value: number | null): Date | null {
  if (value === null) return null;
  return new Date(value * 1000);
}

const SUBSCRIPTION_STATUS_MAP: Record<string, string> = {
  created: "created",
  authenticated: "authenticated",
  active: "active",
  pending: "pending",
  halted: "halted",
  cancelled: "cancelled",
  completed: "completed",
  expired: "expired",
};

async function applyPaymentEvent(
  event: string,
  entity: Record<string, unknown> | undefined,
) {
  if (!entity) return;

  const orderId = asString(entity.order_id);
  const paymentId = asString(entity.id);
  if (!orderId) return;

  const update: Record<string, unknown> = {
    raw: entity,
  };

  if (paymentId) {
    update.razorpayPaymentId = paymentId;
  }

  if (event === "payment.captured") {
    update.status = "paid";
  } else if (event === "payment.failed") {
    update.status = "failed";
  }

  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId: orderId },
    { $set: update },
    { new: true },
  );

  if (event === "payment.captured" && payment) {
    await grantPremiumFromPayment({
      _id: payment._id,
      notes: payment.notes,
      razorpayOrderId: payment.razorpayOrderId,
      razorpayPaymentId: payment.razorpayPaymentId,
    });
  }
}

async function applySubscriptionEvent(
  event: string,
  entity: Record<string, unknown> | undefined,
) {
  if (!entity) return;

  const subscriptionId = asString(entity.id);
  if (!subscriptionId) return;

  const rzStatus = asString(entity.status);
  const mapped =
    SUBSCRIPTION_STATUS_MAP[rzStatus] ||
    (event === "subscription.authenticated"
      ? "authenticated"
      : event === "subscription.activated" || event === "subscription.charged"
        ? "active"
        : event === "subscription.pending"
          ? "pending"
          : event === "subscription.halted"
            ? "halted"
            : event === "subscription.cancelled"
              ? "cancelled"
              : event === "subscription.completed"
                ? "completed"
                : null);

  const update: Record<string, unknown> = {
    raw: entity,
    paidCount: asNumber(entity.paid_count) ?? undefined,
    totalCount: asNumber(entity.total_count) ?? undefined,
    currentStart: unixToDate(asNumber(entity.current_start)),
    currentEnd: unixToDate(asNumber(entity.current_end)),
  };

  if (mapped) {
    update.status = mapped;
  }

  // Drop undefined so we don't overwrite with undefined via $set.
  for (const key of Object.keys(update)) {
    if (update[key] === undefined) delete update[key];
  }

  await Subscription.findOneAndUpdate(
    { razorpaySubscriptionId: subscriptionId },
    { $set: update },
  );
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    const valid = await verifyWebhookSignature(rawBody, signature);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 },
      );
    }

    const payload = JSON.parse(rawBody) as WebhookPayload;
    const event = String(payload.event || "");

    await connectDB();

    if (event.startsWith("payment.")) {
      await applyPaymentEvent(event, payload.payload?.payment?.entity);
    }

    if (event.startsWith("subscription.")) {
      await applySubscriptionEvent(
        event,
        payload.payload?.subscription?.entity,
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Webhook processing failed",
      },
      { status: 500 },
    );
  }
}
