import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { formatRegistrationNumber } from "@/lib/biodata";
import { MarriageProfile } from "@/models/MarriageProfile";

export async function GET() {
  try {
    await connectDB();
    const count = await MarriageProfile.countDocuments();
    return NextResponse.json({
      registrationNumber: formatRegistrationNumber(count + 1),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Unable to load next registration number." },
      { status: 500 },
    );
  }
}
