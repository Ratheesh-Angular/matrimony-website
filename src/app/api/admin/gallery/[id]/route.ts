import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { isAdminAuthenticated } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { destroyCloudinaryAsset } from "@/lib/upload";
import { GalleryItem } from "@/models/GalleryItem";

type Props = { params: Promise<{ id: string }> };

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

export async function PATCH(request: Request, { params }: Props) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const update: Record<string, unknown> = {};
    if (typeof body.title === "string") update.title = body.title.trim();
    if (typeof body.order === "number") update.order = body.order;
    if (typeof body.active === "boolean") update.active = body.active;

    await connectDB();
    const item = await GalleryItem.findByIdAndUpdate(id, update, {
      returnDocument: "after",
    }).lean();
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(serialize(item));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unable to update gallery item." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await connectDB();
    const item = await GalleryItem.findByIdAndDelete(id);
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (item.publicId) {
      try {
        await destroyCloudinaryAsset(
          item.publicId,
          item.mediaType === "video" ? "video" : "image",
        );
      } catch (err) {
        console.error("Cloudinary delete failed:", err);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unable to delete gallery item." }, { status: 500 });
  }
}
