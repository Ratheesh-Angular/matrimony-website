import { HeroBanner } from "@/components/HeroBanner";
import { ApprovedProfilesSection } from "@/components/profile/ApprovedProfilesSection";
import { SpecialServicesSection } from "@/components/SpecialServicesSection";
import { MarriageBiodataForm } from "@/components/biodata/MarriageBiodataForm";

// Admin/DB banner temporarily unused — custom HTML hero is live instead.
// import { BannerSlider, type BannerSlide } from "@/components/BannerSlider";
// import { getSiteBanner } from "@/lib/site-data";
// import { seedBanners } from "@/content/seed";

export const dynamic = "force-dynamic";

// function toSlide(
//   b: {
//     _id?: unknown;
//     title?: string | null;
//     subtitle?: string | null;
//     imageUrl: string;
//     ctaLabel?: string | null;
//     ctaHref?: string | null;
//     showTitle?: boolean | null;
//     showSubtitle?: boolean | null;
//     showCta?: boolean | null;
//   },
//   fallbackId?: string,
// ): BannerSlide {
//   return {
//     _id: b._id != null ? String(b._id) : fallbackId,
//     title: b.title || "",
//     subtitle: b.subtitle || "",
//     imageUrl: b.imageUrl,
//     ctaLabel: b.ctaLabel || "",
//     ctaHref: b.ctaHref || "",
//     showTitle: b.showTitle !== false,
//     showSubtitle: b.showSubtitle !== false,
//     showCta: b.showCta !== false,
//   };
// }

export default async function HomePage() {
  // Admin banner fetch commented out while custom HeroBanner is used.
  // let banners: BannerSlide[] = seedBanners.map((b, i) => toSlide(b, String(i)));
  // try {
  //   const dbBanner = await getSiteBanner();
  //   if (dbBanner) {
  //     const slide = toSlide(dbBanner);
  //     if (dbBanner.active === false) {
  //       banners = [
  //         { ...slide, showTitle: false, showSubtitle: false, showCta: false },
  //       ];
  //     } else {
  //       banners = [slide];
  //     }
  //   }
  // } catch {
  //   // use seed fallbacks
  // }

  return (
    <>
      <HeroBanner />

      {/* User Form — Tamil matrimony biodata */}
      <section className="relative overflow-hidden border-y border-black/5 bg-[linear-gradient(165deg,#f8f1e4_0%,#fffef8_40%,#e8f0fa_100%)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #d93025 0, transparent 45%), radial-gradient(circle at 80% 60%, #0056b3 0, transparent 40%)",
          }}
        />
        <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16" id="biodata-form">
          <div className="mb-8 text-center">
            <h2 className="font-tamil text-2xl font-bold text-[#d93025] sm:text-3xl">
              வரன் பதிவு படிவம்
            </h2>
            <p className="mt-2 text-sm text-[#0056b3] sm:text-base">
              Fill your biodata below — Tamil labels, English values welcome
            </p>
          </div>
          <MarriageBiodataForm />
        </div>
      </section>

      <ApprovedProfilesSection />

      <SpecialServicesSection />
    </>
  );
}
