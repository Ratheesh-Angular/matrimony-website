import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { verifySubscriptionSignature } from "@/lib/razorpay";
import { Subscription } from "@/models/Subscription";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const paymentId = String(body.razorpay_payment_id || "").trim();
    const subscriptionId = String(body.razorpay_subscription_id || "").trim();
    const signature = String(body.razorpay_signature || "").trim();

    if (!paymentId || !subscriptionId || !signature) {
      return NextResponse.json(
        {
          error:
            "razorpay_payment_id, razorpay_subscription_id, and razorpay_signature are required",
        },
        { status: 400 },
      );
    }

    const valid = await verifySubscriptionSignature({
      paymentId,
      subscriptionId,
      signature,
    });

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid subscription signature" },
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

    // Checkout success means mandate/auth succeeded; webhook finalizes active/charged.
    if (
      subscription.status === "created" ||
      subscription.status === "pending"
    ) {
      subscription.status = "authenticated";
    }

    subscription.raw = {
      ...(typeof subscription.raw === "object" && subscription.raw
        ? subscription.raw
        : {}),
      lastVerifyPaymentId: paymentId,
      verifiedAt: new Date().toISOString(),
    };
    await subscription.save();

    return NextResponse.json({
      ok: true,
      subscriptionId: subscription._id,
      razorpaySubscriptionId: subscription.razorpaySubscriptionId,
      status: subscription.status,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Unable to verify subscription",
      },
      { status: 500 },
    );
  }
}
