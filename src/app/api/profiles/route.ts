import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  formatRegistrationDate,
  normalizeChart,
} from "@/lib/biodata";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  allocateNextRegistrationNumber,
  isMongoDuplicateKeyError,
  serializeProfile,
} from "@/lib/profiles";
import { MarriageProfile } from "@/models/MarriageProfile";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const docs = await MarriageProfile.find()
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(
      docs.map((d) => serializeProfile(d as unknown as Parameters<typeof serializeProfile>[0])),
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Unable to load profiles." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const gender: "male" | "female" | null =
      body.gender === "female" ? "female" : body.gender === "male" ? "male" : null;
    const contactNumber = String(body.contactNumber || "").trim();

    if (!name) {
      return NextResponse.json({ error: "Name is required / பெயர் அவசியம்" }, { status: 400 });
    }
    if (!gender) {
      return NextResponse.json(
        { error: "Gender is required / பாலினம் அவசியம்" },
        { status: 400 },
      );
    }
    if (!contactNumber) {
      return NextResponse.json(
        { error: "Contact number is required / தொடர்பு எண் அவசியம்" },
        { status: 400 },
      );
    }

    await connectDB();
    const registrationDate = formatRegistrationDate();
    const address = body.address || {};

    const payloadBase = {
      registrationDate,
      gender,
      name,
      dateOfBirth: String(body.dateOfBirth || "").trim(),
      timeOfBirth: String(body.timeOfBirth || "").trim(),
      birthPlace: String(body.birthPlace || "").trim(),
      nakshatram: String(body.nakshatram || "").trim(),
      rasi: String(body.rasi || "").trim(),
      lagnam: String(body.lagnam || "").trim(),
      education: String(body.education || "").trim(),
      occupation: String(body.occupation || "").trim(),
      salary: String(body.salary ?? "").trim(),
      height: String(body.height || "").trim(),
      complexion: String(body.complexion || "").trim(),
      parents: String(body.parents || "").trim(),
      siblings: String(body.siblings || "").trim(),
      community: String(body.community || "").trim(),
      gothram: String(body.gothram || "").trim(),
      address: {
        doorNo: String(address.doorNo || "").trim(),
        street: String(address.street || "").trim(),
        village: String(address.village || "").trim(),
        taluk: String(address.taluk || "").trim(),
        district: String(address.district || "").trim(),
        pincode: String(address.pincode || "").trim(),
      },
      contactNumber,
      expectations: String(body.expectations || "").trim(),
      photoUrl: String(body.photoUrl || "").trim(),
      horoscope: {
        rasi: normalizeChart(body.horoscope?.rasi),
        amsam: normalizeChart(body.horoscope?.amsam),
      },
      status: "new" as const,
    };

    const maxAttempts = 2;
    let profile: InstanceType<typeof MarriageProfile> | null = null;
    let lastErr: unknown;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const registrationNumber = await allocateNextRegistrationNumber();
      try {
        profile = await MarriageProfile.create({
          ...payloadBase,
          registrationNumber,
        });
        break;
      } catch (err) {
        lastErr = err;
        if (!isMongoDuplicateKeyError(err) || attempt === maxAttempts - 1) {
          throw err;
        }
      }
    }

    if (!profile) {
      throw lastErr ?? new Error("Unable to create profile");
    }

    return NextResponse.json({
      ok: true,
      id: String(profile._id),
      registrationNumber: profile.registrationNumber,
    });
  } catch (err) {
    console.error(err);
    if (isMongoDuplicateKeyError(err)) {
      return NextResponse.json(
        {
          error:
            "Registration number conflict. Please try again / பதிவு எண் முரண்பாடு. மீண்டும் முயற்சிக்கவும்",
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: "Unable to save your profile. Please try again later." },
      { status: 500 },
    );
  }
}
