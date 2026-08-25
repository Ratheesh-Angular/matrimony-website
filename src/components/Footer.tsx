import type { ReactNode } from "react";
import Link from "next/link";
import { siteConfig } from "@/site.config";

type SocialLinks = {
  facebook?: string;
  instagram?: string;
  youtube?: string;
  x?: string;
};

type FooterProps = {
  phone?: string;
  email?: string;
  address?: string;
  hours?: string;
  socialLinks?: SocialLinks;
};

const iconClass = "h-4 w-4";

function FacebookIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.48h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.6" strokeWidth="1.8" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.5 6.2a3.05 3.05 0 0 0-2.15-2.16C19.4 3.6 12 3.6 12 3.6s-7.4 0-9.35.44A3.05 3.05 0 0 0 .5 6.2 32 32 0 0 0 0 12a32 32 0 0 0 .5 5.8 3.05 3.05 0 0 0 2.15 2.16C4.6 20.4 12 20.4 12 20.4s7.4 0 9.35-.44A3.05 3.05 0 0 0 23.5 17.8 32 32 0 0 0 24 12a32 32 0 0 0-.5-5.8ZM9.75 15.57V8.43L15.84 12l-6.09 3.57Z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.24 2h3.2l-7 8.01L22.5 22h-6.15l-4.81-6.29L6.2 22H3l7.48-8.56L1.75 2h6.31l4.35 5.76L18.24 2Zm-1.08 18.04h1.77L7 3.86H5.1l12.06 16.18Z" />
    </svg>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href?: string;
  label: string;
  children: ReactNode;
}) {
  const className =
    "inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:border-[var(--accent)] hover:bg-[var(--accent)] hover:text-white";

  if (!href) {
    return (
      <span className={`${className} cursor-default opacity-50`} title={`${label} link coming soon`} aria-label={`${label} (link coming soon)`}>
        {children}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={className}
    >
      {children}
    </a>
  );
}

export function Footer({ phone, email, address, hours, socialLinks }: FooterProps) {
  const year = new Date().getFullYear();
  const links = {
    facebook: socialLinks?.facebook ?? siteConfig.socialLinks.facebook,
    youtube: socialLinks?.youtube ?? siteConfig.socialLinks.youtube,
    instagram: socialLinks?.instagram ?? siteConfig.socialLinks.instagram,
    x: socialLinks?.x ?? siteConfig.socialLinks.x,
  };

  return (
    <footer className="mt-auto border-t border-black/5 bg-[var(--primary)] text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-xl font-semibold">{siteConfig.businessName}</p>
          <p className="mt-2 text-sm text-white/75">{siteConfig.tagline}</p>
          <div className="mt-4 flex items-center gap-2">
            <SocialLink href={links.facebook} label="Facebook">
              <FacebookIcon />
            </SocialLink>
            <SocialLink href={links.instagram} label="Instagram">
              <InstagramIcon />
            </SocialLink>
            <SocialLink href={links.youtube} label="YouTube">
              <YoutubeIcon />
            </SocialLink>
            <SocialLink href={links.x} label="X">
              <XIcon />
            </SocialLink>
          </div>
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
