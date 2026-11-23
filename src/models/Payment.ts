import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const PaymentSchema = new Schema(
  {
    razorpayOrderId: { type: String, required: true, unique: true, index: true },
    razorpayPaymentId: { type: String, default: "", index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
      index: true,
    },
    receipt: { type: String, default: "" },
    notes: { type: Schema.Types.Mixed, default: {} },
    customerEmail: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    raw: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export type PaymentDoc = InferSchemaType<typeof PaymentSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Payment = models.Payment || model("Payment", PaymentSchema);
