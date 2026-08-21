import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
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
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((p) => (
              <li key={p._id}>
                <Link
                  href={`/profile-details/${p._id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-[var(--biodata-blue)]/15 transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-[var(--biodata-red)]/40"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#e8f0fa] to-[#f8f1e4]">
                    {p.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.photoUrl}
                        alt={p.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-tamil text-4xl font-bold text-[var(--biodata-blue)]/25">
                        {p.name.charAt(0) || "?"}
                      </div>
                    )}
                    <span
                      className={`absolute left-3 top-3 rounded-md px-2 py-0.5 text-xs font-bold text-white ${
                        p.gender === "female" ? "bg-rose-500" : "bg-[var(--biodata-blue)]"
                      }`}
                    >
                      {p.gender === "female" ? "பெண்" : "ஆண்"}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-4">
                    <p className="font-tamil text-lg font-bold text-[var(--biodata-red)] group-hover:underline">
                      {p.name}
                    </p>
                    <p className="text-xs font-semibold text-[var(--biodata-blue)]">
                      {p.registrationNumber} · {p.registrationDate}
                    </p>
                    {(p.nakshatram || p.rasi) && (
                      <p className="text-sm text-[var(--foreground)]/80">
                        {[p.nakshatram, p.rasi].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    {p.occupation ? (
                      <p className="mt-auto line-clamp-2 pt-2 text-sm text-[var(--muted)]">
                        {p.occupation}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
