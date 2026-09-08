import { NextResponse } from "next/server";
import { allocateNextRegistrationNumber } from "@/lib/profiles";

export async function GET() {
  try {
    const registrationNumber = await allocateNextRegistrationNumber();
    return NextResponse.json({ registrationNumber });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Unable to load next registration number." },
      { status: 500 },
    );
  }
}
