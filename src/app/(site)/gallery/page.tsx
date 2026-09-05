import type { Metadata } from "next";
import { GalleryGrid, type PublicGalleryItem } from "@/components/gallery/GalleryGrid";
import { connectDB } from "@/lib/db";
import { GalleryItem } from "@/models/GalleryItem";
import { siteConfig } from "@/site.config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery",
  description: `Photos and videos from ${siteConfig.businessName}`,
};

export default async function GalleryPage() {
  let items: PublicGalleryItem[] = [];

  try {
    await connectDB();
    const docs = await GalleryItem.find({ active: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    items = docs.map((doc) => ({
      _id: doc._id.toString(),
      mediaType: doc.mediaType as "image" | "video",
      url: doc.url,
      title: doc.title || "",
    }));
  } catch {
    items = [];
  }

  return (
    <div className="min-h-[60vh] bg-[linear-gradient(165deg,#f8f1e4_0%,#fffef8_45%,#e8f0fa_100%)]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="mb-10 text-center animate-fade-up">
          <h1 className="font-tamil text-3xl font-bold text-[var(--primary)] sm:text-4xl">
            புகைப்பட தொகுப்பு
          </h1>
          <p className="mt-2 font-display text-xl text-[var(--accent)]">Gallery</p>
          <p className="mx-auto mt-3 max-w-md text-sm text-[var(--muted)]">
            Moments from our matrimony community — photos and videos shared by the team.
          </p>
        </header>

        <GalleryGrid items={items} />
      </div>
    </div>
  );
}
