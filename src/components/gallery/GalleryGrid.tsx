"use client";

import { useEffect, useState } from "react";

export type PublicGalleryItem = {
  _id: string;
  mediaType: "image" | "video";
  url: string;
  title: string;
};

export function GalleryGrid({ items }: { items: PublicGalleryItem[] }) {
  const [lightbox, setLightbox] = useState<PublicGalleryItem | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--primary)]/10 bg-white/80 px-6 py-16 text-center shadow-sm">
        <p className="font-tamil text-lg text-[var(--primary)]">இன்னும் படங்கள் இல்லை</p>
        <p className="mt-2 text-sm text-[var(--muted)]">Gallery photos and videos will appear here soon.</p>
      </div>
    );
  }

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {items.map((item, index) => (
          <figure
            key={item._id}
            className="mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 animate-fade-up"
            style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
          >
            {item.mediaType === "video" ? (
              <video
                src={item.url}
                className="w-full object-cover"
                controls
                playsInline
                preload="metadata"
              />
            ) : (
              <button
                type="button"
                className="block w-full text-left"
                onClick={() => setLightbox(item)}
                aria-label={item.title ? `View ${item.title}` : "View image"}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.title || "Gallery image"}
                  className="w-full object-cover transition duration-300 hover:brightness-95"
                  loading="lazy"
                />
              </button>
            )}
            {item.title ? (
              <figcaption className="px-3 py-2.5 text-sm text-slate-600">{item.title}</figcaption>
            ) : null}
          </figure>
        ))}
      </div>

      {lightbox ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="presentation">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setLightbox(null)}
          />
          <div className="relative max-h-[90dvh] w-full max-w-4xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightbox.url}
              alt={lightbox.title || "Gallery image"}
              className="max-h-[85dvh] w-full rounded-xl object-contain"
            />
            {lightbox.title ? (
              <p className="mt-3 text-center text-sm text-white/90">{lightbox.title}</p>
            ) : null}
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute -top-2 right-0 rounded-full bg-white/95 px-3 py-1.5 text-sm font-semibold text-slate-800 shadow"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
