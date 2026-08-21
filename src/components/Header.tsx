"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { siteConfig } from "@/site.config";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[var(--surface)]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-black/10 sm:h-11 sm:w-11">
            <Image
              src={siteConfig.logoPath}
              alt={siteConfig.businessName}
              fill
              className="object-cover"
              sizes="44px"
              priority
            />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-[var(--primary)] sm:text-xl">
            {siteConfig.businessName}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-[var(--foreground)]/80 transition hover:bg-[var(--background)] hover:text-[var(--primary)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-black/10 px-3 py-2 text-sm font-medium md:hidden"
          aria-expanded={open}
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          Menu
        </button>
      </div>

      {open ? (
        <div className="border-t border-black/5 bg-[var(--surface)] px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {siteConfig.nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-2 text-sm font-medium"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
