"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PaymentStatus } from "@/models/Member";

type AdminMember = {
  _id: string;
  name: string;
  phone: string;
  isPremium: boolean;
  paymentStatus: PaymentStatus;
  paymentReference: string;
  paymentSubmittedAt: string | null;
  paymentReviewedAt: string | null;
  premiumPaidAt: string | null;
  createdAt: string | null;
};

type FilterTab = "pending_review" | "approved" | "unpaid_rejected" | "all";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
        Approved
      </span>
    );
  }
  if (status === "pending_review") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
        Pending Review
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
      Unpaid
    </span>
  );
}

export default function AdminMembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<FilterTab>("pending_review");
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    const res = await fetch("/api/admin/members", { cache: "no-store" });
    if (res.status === 401) {
      router.replace("/admin/login");
      return null;
    }
    if (!res.ok) {
      throw new Error("Failed to load member accounts");
    }
    return (await res.json()) as AdminMember[];
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchMembers();
      if (data) setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load members");
    } finally {
      setLoading(false);
    }
  }, [fetchMembers]);

  useEffect(() => {
    let active = true;
    fetchMembers()
      .then((data) => {
        if (active && data) setMembers(data);
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : "Unable to load members");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchMembers]);

  const counts = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let unpaidRejected = 0;
    for (const m of members) {
      if (m.paymentStatus === "pending_review") pending += 1;
      else if (m.paymentStatus === "approved" || m.isPremium) approved += 1;
      else unpaidRejected += 1;
    }
    return {
      pending_review: pending,
      approved,
      unpaid_rejected: unpaidRejected,
      all: members.length,
    };
  }, [members]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      if (tab === "pending_review" && m.paymentStatus !== "pending_review") {
        return false;
      }
      if (tab === "approved" && !(m.paymentStatus === "approved" || m.isPremium)) {
        return false;
      }
      if (
        tab === "unpaid_rejected" &&
        m.paymentStatus !== "unpaid" &&
        m.paymentStatus !== "rejected"
      ) {
        return false;
      }
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.phone.toLowerCase().includes(q) ||
        m.paymentReference.toLowerCase().includes(q)
      );
    });
  }, [members, tab, query]);

  async function runAction(
    member: AdminMember,
    action: "approve" | "reject" | "revoke",
  ) {
    const label = member.name || `+91 ${member.phone}`;
    if (action === "reject") {
      if (!confirm(`Reject payment for ${label}? They will be asked to resubmit.`)) {
        return;
      }
    } else if (action === "revoke") {
      if (!confirm(`Revoke premium access for ${label}?`)) {
        return;
      }
    }

    setBusyId(member._id);
    setError("");
    try {
      const res = await fetch(`/api/admin/members/${member._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Action failed");
      }
      setMembers((prev) =>
        prev.map((item) => (item._id === member._id ? json.member : item)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteMember(member: AdminMember) {
    const label = member.name || `+91 ${member.phone}`;
    if (!confirm(`Permanently delete member account "${label}"?`)) return;

    setBusyId(member._id);
    setError("");
    try {
      const res = await fetch(`/api/admin/members/${member._id}`, {
        method: "DELETE",
      });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!res.ok) {
        throw new Error("Unable to delete account");
      }
      setMembers((prev) => prev.filter((item) => item._id !== member._id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  const tabs: { id: FilterTab; label: string }[] = [
    { id: "pending_review", label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "unpaid_rejected", label: "Unpaid / Rejected" },
    { id: "all", label: "All" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--primary)]">
            Members &amp; Payments
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Verify ₹260 UPI payments and approve accounts to unlock profiles.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
        >
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center justify-between gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                active
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "bg-white text-slate-700 ring-1 ring-black/5 hover:bg-slate-50"
              }`}
            >
              <span className="truncate">{t.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                  active
                    ? "bg-white/20 text-white"
                    : t.id === "pending_review" && counts.pending_review > 0
                      ? "bg-amber-100 text-amber-800"
                      : "bg-slate-100 text-slate-600"
                }`}
              >
                {counts[t.id]}
              </span>
            </button>
          );
        })}
      </div>

      <div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, mobile number, or UTR…"
          className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm focus:border-[var(--primary)] focus:outline-none"
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm ring-1 ring-black/5">
          Loading member accounts…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm ring-1 ring-black/5">
          {tab === "pending_review"
            ? "No pending payment confirmations right now."
            : "No matching member accounts found."}
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((m) => {
            const isBusy = busyId === m._id;
            return (
              <li
                key={m._id}
                className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-slate-900">
                      {m.name || "Unnamed member"}
                    </p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                      <a
                        href={`tel:+91${m.phone}`}
                        className="font-mono font-medium text-[#0056b3] hover:underline"
                      >
                        +91 {m.phone}
                      </a>
                      <span className="text-slate-300">·</span>
                      <a
                        href={`https://wa.me/91${m.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-emerald-700 hover:underline"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                  <StatusBadge status={m.paymentStatus} />
                </div>

                <dl className="mt-3 grid grid-cols-1 gap-1.5 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
                  {m.paymentReference ? (
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-500">UPI Ref / UTR</dt>
                      <dd className="font-mono font-semibold text-slate-900">
                        {m.paymentReference}
                      </dd>
                    </div>
                  ) : null}
                  {m.paymentSubmittedAt ? (
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-500">Payment submitted</dt>
                      <dd className="font-medium text-slate-800">
                        {formatDate(m.paymentSubmittedAt)}
                      </dd>
                    </div>
                  ) : null}
                  {m.premiumPaidAt ? (
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-500">Approved on</dt>
                      <dd className="font-medium text-emerald-700">
                        {formatDate(m.premiumPaidAt)}
                      </dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Registered</dt>
                    <dd className="font-medium text-slate-800">
                      {formatDate(m.createdAt)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {!m.isPremium ? (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => runAction(m, "approve")}
                      className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {isBusy ? "Updating…" : "Approve Account"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => runAction(m, "revoke")}
                      className="flex-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                    >
                      {isBusy ? "Updating…" : "Revoke Access"}
                    </button>
                  )}

                  {m.paymentStatus === "pending_review" ? (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => runAction(m, "reject")}
                      className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-60"
                    >
                      Reject
                    </button>
                  ) : null}

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => deleteMember(m)}
                    className="rounded-lg px-2.5 py-2 text-xs font-medium text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
