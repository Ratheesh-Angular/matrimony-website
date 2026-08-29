import { siteConfig } from "../site.config";

export const seedSettings = {
  phone: siteConfig.contact.phone,
  email: siteConfig.contact.email,
  address: siteConfig.contact.address,
  hours: siteConfig.contact.hours,
  whatsappNumber: siteConfig.whatsappNumber,
  mapLat: siteConfig.map.lat,
  mapLng: siteConfig.map.lng,
  mapZoom: siteConfig.map.zoom,
  mapEmbedUrl: siteConfig.map.embedUrl || "",
  socialLinks: {
    facebook: siteConfig.socialLinks.facebook,
    instagram: siteConfig.socialLinks.instagram,
    youtube: siteConfig.socialLinks.youtube,
    x: siteConfig.socialLinks.x,
  },
  summary:
    "Trusted matrimony for Mudaliar and Saiva Vellalar families — quick match decisions, district networks, and 10+ years of experience.",
};

export const seedBanners = [
  {
    title: "Welcome to our Matrimony",
    subtitle: siteConfig.tagline,
    imageUrl: "/brand/web-banner.png",
    ctaLabel: "Contact us",
    ctaHref: "/contact",
    showTitle: true,
    showSubtitle: true,
    showCta: true,
    order: 0,
    active: true,
  },
];

export const seedPages = [
  {
    slug: "about",
    title: "About us",
    body: `## Who we are

${siteConfig.businessName} provides trusted matrimony services for Mudaliar and Saiva Vellalar families across Tamil Nadu.

## Service

திருமண வரன்கள் விரைவில் முடிவு செய்து தரப்படும்.

## How we work

We partner with Mudaliar and Saiva Vellalar organizations in districts across the state.

## Districts

Salem, Tirunelveli, Coimbatore, Pudukkottai, Chennai, Thoothukudi, and other districts.

## Experience

10+ years of matrimony experience.

## Office

${siteConfig.contact.address}
`,
    seoTitle: `About | ${siteConfig.businessName}`,
    seoDescription: siteConfig.description,
    published: true,
  },
  {
    slug: "contact",
    title: "Contact us",
    body: `Have a question or need help with a biodata or match enquiry? Reach us directly by phone, email, or WhatsApp. We typically reply within one business day.`,
    seoTitle: `Contact | ${siteConfig.businessName}`,
    seoDescription: `Get in touch with ${siteConfig.businessName}.`,
    published: true,
  },
  {
    slug: "location",
    title: "Find us",
    body: `Visit our location during business hours. Parking and directions are available via the map below.`,
    seoTitle: `Location | ${siteConfig.businessName}`,
    seoDescription: `Visit ${siteConfig.businessName} — address and map.`,
    published: true,
  },
];
