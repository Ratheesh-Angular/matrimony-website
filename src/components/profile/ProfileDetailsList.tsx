"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ProfileCardActions } from "@/components/profile/ProfileCardActions";
import { ProfileStatusBadge } from "@/components/profile/ProfileStatusBadge";
import type { ProfilePublic, ProfileStatus } from "@/lib/profiles";

type Filter = "all" | ProfileStatus;

type ProfileDetailsListProps = {
  profiles: ProfilePublic[];
};

export function ProfileDetailsList({ profiles }: ProfileDetailsListProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(
    () => ({
      all: profiles.length,
      new: profiles.filter((p) => p.status === "new").length,
      approved: profiles.filter((p) => p.status === "approved").length,
      rejected: profiles.filter((p) => p.status === "rejected").length,
    }),
    [profiles],
  );

  const filtered =
    filter === "all" ? profiles : profiles.filter((p) => p.status === filter);

  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "new", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <>
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              filter === tab.key
                ? "bg-[#0056b3] text-white shadow-md"
                : "bg-white/80 text-[#0056b3] ring-1 ring-[#0056b3]/20 hover:bg-white"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 opacity-80">({counts[tab.key]})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-[var(--biodata-blue)]/20 bg-white/80 px-6 py-16 text-center shadow-sm">
          <p className="font-tamil text-lg text-[var(--biodata-blue)]">
            இந்த வகையில் பதிவுகள் இல்லை
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">No profiles in this filter.</p>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <li
              key={p._id}
              className="flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-[var(--biodata-blue)]/15"
            >
              <Link
                href={`/profile-details/${p._id}`}
                className="group relative block aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#e8f0fa] to-[#f8f1e4]"
              >
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
                <span className="absolute left-3 top-3">
                  <ProfileStatusBadge status={p.status} />
                </span>
                <span
                  className={`absolute right-3 top-3 rounded-md px-2 py-0.5 text-xs font-bold text-white ${
                    p.gender === "female" ? "bg-rose-500" : "bg-[var(--biodata-blue)]"
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
      )}
    </>
  );
}
