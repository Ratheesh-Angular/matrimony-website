import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const EnquirySchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    subject: { type: String, default: "" },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["contact", "enquiry"],
      default: "contact",
    },
    status: {
      type: String,
      enum: ["new", "read", "replied", "archived"],
      default: "new",
    },
  },
  { timestamps: true },
);

export type EnquiryDoc = InferSchemaType<typeof EnquirySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Enquiry = models.Enquiry || model("Enquiry", EnquirySchema);
