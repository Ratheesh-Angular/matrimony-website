import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const PageSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    body: { type: String, default: "" },
    seoTitle: { type: String, default: "" },
    seoDescription: { type: String, default: "" },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type PageDoc = InferSchemaType<typeof PageSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Page = models.Page || model("Page", PageSchema);
