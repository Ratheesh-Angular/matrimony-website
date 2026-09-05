import { cache } from "react";
import { connectDB } from "@/lib/db";
import { SiteSettings } from "@/models/SiteSettings";
import { Banner } from "@/models/Banner";
import { Page } from "@/models/Page";
import { seedSettings, seedBanners, seedPages } from "@/content/seed";
import { siteConfig } from "@/site.config";

let seedPromise: Promise<void> | null = null;

/** Ensure defaults exist so the public site works on first request. */
export async function ensureSeeded() {
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    await connectDB();

    const settings = await SiteSettings.findOne();
    if (!settings) {
      await SiteSettings.create(seedSettings);
    }

    const bannerCount = await Banner.countDocuments();
    if (bannerCount === 0) {
      await Banner.insertMany(seedBanners);
    }

    for (const page of seedPages) {
      const exists = await Page.findOne({ slug: page.slug });
      if (!exists) {
        await Page.create(page);
      }
    }
  })().catch((err) => {
    seedPromise = null;
    throw err;
  });

  return seedPromise;
}

/** Deduped within a single RSC request so layout + pages share one DB round-trip. */
export const getSiteSettings = cache(async () => {
  await ensureSeeded();
  const doc = await SiteSettings.findOne().lean();
  if (!doc) {
    return {
      ...seedSettings,
      socialLinks: { ...seedSettings.socialLinks },
    };
  }
  return doc;
});

export async function getActiveBanners() {
  await ensureSeeded();
  return Banner.find({ active: true }).sort({ order: 1 }).lean();
}

/** Single site banner for the landing hero (caller decides active / show flags). */
export async function getSiteBanner() {
  await ensureSeeded();
  return Banner.findOne().sort({ order: 1 }).lean();
}

export async function getPageBySlug(slug: string) {
  await ensureSeeded();
  return Page.findOne({ slug, published: true }).lean();
}

export function resolveWhatsappNumber(settingsWhatsapp?: string | null) {
  return (settingsWhatsapp || siteConfig.whatsappNumber || "").replace(/\D/g, "");
}

export function buildWhatsappUrl(number: string, message?: string) {
  const text = encodeURIComponent(
    message || siteConfig.whatsappDefaultMessage,
  );
  return `https://wa.me/${number}?text=${text}`;
}

export function buildMapEmbedUrl(opts: {
  embedUrl?: string | null;
  lat?: number | null;
  lng?: number | null;
  zoom?: number | null;
}) {
  if (opts.embedUrl) return opts.embedUrl;
  const lat = opts.lat ?? siteConfig.map.lat;
  const lng = opts.lng ?? siteConfig.map.lng;
  const zoom = opts.zoom ?? siteConfig.map.zoom;
  return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
}
