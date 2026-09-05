import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { GalleryItem } from "@/models/GalleryItem";

function serialize(item: {
  _id: { toString(): string };
  mediaType: string;
  url: string;
  publicId?: string | null;
  title?: string | null;
  order?: number | null;
  active?: boolean | null;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    _id: item._id.toString(),
    mediaType: item.mediaType,
    url: item.url,
    publicId: item.publicId || "",
    title: item.title || "",
    order: item.order ?? 0,
    active: item.active !== false,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const items = await GalleryItem.find().sort({ order: 1, createdAt: -1 }).lean();
    return NextResponse.json(items.map((item) => serialize(item)));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unable to load gallery." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const url = typeof body.url === "string" ? body.url.trim() : "";
    const mediaType = body.mediaType === "video" ? "video" : body.mediaType === "image" ? "image" : "";
    const publicId = typeof body.publicId === "string" ? body.publicId.trim() : "";
    const title = typeof body.title === "string" ? body.title.trim() : "";

    if (!url || !mediaType) {
      return NextResponse.json({ error: "url and mediaType required" }, { status: 400 });
    }

    await connectDB();
    const last = await GalleryItem.findOne().sort({ order: -1 }).lean();
    const order = typeof body.order === "number" ? body.order : (last?.order ?? 0) + 1;

    const item = await GalleryItem.create({
      url,
      mediaType,
      publicId,
      title,
      order,
      active: body.active !== false,
    });

    return NextResponse.json(serialize(item), { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unable to create gallery item." }, { status: 500 });
  }
}
