import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const MemberSchema = new Schema(
  {
    phone: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    isPremium: { type: Boolean, default: false, index: true },
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
