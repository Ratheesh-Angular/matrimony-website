import { siteConfig } from "@/site.config";

export function MapEmbed({ embedUrl, title = "Location map" }: { embedUrl: string; title?: string }) {
  if (!siteConfig.features.googleMaps || !embedUrl) return null;

  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-black/10">
      <iframe
        title={title}
        src={embedUrl}
        className="h-[360px] w-full border-0 sm:h-[420px]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
