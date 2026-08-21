"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type BannerForm = {
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
  showTitle: boolean;
  showSubtitle: boolean;
  showCta: boolean;
  active: boolean;
};

const blank: BannerForm = {
  title: "",
  subtitle: "",
  imageUrl: "",
  ctaLabel: "",
  ctaHref: "",
  showTitle: true,
  showSubtitle: true,
  showCta: true,
  active: true,
};

export default function AdminBannersPage() {
  const router = useRouter();
  const [form, setForm] = useState<BannerForm>(blank);
  const [bannerId, setBannerId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/banners");
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    const banners = await res.json();
    const first = Array.isArray(banners) ? banners[0] : null;
    if (first) {
      setBannerId(first._id);
      setForm({
        title: first.title || "",
        subtitle: first.subtitle || "",
        imageUrl: first.imageUrl || "",
        ctaLabel: first.ctaLabel || "",
        ctaHref: first.ctaHref || "",
        showTitle: first.showTitle !== false,
        showSubtitle: first.showSubtitle !== false,
        showCta: first.showCta !== false,
        active: first.active !== false,
      });
    } else {
      setBannerId(null);
      setForm(blank);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onUpload(file: File | null) {
    if (!file) return;
    setUploading(true);
    setMessage("Uploading…");
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: data });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setMessage(err.error || "Upload failed");
        return;
      }
      const json = await res.json();
      setForm((f) => ({ ...f, imageUrl: json.url }));
      setMessage("Image uploaded — click Save to publish");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.imageUrl) {
      setMessage("Upload a banner image first");
      return;
    }
    setMessage("Saving…");
    const url = bannerId ? `/api/admin/banners/${bannerId}` : "/api/admin/banners";
    const method = bannerId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setMessage(err.error || "Save failed");
      return;
    }
    const saved = await res.json();
    setBannerId(saved._id);
    setMessage("Saved — homepage will show these settings");
    await load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-[var(--primary)]">Banner</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">
        One homepage banner. Upload an image, then choose what text and buttons to show.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div>
          <label className="block text-sm font-medium text-slate-700">Banner image</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={uploading}
            className="mt-2 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-[var(--primary)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
            onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
          />
          <p className="mt-1 text-xs text-slate-500">JPEG, PNG, WebP, or GIF — max 5MB</p>
        </div>

        {form.imageUrl ? (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.imageUrl} alt="Banner preview" className="max-h-56 w-full object-cover" />
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
            No image yet — upload a file above
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Title</label>
            <input
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              disabled={!form.showTitle}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <input
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              disabled={!form.showSubtitle}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">CTA label</label>
            <input
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={form.ctaLabel}
              onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
              disabled={!form.showCta}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">CTA link</label>
            <input
              className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={form.ctaHref}
              onChange={(e) => setForm({ ...form, ctaHref: e.target.value })}
              disabled={!form.showCta}
              placeholder="/contact"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 border-t border-slate-100 pt-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.showTitle}
              onChange={(e) => setForm({ ...form, showTitle: e.target.checked })}
            />
            Show title
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.showSubtitle}
              onChange={(e) => setForm({ ...form, showSubtitle: e.target.checked })}
            />
            Show description
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.showCta}
              onChange={(e) => setForm({ ...form, showCta: e.target.checked })}
            />
            Show CTA button
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Active on homepage
          </label>
        </div>
        <p className="text-xs text-slate-500">
          Banner image always shows once saved. Show title / description / CTA add text on top —
          leave them off if your design already includes text. Active off also hides those overlays.
        </p>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={uploading}
            className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Save banner
          </button>
          {message ? <span className="self-center text-sm text-slate-500">{message}</span> : null}
        </div>
      </form>
    </div>
  );
}
