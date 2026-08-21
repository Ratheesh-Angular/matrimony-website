/**
 * Per-client branding & feature flags.
 * Clone this repo, then edit this file for each business.
 */
export const siteConfig = {
  businessName: "Sekizhar Manamalai",
  tagline: "Mudaliar & Saiva Vellalar matrimony",
  tamilTagline: "திருமண வரன்கள் விரைவில் முடிவு செய்து தரப்படும்",
  description:
    "Sekizhar Manamalai — trusted matrimony for Mudaliar and Saiva Vellalar families across Tamil Nadu, with 10+ years of experience and district-level community networks.",

  /** Logo path under /public */
  logoPath: "/brand/logo.png",
  faviconPath: "/brand/logo.png",

  /** Theme — applied as CSS variables */
  colors: {
    primary: "#1e3a5f",
    primaryDark: "#132742",
    accent: "#0d9488",
    background: "#f0f4f8",
    foreground: "#0f172a",
    muted: "#64748b",
    surface: "#ffffff",
  },

  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Location", href: "/location" },
  ],

  features: {
    whatsapp: true,
    googleMaps: true,
    contactForm: true,
    enquiryForm: true,
  },

  /** E.164 without + for wa.me links, e.g. 919876543210 */
  whatsappNumber: "919876543210",
  whatsappDefaultMessage:
    "Hi! I found your website and would like to know more.",

  /** Used when SiteSettings map fields are empty */
  map: {
    lat: 13.0827,
    lng: 80.2707,
    zoom: 15,
    embedUrl: "", // optional full Google Maps embed URL override
  },

  /** Fallback contact shown until SiteSettings are seeded/edited */
  contact: {
    phone: "+91 98765 43210",
    email: "hello@demobusiness.local",
    address: "1/130, முருகன் கோவில் தெரு, புதுநல்லூர், சென்னை – 600069",
    hours: "Mon–Sat: 9:00 AM – 7:00 PM",
  },
};

export type SiteConfig = typeof siteConfig;
