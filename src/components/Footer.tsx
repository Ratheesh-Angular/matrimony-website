import Link from "next/link";
import { siteConfig } from "@/site.config";

type FooterProps = {
  phone?: string;
  email?: string;
  address?: string;
  hours?: string;
};

export function Footer({ phone, email, address, hours }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-black/5 bg-[var(--primary)] text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-xl font-semibold">{siteConfig.businessName}</p>
          <p className="mt-2 text-sm text-white/75">{siteConfig.tagline}</p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white/60">Explore</p>
          <ul className="mt-3 space-y-2 text-sm">
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-[var(--accent)]">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-white/60">Contact</p>
          <ul className="mt-3 space-y-2 text-sm text-white/85">
            {phone ? <li>{phone}</li> : null}
            {email ? <li>{email}</li> : null}
            {address ? <li>{address}</li> : null}
            {hours ? <li>{hours}</li> : null}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/55">
        © {year} {siteConfig.businessName}. All rights reserved.
      </div>
    </footer>
  );
}
