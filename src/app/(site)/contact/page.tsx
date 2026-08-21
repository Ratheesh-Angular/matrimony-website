import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { RichText } from "@/components/RichText";
import { getPageBySlug, getSiteSettings } from "@/lib/site-data";
import { seedPages } from "@/content/seed";
import { siteConfig } from "@/site.config";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getPageBySlug("contact");
    if (page) {
      return {
        title: page.seoTitle || page.title,
        description: page.seoDescription || siteConfig.description,
      };
    }
  } catch {
    /* fallback */
  }
  const seed = seedPages.find((p) => p.slug === "contact")!;
  return { title: seed.seoTitle, description: seed.seoDescription };
}

export default async function ContactPage() {
  let title = "Contact us";
  let body = seedPages.find((p) => p.slug === "contact")!.body;
  let phone = siteConfig.contact.phone;
  let email = siteConfig.contact.email;
  let hours = siteConfig.contact.hours;

  try {
    const [page, settings] = await Promise.all([
      getPageBySlug("contact"),
      getSiteSettings(),
    ]);
    if (page) {
      title = page.title;
      body = page.body;
    }
    phone = settings.phone || phone;
    email = settings.email || email;
    hours = settings.hours || hours;
  } catch {
    /* fallback */
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <h1 className="font-display text-4xl font-semibold text-[var(--primary)]">{title}</h1>
          <div className="mt-6">
            <RichText content={body} />
          </div>
          <ul className="mt-8 space-y-2 text-sm">
            <li>
              <span className="font-semibold">Phone:</span> {phone}
            </li>
            <li>
              <span className="font-semibold">Email:</span> {email}
            </li>
            <li>
              <span className="font-semibold">Hours:</span> {hours}
            </li>
          </ul>
        </div>
        {siteConfig.features.contactForm ? (
          <ContactForm type="contact" title="Send a message" />
        ) : null}
      </div>
    </div>
  );
}
