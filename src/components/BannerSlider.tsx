import Image from "next/image";
import Link from "next/link";

export type BannerSlide = {
  _id?: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  ctaLabel?: string;
  ctaHref?: string;
  showTitle?: boolean;
  showSubtitle?: boolean;
  showCta?: boolean;
};

export function BannerSlider({ banners }: { banners: BannerSlide[] }) {
  const banner = banners[0];

  if (!banner) {
    return null;
  }

  const showTitle = banner.showTitle !== false && Boolean(banner.title?.trim());
  const showSubtitle = banner.showSubtitle !== false && Boolean(banner.subtitle?.trim());
  const showCta =
    banner.showCta !== false &&
    Boolean(banner.ctaLabel?.trim()) &&
    Boolean(banner.ctaHref?.trim());
  const hasOverlay = showTitle || showSubtitle || showCta;

  return (
    <section className="relative min-h-[72vh] overflow-hidden bg-[var(--primary)] text-white">
      <div className="absolute inset-0">
        <Image
          src={banner.imageUrl}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {hasOverlay ? (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/20" />
        ) : null}
      </div>

      {hasOverlay ? (
        <div className="relative z-10 mx-auto flex min-h-[72vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6">
          {showTitle ? (
            <h1 className="max-w-3xl font-display text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl animate-fade-up">
              {banner.title}
            </h1>
          ) : null}
          {showSubtitle ? (
            <p className="mt-4 max-w-xl text-base text-white/85 sm:text-lg animate-fade-up-delay">
              {banner.subtitle}
            </p>
          ) : null}
          {showCta ? (
            <div className="mt-8 animate-fade-up-delay">
              <Link
                href={banner.ctaHref!}
                className="inline-flex rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
              >
                {banner.ctaLabel}
              </Link>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="relative z-10 min-h-[72vh]" aria-hidden />
      )}
    </section>
  );
}
