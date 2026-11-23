import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const SubscriptionSchema = new Schema(
  {
    planId: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
      default: null,
      index: true,
    },
    razorpayPlanId: { type: String, required: true, index: true },
    razorpaySubscriptionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: [
        "created",
        "authenticated",
        "active",
        "pending",
        "halted",
        "cancelled",
        "completed",
        "expired",
      ],
      default: "created",
      index: true,
    },
    totalCount: { type: Number, required: true },
    paidCount: { type: Number, default: 0 },
    currentStart: { type: Date, default: null },
    currentEnd: { type: Date, default: null },
    customerEmail: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    notes: { type: Schema.Types.Mixed, default: {} },
    raw: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export type SubscriptionDoc = InferSchemaType<typeof SubscriptionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Subscription =
  models.Subscription || model("Subscription", SubscriptionSchema);
