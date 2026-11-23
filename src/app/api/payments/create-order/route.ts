import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getMemberFromSession } from "@/lib/member-auth";
import { getPremiumAmountPaise } from "@/lib/premium";
import {
  createOrder,
  getPublicRazorpayKeyId,
} from "@/lib/razorpay";
import { Payment } from "@/models/Payment";

export async function POST() {
  try {
    const member = await getMemberFromSession();
    if (!member) {
      return NextResponse.json(
        { error: "Please login to continue payment" },
        { status: 401 },
      );
    }

    if (member.isPremium) {
      return NextResponse.json(
        { error: "You already have lifetime premium access" },
        { status: 400 },
      );
    }

    const amount = getPremiumAmountPaise();
    const currency = "INR";
    const keyId = getPublicRazorpayKeyId();
    if (!keyId) {
      return NextResponse.json(
        { error: "Razorpay public key is not configured" },
        { status: 500 },
      );
    }

    const memberId = String(member._id);
    const notes = {
      memberId,
      purpose: "lifetime_premium",
    };
    const receipt = `prem_${memberId.slice(-8)}_${Date.now().toString(36)}`.slice(
      0,
      40,
    );

    const order = await createOrder({
      amount,
      currency,
      receipt,
      notes,
    });

    await connectDB();
    await Payment.create({
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: "created",
      receipt: order.receipt || receipt,
      notes: order.notes || notes,
      customerPhone: member.phone,
      raw: order,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Unable to create payment order",
      },
      { status: 500 },
    );
  }
}
