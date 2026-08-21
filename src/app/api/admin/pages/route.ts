import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Page } from "@/models/Page";
import { ensureSeeded } from "@/lib/site-data";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await ensureSeeded();
  const pages = await Page.find().sort({ slug: 1 }).lean();
  return NextResponse.json(pages);
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const body = await request.json();
  const slug = String(body.slug || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");
  if (!slug || !body.title) {
    return NextResponse.json({ error: "slug and title required" }, { status: 400 });
  }
  const page = await Page.create({
    slug,
    title: body.title,
    body: body.body || "",
    seoTitle: body.seoTitle || "",
    seoDescription: body.seoDescription || "",
    published: body.published !== false,
  });
  return NextResponse.json(page, { status: 201 });
}
