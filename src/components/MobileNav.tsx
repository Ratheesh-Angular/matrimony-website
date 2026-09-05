"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { siteConfig } from "@/site.config";

export function MobileNav({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {children}
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
          <nav className="mx-auto flex max-w-6xl flex-col gap-1">
            {siteConfig.nav.map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
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
    </>
  );
}
