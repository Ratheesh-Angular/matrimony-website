import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const BannerSchema = new Schema(
  {
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    imageUrl: { type: String, required: true },
    ctaLabel: { type: String, default: "" },
    ctaHref: { type: String, default: "" },
    showTitle: { type: Boolean, default: true },
    showSubtitle: { type: Boolean, default: true },
    showCta: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type BannerDoc = InferSchemaType<typeof BannerSchema> & {
  _id: mongoose.Types.ObjectId;
};

// Drop cached model so schema changes apply under Next.js HMR
if (models.Banner) {
  delete models.Banner;
}

export const Banner = model("Banner", BannerSchema);
