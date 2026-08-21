import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Enquiry } from "@/models/Enquiry";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const enquiries = await Enquiry.find().sort({ createdAt: -1 }).limit(200).lean();
  return NextResponse.json(enquiries);
}
