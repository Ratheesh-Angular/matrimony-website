import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { GalleryItem } from "@/models/GalleryItem";

export async function GET() {
  try {
    await connectDB();
    const items = await GalleryItem.find({ active: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return NextResponse.json(
      items.map((item) => ({
        _id: item._id.toString(),
        mediaType: item.mediaType,
        url: item.url,
        title: item.title || "",
        order: item.order ?? 0,
      })),
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unable to load gallery." }, { status: 500 });
  }
}
