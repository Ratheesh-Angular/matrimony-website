import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Enquiry } from "@/models/Enquiry";
import { notifyEnquiryEmail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const message = String(body.message || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();
    const subject = String(body.subject || "").trim();
    const type = body.type === "enquiry" ? "enquiry" : "contact";

    if (!name || !message) {
      return NextResponse.json(
        { error: "Name and message are required" },
        { status: 400 },
      );
    }

    await connectDB();
    const enquiry = await Enquiry.create({
      name,
      email,
      phone,
      subject,
      message,
      type,
      status: "new",
    });

    await notifyEnquiryEmail({
      name,
      email,
      phone,
      subject,
      message,
      type,
    });

    return NextResponse.json({ ok: true, id: enquiry._id });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Unable to save your message. Please try again later." },
      { status: 500 },
    );
  }
}
