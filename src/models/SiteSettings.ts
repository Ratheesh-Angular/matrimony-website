import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const SocialLinksSchema = new Schema(
  {
    facebook: { type: String, default: "" },
    instagram: { type: String, default: "" },
    youtube: { type: String, default: "" },
    x: { type: String, default: "" },
  },
  { _id: false },
);

const SiteSettingsSchema = new Schema(
  {
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    address: { type: String, default: "" },
    hours: { type: String, default: "" },
    whatsappNumber: { type: String, default: "" },
    mapLat: { type: Number, default: 0 },
    mapLng: { type: Number, default: 0 },
    mapZoom: { type: Number, default: 15 },
    mapEmbedUrl: { type: String, default: "" },
    socialLinks: { type: SocialLinksSchema, default: () => ({}) },
    summary: { type: String, default: "" },
  },
  { timestamps: true },
);

export type SiteSettingsDoc = InferSchemaType<typeof SiteSettingsSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const SiteSettings =
  models.SiteSettings || model("SiteSettings", SiteSettingsSchema);
