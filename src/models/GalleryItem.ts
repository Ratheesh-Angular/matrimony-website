import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const GalleryItemSchema = new Schema(
  {
    mediaType: { type: String, enum: ["image", "video"], required: true },
    url: { type: String, required: true },
    publicId: { type: String, default: "" },
    title: { type: String, default: "" },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type GalleryItemDoc = InferSchemaType<typeof GalleryItemSchema> & {
  _id: mongoose.Types.ObjectId;
};

if (models.GalleryItem) {
  delete models.GalleryItem;
}

export const GalleryItem = model("GalleryItem", GalleryItemSchema);
