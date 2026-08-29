import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/site.config";

const CTA_HREF = "#biodata-form";
const CTA_LABEL = "வரன் பதிவு";
const HERO_IMAGE = "/brand/wedding-image.jpg";

export function HeroBanner() {
  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-[#1a3a5c] text-white">
      <div className="absolute inset-0">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/15" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-end px-4 pb-14 pt-28 sm:px-6 sm:pb-16">
        <h1 className="max-w-3xl font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl animate-rise">
          {siteConfig.businessName}
        </h1>
        {/* <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-white/90 sm:text-base animate-rise-delay">
          திருமண சேவை
        </p> */}
        <p className="font-tamil mt-4 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg animate-rise-delay">
          {siteConfig.tamilTagline}
        </p>
        <div className="mt-8 animate-rise-delay-2">
          <Link
            href={CTA_HREF}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#9b1b2e] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
          >
            {CTA_LABEL}
          </Link>
        </div>
      </div>
    </section>
  );
}
