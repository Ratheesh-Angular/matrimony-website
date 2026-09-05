import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/site.config";
import { MobileNav } from "@/components/MobileNav";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[var(--surface)]/90 backdrop-blur-md">
      <MobileNav>
        <Link href="/" className="flex items-center gap-3">
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
          <span className="font-tamil text-lg font-semibold tracking-tight text-[var(--primary)] sm:text-xl">
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
      </MobileNav>
    </header>
  );
}
