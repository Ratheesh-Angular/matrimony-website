import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  formatRegistrationDate,
  formatRegistrationNumber,
  normalizeChart,
} from "@/lib/biodata";
import { isProfileGateAuthenticated } from "@/lib/profile-gate-auth";
import { serializeProfile } from "@/lib/profiles";
import { MarriageProfile } from "@/models/MarriageProfile";

export async function GET() {
  if (!(await isProfileGateAuthenticated())) {
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
    const gender = body.gender === "female" ? "female" : body.gender === "male" ? "male" : "";
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
    const count = await MarriageProfile.countDocuments();
    const registrationNumber = formatRegistrationNumber(count + 1);
    const registrationDate = formatRegistrationDate();

    const address = body.address || {};
    const profile = await MarriageProfile.create({
      registrationNumber,
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
      status: "new",
    });

    return NextResponse.json({
      ok: true,
      id: String(profile._id),
      registrationNumber: profile.registrationNumber,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Unable to save your profile. Please try again later." },
      { status: 500 },
    );
  }
}
