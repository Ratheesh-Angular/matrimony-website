import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileDetailsList } from "@/components/profile/ProfileDetailsList";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  ADMIN_PROFILES_PAGE_SIZE,
  getAdminProfilesPage,
  type AdminProfileFilter,
} from "@/lib/profiles";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "பதிவுகள் / Profiles",
  description: "Browse submitted matrimony biodata profiles",
};

function parseStatus(raw: string | string[] | undefined): AdminProfileFilter {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === "new" || value === "approved" || value === "rejected") {
    return value;
  }
  return "all";
}

function parsePage(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

export default async function ProfileDetailsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[]; status?: string | string[] }>;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const status = parseStatus(params.status);
  const requestedPage = parsePage(params.page);

  let result: Awaited<ReturnType<typeof getAdminProfilesPage>> = {
    items: [],
    total: 0,
    page: 1,
    pageSize: ADMIN_PROFILES_PAGE_SIZE,
    status,
    counts: { all: 0, new: 0, approved: 0, rejected: 0 },
  };

  try {
    result = await getAdminProfilesPage({
      page: requestedPage,
      pageSize: ADMIN_PROFILES_PAGE_SIZE,
      status,
    });
  } catch {
    // keep empty result
  }

  const totalAll = result.counts.all;

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
            Submitted biodata profiles · {totalAll} total
          </p>
          <Link
            href="/#biodata-form"
            className="mt-4 inline-block text-sm font-semibold text-[var(--biodata-red)] underline-offset-2 hover:underline"
          >
            + Submit a new profile
          </Link>
        </header>

        {totalAll === 0 ? (
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
          <ProfileDetailsList
            profiles={result.items}
            total={result.total}
            page={result.page}
            pageSize={result.pageSize}
            status={result.status}
            counts={result.counts}
          />
        )}
      </div>
    </div>
  );
}
