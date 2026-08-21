import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Banner } from "@/models/Banner";
import { ensureSeeded } from "@/lib/site-data";

function bannerPayload(body: Record<string, unknown>) {
  const showTitle = body.showTitle !== false;
  const showSubtitle = body.showSubtitle !== false;
  const showCta = body.showCta !== false;
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";

  return {
    title: typeof body.title === "string" ? body.title : "",
    subtitle: typeof body.subtitle === "string" ? body.subtitle : "",
    imageUrl,
    ctaLabel: typeof body.ctaLabel === "string" ? body.ctaLabel : "",
    ctaHref: typeof body.ctaHref === "string" ? body.ctaHref : "",
    showTitle,
    showSubtitle,
    showCta,
    order: Number(body.order) || 0,
    active: body.active !== false,
  };
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await ensureSeeded();
  const banners = await Banner.find().sort({ order: 1 }).lean();
  return NextResponse.json(banners);
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();

  const existing = await Banner.findOne().sort({ order: 1 });
  if (existing) {
    return NextResponse.json(
      { error: "Banner already exists; update it instead" },
      { status: 409 },
    );
  }

  const body = await request.json();
  const data = bannerPayload(body);
  if (!data.imageUrl) {
    return NextResponse.json({ error: "imageUrl required" }, { status: 400 });
  }

  const banner = await Banner.create(data);
  return NextResponse.json(banner, { status: 201 });
}
