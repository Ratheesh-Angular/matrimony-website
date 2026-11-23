import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const PlanSchema = new Schema(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    period: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: true,
    },
    interval: { type: Number, required: true, min: 1 },
    description: { type: String, default: "" },
    razorpayPlanId: { type: String, required: true, unique: true, index: true },
    active: { type: Boolean, default: true, index: true },
    notes: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export type PlanDoc = InferSchemaType<typeof PlanSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Plan = models.Plan || model("Plan", PlanSchema);
