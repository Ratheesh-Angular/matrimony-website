import mongoose, { Schema, models, model, type InferSchemaType } from "mongoose";

const AddressSchema = new Schema(
  {
    doorNo: { type: String, default: "" },
    street: { type: String, default: "" },
    village: { type: String, default: "" },
    taluk: { type: String, default: "" },
    district: { type: String, default: "" },
    pincode: { type: String, default: "" },
  },
  { _id: false },
);

const HoroscopeSchema = new Schema(
  {
    rasi: {
      type: [[String]],
      default: () => Array.from({ length: 12 }, () => []),
    },
    amsam: {
      type: [[String]],
      default: () => Array.from({ length: 12 }, () => []),
    },
  },
  { _id: false },
);

const MarriageProfileSchema = new Schema(
  {
    registrationNumber: { type: String, required: true, unique: true },
    registrationDate: { type: String, required: true },
    gender: { type: String, enum: ["male", "female"], required: true },
    name: { type: String, required: true },
    dateOfBirth: { type: String, default: "" },
    timeOfBirth: { type: String, default: "" },
    birthPlace: { type: String, default: "" },
    nakshatram: { type: String, default: "" },
    rasi: { type: String, default: "" },
    lagnam: { type: String, default: "" },
    education: { type: String, default: "" },
    occupation: { type: String, default: "" },
    salary: { type: String, default: "" },
    height: { type: String, default: "" },
    complexion: { type: String, default: "" },
    parents: { type: String, default: "" },
    siblings: { type: String, default: "" },
    community: { type: String, default: "" },
    gothram: { type: String, default: "" },
    address: { type: AddressSchema, default: () => ({}) },
    contactNumber: { type: String, default: "" },
    expectations: { type: String, default: "" },
    photoUrl: { type: String, default: "" },
    horoscope: {
      type: HoroscopeSchema,
      default: () => ({
        rasi: Array.from({ length: 12 }, () => []),
        amsam: Array.from({ length: 12 }, () => []),
      }),
    },
    status: {
      type: String,
      enum: ["new", "approved", "rejected", "reviewed", "archived"],
      default: "new",
    },
  },
  { timestamps: true },
);

export type MarriageProfileDoc = InferSchemaType<typeof MarriageProfileSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
};

if (models.MarriageProfile) {
  delete models.MarriageProfile;
}

export const MarriageProfile = model("MarriageProfile", MarriageProfileSchema);
