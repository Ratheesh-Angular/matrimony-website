import type { Metadata } from "next";
import Link from "next/link";
import {
  buildWhatsappUrl,
  resolveWhatsappNumber,
  getPageBySlug,
  getSiteSettings,
} from "@/lib/site-data";
import { seedPages } from "@/content/seed";
import { siteConfig } from "@/site.config";

export const dynamic = "force-dynamic";

const HELP_ITEMS = [
  {
    title: "வரன் பதிவு",
    titleEn: "Biodata registration",
    body: "Register a biodata online or call us — we guide families through the next steps with clear follow-up.",
  },
  {
    title: "பொருத்தம் விசாரணை",
    titleEn: "Match enquiry",
    body: "Ask about approved profiles or a specific match. We reply promptly by phone or WhatsApp.",
  },
  {
    title: "அலுவலக வருகை",
    titleEn: "Office visit",
    body: "Visit during business hours. Prefer an appointment so we can give your family focused time.",
  },
];

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

function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export default async function ContactPage() {
  let title = "Contact us";
  let phone = siteConfig.contact.phone;
  let email = siteConfig.contact.email;
  let hours = siteConfig.contact.hours;
  let address = siteConfig.contact.address;
  let whatsapp = siteConfig.whatsappNumber;
  let socialLinks = { ...siteConfig.socialLinks };

  try {
    const [page, settings] = await Promise.all([
      getPageBySlug("contact"),
      getSiteSettings(),
    ]);
    if (page) {
      title = page.title;
    }
    phone = settings.phone || phone;
    email = settings.email || email;
    hours = settings.hours || hours;
    address = settings.address || address;
    whatsapp = resolveWhatsappNumber(settings.whatsappNumber);
    socialLinks = {
      facebook: settings.socialLinks?.facebook || socialLinks.facebook,
      youtube: settings.socialLinks?.youtube || socialLinks.youtube,
      instagram: settings.socialLinks?.instagram || socialLinks.instagram,
      x: settings.socialLinks?.x || socialLinks.x,
    };
  } catch {
    /* fallback */
  }

  const whatsappHref = whatsapp ? buildWhatsappUrl(whatsapp) : null;
  const socialEntries = (
    [
      { key: "facebook", label: "Facebook", href: socialLinks.facebook },
      { key: "youtube", label: "YouTube", href: socialLinks.youtube },
      { key: "instagram", label: "Instagram", href: socialLinks.instagram },
      { key: "x", label: "X", href: socialLinks.x },
    ] as const
  ).filter((s) => Boolean(s.href));

  return (
    <div className="relative overflow-hidden bg-[linear-gradient(165deg,#f8f1e4_0%,#fffef8_40%,#e8f0fa_100%)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 10%, #d93025 0, transparent 40%), radial-gradient(circle at 85% 70%, #0056b3 0, transparent 45%)",
        }}
      />

      {/* Intro */}
      <section className="relative mx-auto max-w-5xl px-4 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-20">
        <div className="flex flex-col items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0056b3] animate-rise">
            Contact
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-[#1a3a5c] sm:text-5xl animate-rise-delay">
            {title}
          </h1>
          <p className="font-tamil mt-5 max-w-2xl text-base leading-relaxed text-[#1a3a5c]/85 sm:text-lg animate-rise-delay">
            கேள்விகள் அல்லது வரன் விவரங்களுக்கு — தொலைபேசி அல்லது WhatsApp
            வழியாக எங்களை அணுகுங்கள்.
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)] animate-rise-delay-2">
            Reach {siteConfig.businessName} by phone, WhatsApp, or email. We typically
            reply within one business day.
          </p>
        </div>
      </section>

      {/* Reach us */}
      <section className="relative border-y border-[#1a3a5c]/8 bg-[#1a3a5c] text-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-14">
          <p className="font-tamil text-sm font-semibold uppercase tracking-wide text-white/60">
            தொடர்பு
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
            Reach us directly
          </h2>
          <ul className="mt-8 grid gap-6 sm:grid-cols-3 sm:gap-8">
            <li>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/55">
                Phone
              </p>
              <a
                href={telHref(phone)}
                className="mt-2 inline-flex min-h-11 items-center text-lg font-semibold text-white underline-offset-4 hover:underline sm:text-xl"
              >
                {phone}
              </a>
            </li>
            <li>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/55">
                WhatsApp
              </p>
              {whatsappHref && siteConfig.features.whatsapp ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex min-h-11 items-center text-lg font-semibold text-[#25D366] underline-offset-4 hover:underline sm:text-xl"
                >
                  Chat on WhatsApp
                </a>
              ) : (
                <p className="mt-2 text-lg font-semibold text-white/70 sm:text-xl">
                  —
                </p>
              )}
            </li>
            <li>
              <p className="text-xs font-semibold uppercase tracking-wide text-white/55">
                Email
              </p>
              <a
                href={`mailto:${email}`}
                className="mt-2 inline-flex min-h-11 max-w-full items-center break-all text-lg font-semibold text-white underline-offset-4 hover:underline sm:text-xl"
              >
                {email}
              </a>
            </li>
          </ul>
        </div>
      </section>

      {/* Office */}
      <section className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <h2 className="font-tamil text-xl font-bold text-[#d93025] sm:text-2xl">
              அலுவலக முகவரி
            </h2>
            <p className="font-tamil mt-4 max-w-md text-base leading-relaxed text-[#1a3a5c]">
              {address}
            </p>
            <p className="mt-4 text-sm text-[var(--muted)]">
              <span className="font-semibold text-[#1a3a5c]">Hours:</span> {hours}
            </p>
            <Link
              href="/location"
              className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-[#0056b3] underline-offset-4 hover:underline"
            >
              View map &amp; directions
            </Link>
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-[#1a3a5c] sm:text-2xl">
              Visit us
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
              Our office is open during the hours above. For biodata discussions or
              match follow-ups, a quick call or WhatsApp message beforehand helps us
              prepare for your visit.
            </p>
          </div>
        </div>
      </section>

      {/* How we can help */}
      <section className="relative border-y border-[#1a3a5c]/8 bg-white/50">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-16">
          <h2 className="font-display text-2xl font-semibold text-[#1a3a5c] sm:text-3xl">
            How we can help
          </h2>
          <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
            Tell us what you need — we keep the process simple and respectful.
          </p>
          <ul className="mt-8 grid gap-8 sm:grid-cols-3">
            {HELP_ITEMS.map((item) => (
              <li key={item.titleEn}>
                <p className="font-tamil text-base font-bold text-[#d93025]">
                  {item.title}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#0056b3]">
                  {item.titleEn}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Social */}
      {socialEntries.length > 0 ? (
        <section className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-16">
          <h2 className="font-display text-2xl font-semibold text-[#1a3a5c] sm:text-3xl">
            Follow us
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Updates and community posts on our social channels.
          </p>
          <ul className="mt-6 flex flex-wrap gap-3">
            {socialEntries.map((s) => (
              <li key={s.key}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#1a3a5c]/25 bg-white px-5 py-2.5 text-sm font-semibold text-[#1a3a5c] transition hover:bg-[#1a3a5c]/5"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Bottom CTAs */}
      <section className="relative border-t border-[#1a3a5c]/8 bg-[#fffef8]">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-16">
          <h2 className="font-tamil text-xl font-bold text-[#d93025] sm:text-2xl">
            அடுத்த படி
          </h2>
          <p className="mt-2 max-w-lg text-sm text-[var(--muted)]">
            Register a biodata, find us on the map, or message us on WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/#biodata-form"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#9b1b2e] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
            >
              வரன் பதிவு
            </Link>
            <Link
              href="/location"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#1a3a5c] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Location
            </Link>
            {whatsappHref && siteConfig.features.whatsapp ? (
              <Link
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#25D366]/40 bg-[#25D366]/10 px-5 py-2.5 text-sm font-semibold text-[#128C7E] transition hover:bg-[#25D366]/20"
              >
                WhatsApp
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
