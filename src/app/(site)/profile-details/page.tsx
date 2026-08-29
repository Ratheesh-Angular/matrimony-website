import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileDetailsList } from "@/components/profile/ProfileDetailsList";
import { connectDB } from "@/lib/db";
import { isProfileGateAuthenticated } from "@/lib/profile-gate-auth";
import { serializeProfile } from "@/lib/profiles";
import { MarriageProfile } from "@/models/MarriageProfile";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "பதிவுகள் / Profiles",
  description: "Browse submitted matrimony biodata profiles",
};

export default async function ProfileDetailsPage() {
  if (!(await isProfileGateAuthenticated())) {
    redirect("/profile-details/login");
  }

  let profiles: ReturnType<typeof serializeProfile>[] = [];

  try {
    await connectDB();
    const docs = await MarriageProfile.find().sort({ createdAt: -1 }).lean();
    profiles = docs.map((d) =>
      serializeProfile(d as unknown as Parameters<typeof serializeProfile>[0]),
    );
  } catch {
    profiles = [];
  }

  return (
    <div
      className="min-h-[60vh] bg-[linear-gradient(165deg,#f8f1e4_0%,#fffef8_45%,#e8f0fa_100%)]"
      style={
        {
          "--biodata-blue": "#0056b3",
          "--biodata-red": "#d93025",
          "--biodata-cream": "#fffef8",
        } as React.CSSProperties
      }
    >
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <header className="mb-10 text-center">
          <h1 className="font-tamil text-3xl font-bold text-[var(--biodata-red)] sm:text-4xl">
            பதிவுகள்
          </h1>
          <p className="mt-2 text-[var(--biodata-blue)]">
            Submitted biodata profiles · {profiles.length} total
          </p>
          <Link
            href="/#biodata-form"
            className="mt-4 inline-block text-sm font-semibold text-[var(--biodata-red)] underline-offset-2 hover:underline"
          >
            + Submit a new profile
          </Link>
        </header>

        {profiles.length === 0 ? (
          <div className="rounded-xl border border-[var(--biodata-blue)]/20 bg-white/80 px-6 py-16 text-center shadow-sm">
            <p className="font-tamil text-lg text-[var(--biodata-blue)]">
              இன்னும் பதிவுகள் இல்லை
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Be the first to submit a biodata from the home page.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-md bg-[var(--biodata-red)] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Go to form
            </Link>
          </div>
        ) : (
          <ProfileDetailsList profiles={profiles} />
        )}
      </div>
    </div>
  );
}
