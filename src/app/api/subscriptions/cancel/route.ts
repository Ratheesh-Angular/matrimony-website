import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { cancelSubscription } from "@/lib/razorpay";
import { Subscription } from "@/models/Subscription";

function unixToDate(value?: number | null): Date | null {
  if (!value || !Number.isFinite(value)) return null;
  return new Date(value * 1000);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const subscriptionId = String(
      body.subscriptionId || body.razorpaySubscriptionId || "",
    ).trim();
    const cancelAtCycleEnd = Boolean(body.cancelAtCycleEnd);

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "subscriptionId is required" },
        { status: 400 },
      );
    }

    await connectDB();
    const subscription = await Subscription.findOne({
      razorpaySubscriptionId: subscriptionId,
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );
    }

    if (
      subscription.status === "cancelled" ||
      subscription.status === "completed" ||
      subscription.status === "expired"
    ) {
      return NextResponse.json({
        ok: true,
        status: subscription.status,
        razorpaySubscriptionId: subscription.razorpaySubscriptionId,
      });
    }

    const rzSub = await cancelSubscription(subscriptionId, cancelAtCycleEnd);

    // Immediate cancel → cancelled; cancel_at_cycle_end may stay active until period end.
    const nextStatus =
      rzSub.status === "cancelled" || !cancelAtCycleEnd
        ? "cancelled"
        : subscription.status;

    subscription.status = nextStatus;
    subscription.paidCount = rzSub.paid_count ?? subscription.paidCount;
    subscription.currentStart = unixToDate(rzSub.current_start);
    subscription.currentEnd = unixToDate(rzSub.current_end);
    subscription.raw = rzSub;
    await subscription.save();

    return NextResponse.json({
      ok: true,
      status: subscription.status,
      razorpayStatus: rzSub.status,
      razorpaySubscriptionId: subscription.razorpaySubscriptionId,
      cancelAtCycleEnd,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Unable to cancel subscription",
      },
      { status: 500 },
    );
  }
}
