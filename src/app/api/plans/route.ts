import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { createPlan, type RazorpayPeriod } from "@/lib/razorpay";
import { Plan } from "@/models/Plan";

const PERIODS = new Set<RazorpayPeriod>([
  "daily",
  "weekly",
  "monthly",
  "yearly",
]);

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

export async function GET() {
  try {
    await connectDB();
    const plans = await Plan.find({ active: true })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      plans: plans.map((plan) => ({
        id: plan._id,
        name: plan.name,
        amount: plan.amount,
        currency: plan.currency,
        period: plan.period,
        interval: plan.interval,
        description: plan.description,
        razorpayPlanId: plan.razorpayPlanId,
        active: plan.active,
      })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Unable to list plans" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const amount = Number(body.amount);
    const currency = String(body.currency || "INR").toUpperCase();
    const period = String(body.period || "").trim() as RazorpayPeriod;
    const interval = Number(body.interval ?? 1);
    const description = String(body.description || "").trim();
    const notes = asNotes(body.notes);
    const razorpayPlanIdOnly = String(body.razorpayPlanId || "").trim();

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "amount must be a positive integer in paise" },
        { status: 400 },
      );
    }

    if (currency !== "INR") {
      return NextResponse.json(
        { error: "Only INR is supported in this phase" },
        { status: 400 },
      );
    }

    if (!PERIODS.has(period)) {
      return NextResponse.json(
        { error: "period must be daily, weekly, monthly, or yearly" },
        { status: 400 },
      );
    }

    if (!Number.isInteger(interval) || interval < 1) {
      return NextResponse.json(
        { error: "interval must be an integer >= 1" },
        { status: 400 },
      );
    }

    await connectDB();

    // Allow mirroring a plan already created in the Razorpay dashboard.
    if (razorpayPlanIdOnly) {
      const existing = await Plan.findOne({
        razorpayPlanId: razorpayPlanIdOnly,
      });
      if (existing) {
        return NextResponse.json(
          { error: "Plan with this razorpayPlanId already exists" },
          { status: 409 },
        );
      }

      const plan = await Plan.create({
        name,
        amount,
        currency,
        period,
        interval,
        description,
        razorpayPlanId: razorpayPlanIdOnly,
        active: true,
        notes: notes || {},
      });

      return NextResponse.json({
        id: plan._id,
        razorpayPlanId: plan.razorpayPlanId,
        name: plan.name,
        amount: plan.amount,
        currency: plan.currency,
        period: plan.period,
        interval: plan.interval,
      });
    }

    const rzPlan = await createPlan({
      period,
      interval,
      item: {
        name,
        amount,
        currency,
        description: description || undefined,
      },
      notes,
    });

    const plan = await Plan.create({
      name,
      amount: rzPlan.item.amount,
      currency: rzPlan.item.currency,
      period: rzPlan.period,
      interval: rzPlan.interval,
      description: rzPlan.item.description || description || "",
      razorpayPlanId: rzPlan.id,
      active: true,
      notes: rzPlan.notes || notes || {},
    });

    return NextResponse.json({
      id: plan._id,
      razorpayPlanId: plan.razorpayPlanId,
      name: plan.name,
      amount: plan.amount,
      currency: plan.currency,
      period: plan.period,
      interval: plan.interval,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Unable to create plan",
      },
      { status: 500 },
    );
  }
}
