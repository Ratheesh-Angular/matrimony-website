import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getMemberFromSession } from "@/lib/member-auth";
import { grantPremiumFromPayment } from "@/lib/premium";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { Payment } from "@/models/Payment";

export async function POST(request: Request) {
  try {
    const member = await getMemberFromSession();
    if (!member) {
      return NextResponse.json(
        { error: "Please login to verify payment" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const orderId = String(body.razorpay_order_id || "").trim();
    const paymentId = String(body.razorpay_payment_id || "").trim();
    const signature = String(body.razorpay_signature || "").trim();

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        {
          error:
            "razorpay_order_id, razorpay_payment_id, and razorpay_signature are required",
        },
        { status: 400 },
      );
    }

    const valid = await verifyPaymentSignature({
      orderId,
      paymentId,
      signature,
    });

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 },
      );
    }

    await connectDB();
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: orderId },
      {
        $set: {
          razorpayPaymentId: paymentId,
          status: "paid",
        },
      },
      { new: true },
    );

    if (!payment) {
      return NextResponse.json(
        { error: "Payment order not found" },
        { status: 404 },
      );
    }

    const notes =
      payment.notes && typeof payment.notes === "object"
        ? (payment.notes as Record<string, unknown>)
        : {};
    const noteMemberId =
      typeof notes.memberId === "string" ? notes.memberId : "";

    if (noteMemberId && noteMemberId !== String(member._id)) {
      return NextResponse.json(
        { error: "Payment does not belong to this account" },
        { status: 403 },
      );
    }

    await grantPremiumFromPayment({
      _id: payment._id,
      notes: payment.notes,
      razorpayOrderId: payment.razorpayOrderId,
      razorpayPaymentId: payment.razorpayPaymentId,
    });

    return NextResponse.json({
      ok: true,
      paymentId: payment._id,
      razorpayOrderId: payment.razorpayOrderId,
      razorpayPaymentId: payment.razorpayPaymentId,
      status: payment.status,
      isPremium: true,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Unable to verify payment",
      },
      { status: 500 },
    );
  }
}
