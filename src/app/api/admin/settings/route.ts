import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { SiteSettings } from "@/models/SiteSettings";
import { ensureSeeded } from "@/lib/site-data";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await ensureSeeded();
  const settings = await SiteSettings.findOne().lean();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const body = await request.json();
  const settings = await SiteSettings.findOneAndUpdate(
    {},
    {
      phone: body.phone ?? "",
      email: body.email ?? "",
      address: body.address ?? "",
      hours: body.hours ?? "",
      whatsappNumber: body.whatsappNumber ?? "",
      mapLat: Number(body.mapLat) || 0,
      mapLng: Number(body.mapLng) || 0,
      mapZoom: Number(body.mapZoom) || 15,
      mapEmbedUrl: body.mapEmbedUrl ?? "",
      summary: body.summary ?? "",
      socialLinks: {
        facebook: body.socialLinks?.facebook ?? "",
        instagram: body.socialLinks?.instagram ?? "",
        youtube: body.socialLinks?.youtube ?? "",
        x: body.socialLinks?.x ?? "",
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  return NextResponse.json(settings);
}
