"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Settings = {
  phone: string;
  email: string;
  address: string;
  hours: string;
  whatsappNumber: string;
  mapLat: number;
  mapLng: number;
  mapZoom: number;
  mapEmbedUrl: string;
  summary: string;
  socialLinks: { facebook: string; instagram: string; youtube: string; x: string };
};

const empty: Settings = {
  phone: "",
  email: "",
  address: "",
  hours: "",
  whatsappNumber: "",
  mapLat: 0,
  mapLng: 0,
  mapZoom: 15,
  mapEmbedUrl: "",
  summary: "",
  socialLinks: { facebook: "", instagram: "", youtube: "", x: "" },
};

export default function AdminSettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState<Settings>(empty);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then(async (res) => {
        if (res.status === 401) {
          router.replace("/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setForm({
            ...empty,
            ...data,
            socialLinks: { ...empty.socialLinks, ...data.socialLinks },
          });
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("Saving…");
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      setStatus("Save failed");
      return;
    }
    setStatus("Saved");
  }

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>;

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-[var(--primary)]">Site settings</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["phone", "Phone"],
              ["email", "Email"],
              ["whatsappNumber", "WhatsApp number"],
              ["hours", "Hours"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-sm">
              <span className="mb-1 block font-medium">{label}</span>
              <input
                className="w-full rounded-md border border-slate-200 px-3 py-2"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </label>
          ))}
        </div>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Address</span>
          <textarea
            className="w-full rounded-md border border-slate-200 px-3 py-2"
            rows={2}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Home summary</span>
          <textarea
            className="w-full rounded-md border border-slate-200 px-3 py-2"
            rows={3}
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Map lat</span>
            <input
              type="number"
              step="any"
              className="w-full rounded-md border border-slate-200 px-3 py-2"
              value={form.mapLat}
              onChange={(e) => setForm({ ...form, mapLat: Number(e.target.value) })}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Map lng</span>
            <input
              type="number"
              step="any"
              className="w-full rounded-md border border-slate-200 px-3 py-2"
              value={form.mapLng}
              onChange={(e) => setForm({ ...form, mapLng: Number(e.target.value) })}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Zoom</span>
            <input
              type="number"
              className="w-full rounded-md border border-slate-200 px-3 py-2"
              value={form.mapZoom}
              onChange={(e) => setForm({ ...form, mapZoom: Number(e.target.value) })}
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Map embed URL (optional override)</span>
          <input
            className="w-full rounded-md border border-slate-200 px-3 py-2"
            value={form.mapEmbedUrl}
            onChange={(e) => setForm({ ...form, mapEmbedUrl: e.target.value })}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(["facebook", "instagram", "youtube", "x"] as const).map((key) => (
            <label key={key} className="block text-sm">
              <span className="mb-1 block font-medium capitalize">{key === "x" ? "X" : key}</span>
              <input
                className="w-full rounded-md border border-slate-200 px-3 py-2"
                value={form.socialLinks[key]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    socialLinks: { ...form.socialLinks, [key]: e.target.value },
                  })
                }
              />
            </label>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white"
          >
            Save settings
          </button>
          {status ? <span className="text-sm text-slate-500">{status}</span> : null}
        </div>
      </form>
    </div>
  );
}
