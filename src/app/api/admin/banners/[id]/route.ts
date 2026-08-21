import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Banner } from "@/models/Banner";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await connectDB();
  const body = await request.json();

  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
  if (!imageUrl) {
    return NextResponse.json({ error: "imageUrl required" }, { status: 400 });
  }

  const banner = await Banner.findByIdAndUpdate(
    id,
    {
      title: typeof body.title === "string" ? body.title : "",
      subtitle: typeof body.subtitle === "string" ? body.subtitle : "",
      imageUrl,
      ctaLabel: typeof body.ctaLabel === "string" ? body.ctaLabel : "",
      ctaHref: typeof body.ctaHref === "string" ? body.ctaHref : "",
      showTitle: body.showTitle !== false,
      showSubtitle: body.showSubtitle !== false,
      showCta: body.showCta !== false,
      order: Number(body.order) || 0,
      active: Boolean(body.active),
    },
    { new: true },
  );
  if (!banner) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(banner);
}

export async function DELETE(_request: Request, { params }: Ctx) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await connectDB();
  await Banner.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
