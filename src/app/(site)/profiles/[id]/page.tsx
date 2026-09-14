import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BiodataSheet } from "@/components/biodata/BiodataSheet";
import { ProfileWhatsAppCta } from "@/components/profile/ProfileWhatsAppCta";
import {
  buildProfileEnquiryMessage,
  getApprovedProfileById,
} from "@/lib/profiles";
import {
  getSiteSettings,
  resolveWhatsappNumber,
} from "@/lib/site-data";
import { siteConfig } from "@/site.config";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const profile = await getApprovedProfileById(id);
    if (!profile) return { title: "Not found" };
    return {
      title: `${profile.name} · ${profile.registrationNumber}`,
      description: `Biodata profile for ${profile.name}`,
    };
  } catch {
    return { title: "Profile" };
  }
}

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params;

  let profile = null;
  try {
    profile = await getApprovedProfileById(id);
  } catch {
    notFound();
  }

  if (!profile) notFound();

  let whatsapp = siteConfig.whatsappNumber;
  try {
    const settings = await getSiteSettings();
    whatsapp = resolveWhatsappNumber(settings.whatsappNumber);
  } catch {
    // fall back to site.config
  }

  const enquiryMessage = buildProfileEnquiryMessage(profile);

  return (
    <div className="min-h-[60vh] bg-[linear-gradient(165deg,#f8f1e4_0%,#fffef8_45%,#e8f0fa_100%)] py-10 sm:py-14">
      <div className="mx-auto mb-6 max-w-4xl px-4 sm:px-6">
        <Link
          href="/#approved-profiles"
          className="font-tamil text-sm font-semibold text-[#0056b3] hover:underline"
        >
          ← அங்கீகரிக்கப்பட்ட வரன்கள்
        </Link>
        <h1 className="mt-4 font-tamil text-2xl font-bold text-[#d93025] sm:text-3xl">
          {profile.name}
        </h1>
        <p className="mt-1 text-sm font-semibold text-[#0056b3]">
          {profile.registrationNumber}
          {profile.registrationDate ? ` · ${profile.registrationDate}` : ""}
        </p>
      </div>

      <div className="px-3 pb-24 sm:px-6">
        <BiodataSheet profile={profile} />
      </div>

      <ProfileWhatsAppCta number={whatsapp} message={enquiryMessage} />
    </div>
  );
}
