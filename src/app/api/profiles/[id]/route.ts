import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { isProfileGateAuthenticated } from "@/lib/profile-gate-auth";
import { serializeProfile } from "@/lib/profiles";
import { MarriageProfile } from "@/models/MarriageProfile";

type Props = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Props) {
  if (!(await isProfileGateAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await connectDB();
    const doc = await MarriageProfile.findById(id).lean();
    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(
      serializeProfile(doc as unknown as Parameters<typeof serializeProfile>[0]),
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Unable to load profile." },
      { status: 500 },
    );
  }
}
