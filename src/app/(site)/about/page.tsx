import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buildWhatsappUrl, resolveWhatsappNumber, getSiteSettings } from "@/lib/site-data";
import { siteConfig } from "@/site.config";

export const dynamic = "force-dynamic";

const DISTRICTS = [
  "சேலம்",
  "திருநெல்வேலி",
  "கோயம்புத்தூர்",
  "புதுக்கோட்டை",
  "சென்னை",
  "தூத்துக்குடி",
  "மற்றும் பிற மாவட்டங்கள்",
];

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "About",
    description: siteConfig.description,
  };
}

export default async function AboutPage() {
  let whatsapp = siteConfig.whatsappNumber;
  try {
    const settings = await getSiteSettings();
    whatsapp = resolveWhatsappNumber(settings.whatsappNumber);
  } catch {
    /* use config fallback */
  }

  const whatsappHref = whatsapp
    ? buildWhatsappUrl(whatsapp)
    : "/contact";

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
          <div className="relative mb-6 h-28 w-28 overflow-hidden rounded-full ring-2 ring-[#1a3a5c]/15 shadow-md sm:h-36 sm:w-36 animate-rise">
            <Image
              src={siteConfig.logoPath}
              alt={siteConfig.businessName}
              fill
              className="object-cover"
              sizes="144px"
              priority
            />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0056b3] animate-rise-delay">
            About us
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-[#1a3a5c] sm:text-5xl animate-rise-delay">
            {siteConfig.businessName}
          </h1>
          <p className="mt-2 text-sm font-medium text-[#9b1b2e] sm:text-base animate-rise-delay">
            {siteConfig.tagline}
          </p>
          <p className="font-tamil mt-5 max-w-2xl text-base leading-relaxed text-[#1a3a5c]/85 sm:text-lg animate-rise-delay-2">
            முதலியார் மற்றும் சைவ வேளாளர் குடும்பங்களுக்கான நம்பகமான திருமண
            சேவை — மாவட்ட அமைப்புகளுடன் இணைந்து, விரைவாகவும் தெளிவாகவும்
            வரன் முடிவுகள்.
          </p>
        </div>
      </section>

      {/* Service */}
      <section className="relative border-y border-[#1a3a5c]/8 bg-[#1a3a5c] text-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-14">
          <p className="font-tamil text-sm font-semibold uppercase tracking-wide text-white/60">
            சேவை
          </p>
          <p className="font-tamil mt-3 max-w-3xl text-xl font-medium leading-relaxed sm:text-2xl">
            திருமண வரன்கள் விரைவில் முடிவு செய்து தரப்படும்.
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
            We help families find suitable matches quickly, with clear communication
            and careful follow-through from enquiry to final decision.
          </p>
        </div>
      </section>

      {/* How we work + Experience */}
      <section className="relative mx-auto grid max-w-5xl gap-12 px-4 py-14 sm:px-6 sm:py-16 md:grid-cols-2 md:gap-16">
        <div>
          <h2 className="font-tamil text-xl font-bold text-[#d93025] sm:text-2xl">
            செயல்பாடு
          </h2>
          <p className="font-tamil mt-4 text-base leading-relaxed text-[#1a3a5c]/90">
            மாவட்டங்கள் தோறும் செயல்படும் முதலியார் மற்றும் சைவ வேளாளர்
            அமைப்புகளுடன் இணைந்து செயல்படுவது.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            We work alongside local Mudaliar and Saiva Vellalar organizations in each
            district so introductions stay community-rooted and trustworthy.
          </p>
        </div>
        <div>
          <h2 className="font-tamil text-xl font-bold text-[#d93025] sm:text-2xl">
            அனுபவம்
          </h2>
          <p className="mt-4 font-display text-5xl font-semibold text-[#1a3a5c] sm:text-6xl">
            10+
          </p>
          <p className="font-tamil mt-2 text-base text-[#1a3a5c]/90">
            ஆண்டுகள் அனுபவம்
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            Over a decade guiding families through matrimony with patience, discretion,
            and practical support.
          </p>
        </div>
      </section>

      {/* Districts */}
      <section className="relative border-y border-[#1a3a5c]/8 bg-white/50">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-16">
          <h2 className="font-tamil text-xl font-bold text-[#d93025] sm:text-2xl">
            செயல்படும் மாவட்டங்கள்
          </h2>
          <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">
            Active across Tamil Nadu — and growing.
          </p>
          <ul className="mt-8 flex flex-wrap gap-x-3 gap-y-3">
            {DISTRICTS.map((name) => (
              <li
                key={name}
                className="font-tamil border-b-2 border-[#0056b3]/25 pb-1 text-base font-medium text-[#1a3a5c] sm:text-lg"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Why us */}
      <section className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-16">
        <h2 className="font-display text-2xl font-semibold text-[#1a3a5c] sm:text-3xl">
          Why families choose us
        </h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Community focus",
              body: "Dedicated to Mudaliar and Saiva Vellalar families, with respect for tradition and values.",
            },
            {
              title: "District network",
              body: "Connected with local organizations so matches are grounded in real community ties.",
            },
            {
              title: "Clear process",
              body: "From biodata registration to introductions — we keep steps simple and responses prompt.",
            },
          ].map((item) => (
            <li key={item.title}>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#0056b3]">
                {item.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Address + CTAs */}
      <section className="relative border-t border-[#1a3a5c]/8 bg-[#fffef8]">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-16">
          <h2 className="font-tamil text-xl font-bold text-[#d93025] sm:text-2xl">
            அலுவலக முகவரி
          </h2>
          <p className="font-tamil mt-4 max-w-md text-base leading-relaxed text-[#1a3a5c]">
            {siteConfig.contact.address}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Office hours: {siteConfig.contact.hours}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/#biodata-form"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#9b1b2e] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
            >
              வரன் பதிவு
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#1a3a5c] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Contact
            </Link>
            <Link
              href="/location"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#1a3a5c]/25 bg-white px-5 py-2.5 text-sm font-semibold text-[#1a3a5c] transition hover:bg-[#1a3a5c]/5"
            >
              Location
            </Link>
            {siteConfig.features.whatsapp ? (
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
