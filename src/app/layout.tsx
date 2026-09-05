import type { Metadata } from "next";
import { Fraunces, Noto_Sans_Tamil, Source_Sans_3 } from "next/font/google";
import { siteConfig } from "@/site.config";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const tamil = Noto_Sans_Tamil({
  variable: "--font-tamil",
  subsets: ["tamil"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: siteConfig.businessName,
    template: `%s | ${siteConfig.businessName}`,
  },
  description: siteConfig.description,
  icons: {
    icon: siteConfig.faviconPath,
  },
  openGraph: {
    title: siteConfig.businessName,
    description: siteConfig.description,
    images: [siteConfig.logoPath],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: siteConfig.businessName,
    description: siteConfig.description,
    images: [siteConfig.logoPath],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { colors } = siteConfig;

  return (
    <html
      lang="ta"
      className={`${display.variable} ${body.variable} ${tamil.variable} min-h-dvh`}
    >
      <body
        className="flex min-h-dvh flex-col antialiased"
        style={
          {
            "--primary": colors.primary,
            "--primary-dark": colors.primaryDark,
            "--accent": colors.accent,
            "--background": colors.background,
            "--foreground": colors.foreground,
            "--muted": colors.muted,
            "--surface": colors.surface,
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
