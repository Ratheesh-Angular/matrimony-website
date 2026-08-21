import type { Metadata } from "next";
import { MapEmbed } from "@/components/MapEmbed";
import { RichText } from "@/components/RichText";
import {
  buildMapEmbedUrl,
  getPageBySlug,
  getSiteSettings,
} from "@/lib/site-data";
import { seedPages } from "@/content/seed";
import { siteConfig } from "@/site.config";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getPageBySlug("location");
    if (page) {
      return {
        title: page.seoTitle || page.title,
        description: page.seoDescription || siteConfig.description,
      };
    }
  } catch {
    /* fallback */
  }
  const seed = seedPages.find((p) => p.slug === "location")!;
  return { title: seed.seoTitle, description: seed.seoDescription };
}

export default async function LocationPage() {
  let title = "Find us";
  let body = seedPages.find((p) => p.slug === "location")!.body;
  let address = siteConfig.contact.address;
  let hours = siteConfig.contact.hours;
  let embedUrl = buildMapEmbedUrl(siteConfig.map);

  try {
    const [page, settings] = await Promise.all([
      getPageBySlug("location"),
      getSiteSettings(),
    ]);
    if (page) {
      title = page.title;
      body = page.body;
    }
    address = settings.address || address;
    hours = settings.hours || hours;
    embedUrl = buildMapEmbedUrl({
      embedUrl: settings.mapEmbedUrl,
      lat: settings.mapLat,
      lng: settings.mapLng,
      zoom: settings.mapZoom,
    });
  } catch {
    /* fallback */
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl font-semibold text-[var(--primary)]">{title}</h1>
      <div className="mt-6 max-w-3xl">
        <RichText content={body} />
      </div>
      <div className="mt-6 space-y-1 text-sm">
        <p>
          <span className="font-semibold">Address:</span> {address}
        </p>
        <p>
          <span className="font-semibold">Hours:</span> {hours}
        </p>
      </div>
      <div className="mt-10">
        <MapEmbed embedUrl={embedUrl} />
      </div>
    </div>
  );
}
