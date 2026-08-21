import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RichText } from "@/components/RichText";
import { getPageBySlug } from "@/lib/site-data";
import { siteConfig } from "@/site.config";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const RESERVED = new Set([
  "about",
  "contact",
  "location",
  "admin",
  "api",
  "userdata",
  "profile-details",
]);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (RESERVED.has(slug)) return {};
  try {
    const page = await getPageBySlug(slug);
    if (!page) return { title: "Not found" };
    return {
      title: page.seoTitle || page.title,
      description: page.seoDescription || siteConfig.description,
    };
  } catch {
    return { title: siteConfig.businessName };
  }
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params;
  if (RESERVED.has(slug)) notFound();

  let page = null;
  try {
    page = await getPageBySlug(slug);
  } catch {
    notFound();
  }
  if (!page) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="font-display text-4xl font-semibold text-[var(--primary)]">{page.title}</h1>
      <div className="mt-8">
        <RichText content={page.body} />
      </div>
    </div>
  );
}
