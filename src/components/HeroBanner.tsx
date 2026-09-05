import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/site.config";

const CTA_HREF = "#biodata-form";
const CTA_LABEL = "வரன் பதிவு";

export function HeroBanner() {
  return (
    <section className="relative min-h-[60vh] overflow-hidden text-white md:min-h-[70vh]">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 20% 50%, rgba(155, 27, 46, 0.22) 0%, transparent 55%), radial-gradient(ellipse 50% 50% at 85% 20%, rgba(212, 160, 50, 0.12) 0%, transparent 50%), linear-gradient(155deg, var(--primary) 0%, var(--primary-dark) 55%, #0c1a2e 100%)",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-[60vh] max-w-6xl flex-col items-center justify-center gap-5 px-4 py-12 text-center sm:gap-8 sm:px-6 sm:py-16 md:min-h-[70vh] md:flex-row md:gap-12 md:py-20 md:text-left lg:gap-16">
        <div className="relative h-[240px] w-[240px] shrink-0 animate-fade-up sm:h-[280px] sm:w-[280px] md:h-[380px] md:w-[380px] lg:h-[440px] lg:w-[440px]">
          <Image
            src={siteConfig.logoPath}
            alt={siteConfig.businessName}
            fill
            priority
            className="object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.35)]"
            sizes="(max-width: 768px) 280px, 440px"
          />
        </div>

        <div className="flex max-w-xl flex-col items-center md:items-start">
          <h1 className="font-tamil text-3xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl animate-rise">
            {siteConfig.businessName}
          </h1>
          <p className="font-tamil mt-3 whitespace-pre-line text-base leading-relaxed text-white/85 sm:mt-4 sm:text-lg animate-rise-delay">
            {siteConfig.tamilTagline}
          </p>
          <div className="mt-6 sm:mt-8 animate-rise-delay-2">
            <Link
              href={CTA_HREF}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#9b1b2e] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-110"
            >
              {CTA_LABEL}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
