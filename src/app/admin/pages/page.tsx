"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type PageDoc = {
  _id: string;
  slug: string;
  title: string;
  body: string;
  seoTitle?: string;
  seoDescription?: string;
  published: boolean;
};

const blank = {
  slug: "",
  title: "",
  body: "",
  seoTitle: "",
  seoDescription: "",
  published: true,
};

export default function AdminPagesPage() {
  const router = useRouter();
  const [pages, setPages] = useState<PageDoc[]>([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function load() {
    const res = await fetch("/api/admin/pages");
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    setPages(await res.json());
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("Saving…");
    const url = editingId ? `/api/admin/pages/${editingId}` : "/api/admin/pages";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setMessage(json.error || "Save failed");
      return;
    }
    setForm(blank);
    setEditingId(null);
    setMessage("Saved");
    await load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this page?")) return;
    await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-[var(--primary)]">Pages</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-3 rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <p className="text-sm font-medium">{editingId ? "Edit page" : "Add page"}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            placeholder="Slug (about, services, …)"
            required
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
          <input
            placeholder="Title"
            required
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            placeholder="SEO title"
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={form.seoTitle}
            onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
          />
          <input
            placeholder="SEO description"
            className="rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={form.seoDescription}
            onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
          />
        </div>
        <textarea
          placeholder="Body (use ## headings and - list items)"
          rows={8}
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={form.body}
          onChange={(e) => setForm({ ...form, body: e.target.value })}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
          />
          Published
        </label>
        <div className="flex gap-2">
          <button type="submit" className="rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white">
            {editingId ? "Update" : "Create"}
          </button>
          {editingId ? (
            <button
              type="button"
              className="rounded-md border px-4 py-2 text-sm"
              onClick={() => {
                setEditingId(null);
                setForm(blank);
              }}
            >
              Cancel
            </button>
          ) : null}
          {message ? <span className="self-center text-sm text-slate-500">{message}</span> : null}
        </div>
      </form>

      <ul className="mt-6 space-y-3">
        {pages.map((p) => (
          <li key={p._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4 ring-1 ring-black/5">
            <div>
              <p className="font-medium">{p.title}</p>
              <p className="text-xs text-slate-500">
                /{p.slug} · {p.published ? "published" : "draft"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-md border px-3 py-1.5 text-sm"
                onClick={() => {
                  setEditingId(p._id);
                  setForm({
                    slug: p.slug,
                    title: p.title,
                    body: p.body,
                    seoTitle: p.seoTitle || "",
                    seoDescription: p.seoDescription || "",
                    published: p.published,
                  });
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600"
                onClick={() => remove(p._id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
