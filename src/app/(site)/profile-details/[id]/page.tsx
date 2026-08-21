import Link from "next/link";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import mongoose from "mongoose";
import { BiodataSheet } from "@/components/biodata/BiodataSheet";
import { connectDB } from "@/lib/db";
import { isProfileGateAuthenticated } from "@/lib/profile-gate-auth";
import { serializeProfile } from "@/lib/profiles";
import { MarriageProfile } from "@/models/MarriageProfile";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) return { title: "Not found" };
  try {
    await connectDB();
    const doc = await MarriageProfile.findById(id).lean();
    if (!doc) return { title: "Not found" };
    return {
      title: `${doc.name} · ${doc.registrationNumber}`,
      description: `Biodata profile for ${doc.name}`,
    };
  } catch {
    return { title: "Profile" };
  }
}

export default async function ProfileDetailsDetailPage({ params }: Props) {
  if (!(await isProfileGateAuthenticated())) {
    redirect("/profile-details/login");
  }

  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) notFound();

  let profile = null;
  try {
    await connectDB();
    const doc = await MarriageProfile.findById(id).lean();
    if (doc) {
      profile = serializeProfile(
        doc as unknown as Parameters<typeof serializeProfile>[0],
      );
    }
  } catch {
    notFound();
  }

  if (!profile) notFound();

  return (
    <div className="min-h-[60vh] bg-[linear-gradient(165deg,#f8f1e4_0%,#fffef8_45%,#e8f0fa_100%)] py-10 sm:py-14">
      <div className="mx-auto mb-6 flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/profile-details"
          className="font-tamil text-sm font-semibold text-[#0056b3] hover:underline"
        >
          ← அனைத்து பதிவுகள்
        </Link>
        <Link
          href="/"
          className="text-sm font-semibold text-[#d93025] hover:underline"
        >
          New registration
        </Link>
      </div>
      <div className="px-3 sm:px-6">
        <BiodataSheet profile={profile} />
      </div>
    </div>
  );
}
