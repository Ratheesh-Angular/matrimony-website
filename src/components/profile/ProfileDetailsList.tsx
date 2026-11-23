"use client";

import Link from "next/link";
import { ProfileCardActions } from "@/components/profile/ProfileCardActions";
import { ProfileStatusBadge } from "@/components/profile/ProfileStatusBadge";
import { getNameInitial } from "@/lib/name-initial";
import type {
  AdminProfileFilter,
  ProfilePublic,
} from "@/lib/profiles";

type ProfileDetailsListProps = {
  profiles: ProfilePublic[];
  total: number;
  page: number;
  pageSize: number;
  status: AdminProfileFilter;
  counts: Record<AdminProfileFilter, number>;
};

function buildListHref(opts: {
  page?: number;
  status?: AdminProfileFilter;
}): string {
  const params = new URLSearchParams();
  const status = opts.status ?? "all";
  if (status !== "all") params.set("status", status);
  const page = opts.page ?? 1;
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/profile-details?${qs}` : "/profile-details";
}

function pageNumbers(current: number, totalPages: number): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, totalPages, current]);
  for (let i = current - 1; i <= current + 1; i++) {
    if (i >= 1 && i <= totalPages) pages.add(i);
  }
  return [...pages].sort((a, b) => a - b);
}

export function ProfileDetailsList({
  profiles,
  total,
  page,
  pageSize,
  status,
  counts,
}: ProfileDetailsListProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const tabs: { key: AdminProfileFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "new", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];

  const pages = pageNumbers(page, totalPages);

  return (
    <>
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={buildListHref({ status: tab.key, page: 1 })}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              status === tab.key
                ? "bg-[#0056b3] text-white shadow-md"
                : "bg-white/80 text-[#0056b3] ring-1 ring-[#0056b3]/20 hover:bg-white"
            }`}
            aria-current={status === tab.key ? "page" : undefined}
          >
            {tab.label}
            <span className="ml-1.5 opacity-80">({counts[tab.key]})</span>
          </Link>
        ))}
      </div>

      {profiles.length === 0 ? (
        <div className="rounded-xl border border-[var(--biodata-blue)]/20 bg-white/80 px-6 py-16 text-center shadow-sm">
          <p className="font-tamil text-lg text-[var(--biodata-blue)]">
            இந்த வகையில் பதிவுகள் இல்லை
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">No profiles in this filter.</p>
        </div>
      ) : (
        <>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((p) => (
              <li
                key={p._id}
                className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-[var(--biodata-blue)]/15"
              >
                <Link
                  href={`/profile-details/${p._id}`}
                  className="group relative block aspect-[3/4] overflow-hidden bg-gradient-to-br from-[#e8f0fa] to-[#f8f1e4] transition hover:opacity-95"
                >
                  {p.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.photoUrl}
                      alt={p.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div
                      className="flex h-full items-center justify-center font-tamil text-4xl font-bold text-[var(--biodata-blue)]/25"
                      suppressHydrationWarning
                    >
                      {getNameInitial(p.name)}
                    </div>
                  )}
                  <span className="absolute left-3 top-3">
                    <ProfileStatusBadge status={p.status} />
                  </span>
                  <span
                    className={`absolute right-3 top-3 rounded-md px-2 py-0.5 text-xs font-bold text-white ${
                      p.gender === "female"
                        ? "bg-rose-500"
                        : "bg-[var(--biodata-blue)]"
                    }`}
                  >
                    {p.gender === "female" ? "பெண்" : "ஆண்"}
                  </span>
                </Link>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div>
                    <Link
                      href={`/profile-details/${p._id}`}
                      className="font-tamil text-lg font-bold text-[var(--biodata-red)] hover:underline"
                    >
                      {p.name}
                    </Link>
                    <p className="text-xs font-semibold text-[var(--biodata-blue)]">
                      {p.registrationNumber} · {p.registrationDate}
                    </p>
                    {(p.nakshatram || p.rasi) && (
                      <p className="mt-1 text-sm text-[var(--foreground)]/80">
                        {[p.nakshatram, p.rasi].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    {p.occupation ? (
                      <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                        {p.occupation}
                      </p>
                    ) : null}
                  </div>
                  <ProfileCardActions profileId={p._id} status={p.status} />
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-center text-sm text-[var(--biodata-blue)]/80">
            Showing {from}–{to} of {total}
          </p>

          {totalPages > 1 ? (
            <nav
              className="mt-4 flex flex-wrap items-center justify-center gap-2"
              aria-label="Pagination"
            >
              {page > 1 ? (
                <Link
                  href={buildListHref({ status, page: page - 1 })}
                  className="rounded-md bg-white/80 px-3 py-2 text-sm font-semibold text-[#0056b3] ring-1 ring-[#0056b3]/20 hover:bg-white"
                >
                  Prev
                </Link>
              ) : (
                <span className="rounded-md px-3 py-2 text-sm font-semibold text-[#0056b3]/40">
                  Prev
                </span>
              )}

              {pages.map((n, i) => {
                const prev = pages[i - 1];
                const showEllipsis = prev != null && n - prev > 1;
                return (
                  <span key={n} className="contents">
                    {showEllipsis ? (
                      <span className="px-1 text-sm text-[#0056b3]/50">…</span>
                    ) : null}
                    {n === page ? (
                      <span
                        className="rounded-md bg-[#0056b3] px-3 py-2 text-sm font-semibold text-white shadow-md"
                        aria-current="page"
                      >
                        {n}
                      </span>
                    ) : (
                      <Link
                        href={buildListHref({ status, page: n })}
                        className="rounded-md bg-white/80 px-3 py-2 text-sm font-semibold text-[#0056b3] ring-1 ring-[#0056b3]/20 hover:bg-white"
                      >
                        {n}
                      </Link>
                    )}
                  </span>
                );
              })}

              {page < totalPages ? (
                <Link
                  href={buildListHref({ status, page: page + 1 })}
                  className="rounded-md bg-white/80 px-3 py-2 text-sm font-semibold text-[#0056b3] ring-1 ring-[#0056b3]/20 hover:bg-white"
                >
                  Next
                </Link>
              ) : (
                <span className="rounded-md px-3 py-2 text-sm font-semibold text-[#0056b3]/40">
                  Next
                </span>
              )}
            </nav>
          ) : null}
        </>
      )}
    </>
  );
}
