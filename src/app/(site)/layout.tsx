import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { getSiteSettings, resolveWhatsappNumber } from "@/lib/site-data";
import { siteConfig } from "@/site.config";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  let phone = siteConfig.contact.phone;
  let email = siteConfig.contact.email;
  let address = siteConfig.contact.address;
  let hours = siteConfig.contact.hours;
  let whatsapp = siteConfig.whatsappNumber;
  let socialLinks = { ...siteConfig.socialLinks };

  try {
    const settings = await getSiteSettings();
    phone = settings.phone || phone;
    email = settings.email || email;
    address = settings.address || address;
    hours = settings.hours || hours;
    whatsapp = resolveWhatsappNumber(settings.whatsappNumber);
    socialLinks = {
      facebook: settings.socialLinks?.facebook || socialLinks.facebook,
      youtube: settings.socialLinks?.youtube || socialLinks.youtube,
      instagram: settings.socialLinks?.instagram || socialLinks.instagram,
      x: settings.socialLinks?.x || socialLinks.x,
    };
  } catch {
    // Offline / missing Mongo — fall back to site.config
  }

  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer
        phone={phone}
        email={email}
        address={address}
        hours={hours}
        socialLinks={socialLinks}
      />
      <WhatsAppFab number={whatsapp} />
    </div>
  );
}
