import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

export type PaymentStatus = "unpaid" | "pending_review" | "approved" | "rejected";

const MemberSchema = new Schema(
  {
    name: { type: String, default: "", trim: true },
    phone: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    isPremium: { type: Boolean, default: false, index: true },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending_review", "approved", "rejected"],
      default: "unpaid",
      index: true,
    },
    paymentSubmittedAt: { type: Date, default: null },
    paymentReference: { type: String, default: "", trim: true },
    paymentReviewedAt: { type: Date, default: null },
    premiumPaidAt: { type: Date, default: null },
    premiumPaymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
    razorpayOrderId: { type: String, default: "" },
    razorpayPaymentId: { type: String, default: "" },
  },
  { timestamps: true },
);

export type MemberDoc = InferSchemaType<typeof MemberSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Member = models.Member || model("Member", MemberSchema);
