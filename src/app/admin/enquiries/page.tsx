"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Enquiry = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  subject?: string;
  message: string;
  type: string;
  status: string;
  createdAt?: string;
};

export default function AdminEnquiriesPage() {
  const router = useRouter();
  const [items, setItems] = useState<Enquiry[]>([]);

  async function load() {
    const res = await fetch("/api/admin/enquiries");
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    setItems(await res.json());
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function setStatus(id: string, status: string) {
    await fetch(`/api/admin/enquiries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this enquiry?")) return;
    await fetch(`/api/admin/enquiries/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-[var(--primary)]">Enquiries</h1>
      <ul className="mt-6 space-y-4">
        {items.length === 0 ? (
          <li className="rounded-xl bg-white p-6 text-sm text-slate-500 ring-1 ring-black/5">
            No enquiries yet.
          </li>
        ) : null}
        {items.map((item) => (
          <li key={item._id} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {item.name}{" "}
                  <span className="text-xs font-normal uppercase tracking-wide text-slate-400">
                    {item.type} · {item.status}
                  </span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {[item.email, item.phone, item.subject].filter(Boolean).join(" · ")}
                </p>
              </div>
              <select
                className="rounded-md border border-slate-200 px-2 py-1 text-sm"
                value={item.status}
                onChange={(e) => setStatus(item._id, e.target.value)}
              >
                <option value="new">new</option>
                <option value="read">read</option>
                <option value="replied">replied</option>
                <option value="archived">archived</option>
              </select>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{item.message}</p>
            <button
              type="button"
              className="mt-3 text-sm text-red-600"
              onClick={() => remove(item._id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
