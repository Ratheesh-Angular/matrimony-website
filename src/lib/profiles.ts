import { connectDB } from "@/lib/db";
import type { MarriageProfileDoc } from "@/models/MarriageProfile";
import { MarriageProfile } from "@/models/MarriageProfile";

export type ProfileStatus = "new" | "approved" | "rejected";

export type ProfilePublic = {
  _id: string;
  registrationNumber: string;
  registrationDate: string;
  gender: "male" | "female";
  name: string;
  dateOfBirth: string;
  timeOfBirth: string;
  birthPlace: string;
  nakshatram: string;
  rasi: string;
  lagnam: string;
  education: string;
  occupation: string;
  salary: string;
  height: string;
  complexion: string;
  parents: string;
  siblings: string;
  community: string;
  gothram: string;
  address: {
    doorNo: string;
    street: string;
    village: string;
    taluk: string;
    district: string;
    pincode: string;
  };
  contactNumber: string;
  expectations: string;
  photoUrl: string;
  horoscope: {
    rasi: string[][];
    amsam: string[][];
  };
  status: ProfileStatus;
  createdAt?: string;
};

function str(v: unknown) {
  return v == null ? "" : String(v);
}

/** Map legacy reviewed/archived values to the new status vocabulary. */
export function normalizeProfileStatus(status: string): ProfileStatus {
  if (status === "approved" || status === "reviewed") return "approved";
  if (status === "rejected" || status === "archived") return "rejected";
  return "new";
}

export function serializeProfile(doc: MarriageProfileDoc): ProfilePublic {
  const addr = doc.address || {};
  const h = doc.horoscope || { rasi: [], amsam: [] };
  return {
    _id: String(doc._id),
    registrationNumber: str(doc.registrationNumber),
    registrationDate: str(doc.registrationDate),
    gender: doc.gender === "female" ? "female" : "male",
    name: str(doc.name),
    dateOfBirth: str(doc.dateOfBirth),
    timeOfBirth: str(doc.timeOfBirth),
    birthPlace: str(doc.birthPlace),
    nakshatram: str(doc.nakshatram),
    rasi: str(doc.rasi),
    lagnam: str(doc.lagnam),
    education: str(doc.education),
    occupation: str(doc.occupation),
    salary: str(doc.salary),
    height: str(doc.height),
    complexion: str(doc.complexion),
    parents: str(doc.parents),
    siblings: str(doc.siblings),
    community: str(doc.community),
    gothram: str(doc.gothram),
    address: {
      doorNo: str((addr as { doorNo?: string }).doorNo),
      street: str((addr as { street?: string }).street),
      village: str((addr as { village?: string }).village),
      taluk: str((addr as { taluk?: string }).taluk),
      district: str((addr as { district?: string }).district),
      pincode: str((addr as { pincode?: string }).pincode),
    },
    contactNumber: str(doc.contactNumber),
    expectations: str(doc.expectations),
    photoUrl: str(doc.photoUrl),
    horoscope: {
      rasi: Array.isArray(h.rasi)
        ? h.rasi.map((house) => (Array.isArray(house) ? house.map(String) : []))
        : Array.from({ length: 12 }, () => []),
      amsam: Array.isArray(h.amsam)
        ? h.amsam.map((house) => (Array.isArray(house) ? house.map(String) : []))
        : Array.from({ length: 12 }, () => []),
    },
    status: normalizeProfileStatus(str(doc.status) || "new"),
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : doc.createdAt
          ? String(doc.createdAt)
          : undefined,
  };
}

export function formatAddress(a: ProfilePublic["address"]): string {
  const parts = [
    a.doorNo,
    a.street,
    a.village,
    a.taluk ? `${a.taluk} taluk` : "",
    a.district ? `${a.district} District` : "",
    a.pincode ? `Pincode- ${a.pincode}` : "",
  ].filter(Boolean);
  return parts.join(", ");
}

export async function getApprovedProfiles(limit = 12): Promise<ProfilePublic[]> {
  await connectDB();
  const docs = await MarriageProfile.find({
    status: { $in: ["approved", "reviewed"] },
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return docs.map((d) =>
    serializeProfile(d as unknown as Parameters<typeof serializeProfile>[0]),
  );
}
