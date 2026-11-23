import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import {
  createSubscription,
  getPublicRazorpayKeyId,
} from "@/lib/razorpay";
import { Plan, type PlanDoc } from "@/models/Plan";
import { Subscription } from "@/models/Subscription";

function asNotes(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  const notes: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (typeof entry === "string") notes[key] = entry;
  }
  return Object.keys(notes).length ? notes : undefined;
}

function unixToDate(value?: number | null): Date | null {
  if (!value || !Number.isFinite(value)) return null;
  return new Date(value * 1000);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const planId = String(body.planId || "").trim();
    const razorpayPlanIdInput = String(body.razorpayPlanId || "").trim();
    const totalCount = Number(body.totalCount ?? 12);
    const customerEmail = String(body.customerEmail || "").trim();
    const customerPhone = String(body.customerPhone || "").trim();
    const notes = asNotes(body.notes);

    if (!Number.isInteger(totalCount) || totalCount < 1) {
      return NextResponse.json(
        { error: "totalCount must be an integer >= 1" },
        { status: 400 },
      );
    }

    if (!planId && !razorpayPlanIdInput) {
      return NextResponse.json(
        { error: "planId or razorpayPlanId is required" },
        { status: 400 },
      );
    }

    const keyId = getPublicRazorpayKeyId();
    if (!keyId) {
      return NextResponse.json(
        { error: "Razorpay public key is not configured" },
        { status: 500 },
      );
    }

    await connectDB();

    let localPlan: PlanDoc | null = null;
    let razorpayPlanId = razorpayPlanIdInput;

    if (planId) {
      if (!mongoose.Types.ObjectId.isValid(planId)) {
        return NextResponse.json({ error: "Invalid planId" }, { status: 400 });
      }
      localPlan = await Plan.findById(planId);
      if (!localPlan || !localPlan.active) {
        return NextResponse.json(
          { error: "Plan not found or inactive" },
          { status: 404 },
        );
      }
      razorpayPlanId = localPlan.razorpayPlanId;
    } else {
      localPlan = await Plan.findOne({
        razorpayPlanId: razorpayPlanIdInput,
        active: true,
      });
    }

    if (!razorpayPlanId) {
      return NextResponse.json(
        { error: "Unable to resolve Razorpay plan id" },
        { status: 400 },
      );
    }

    const rzSub = await createSubscription({
      plan_id: razorpayPlanId,
      total_count: totalCount,
      customer_notify: 1,
      notes,
    });

    const subscription = await Subscription.create({
      planId: localPlan?._id ?? null,
      razorpayPlanId,
      razorpaySubscriptionId: rzSub.id,
      status: "created",
      totalCount: rzSub.total_count,
      paidCount: rzSub.paid_count || 0,
      currentStart: unixToDate(rzSub.current_start),
      currentEnd: unixToDate(rzSub.current_end),
      customerEmail,
      customerPhone,
      notes: rzSub.notes || notes || {},
      raw: rzSub,
    });

    return NextResponse.json({
      subscriptionId: rzSub.id,
      localSubscriptionId: subscription._id,
      planId: localPlan?._id ?? null,
      razorpayPlanId,
      keyId,
      status: subscription.status,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Unable to create subscription",
      },
      { status: 500 },
    );
  }
}
