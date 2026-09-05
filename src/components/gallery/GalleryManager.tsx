"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type GalleryItem = {
  _id: string;
  mediaType: "image" | "video";
  url: string;
  publicId: string;
  title: string;
  order: number;
  active: boolean;
};

export function GalleryManager() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/gallery");
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    const data = await res.json();
    if (Array.isArray(data)) setItems(data);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function onUpload(file: File | null) {
    if (!file) return;
    setUploading(true);
    setMessage("Uploading…");
    try {
      const data = new FormData();
      data.append("file", file);
      const uploadRes = await fetch("/api/admin/gallery/upload", {
        method: "POST",
        body: data,
      });
      if (uploadRes.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const uploaded = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploaded.error || "Upload failed");

      const createRes = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: uploaded.url,
          publicId: uploaded.publicId,
          mediaType: uploaded.mediaType,
          title: "",
        }),
      });
      const created = await createRes.json();
      if (!createRes.ok) throw new Error(created.error || "Could not save item");

      setItems((prev) => [created, ...prev]);
      setMessage("Uploaded successfully.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/gallery/${deleteId}`, { method: "DELETE" });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Delete failed");
      }
      setItems((prev) => prev.filter((item) => item._id !== deleteId));
      setMessage("Deleted.");
      setDeleteId(null);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  async function updateTitle(id: string, title: string) {
    const res = await fetch(`/api/admin/gallery/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (res.status === 401) {
      router.replace("/admin/login");
      return;
    }
    if (!res.ok) {
      const json = await res.json();
      setMessage(json.error || "Could not update title");
      return;
    }
    const updated = await res.json();
    setItems((prev) => prev.map((item) => (item._id === id ? { ...item, ...updated } : item)));
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-[var(--primary)]">Gallery</h1>
      <p className="mt-1 text-sm text-slate-500">
        Upload images and videos. They appear on the public Gallery page.
      </p>

      <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
          className="sr-only"
          disabled={uploading}
          onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex w-full min-h-14 items-center justify-center rounded-xl bg-[var(--primary)] px-4 py-3 text-base font-semibold text-white disabled:opacity-60"
        >
          {uploading ? "Uploading…" : "Upload image or video"}
        </button>
        <p className="mt-2 text-center text-xs text-slate-500">
          Images up to 5MB · Videos up to 50MB (MP4, WebM, MOV)
        </p>
        {message ? <p className="mt-3 text-center text-sm text-slate-600">{message}</p> : null}
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : items.length === 0 ? (
          <p className="rounded-xl bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm ring-1 ring-black/5">
            No gallery items yet. Upload your first photo or video.
          </p>
        ) : (
          items.map((item) => (
            <article
              key={item._id}
              className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
            >
              <div className="relative aspect-video bg-slate-100">
                {item.mediaType === "video" ? (
                  <video
                    src={item.url}
                    className="h-full w-full object-cover"
                    controls
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.title || "Gallery"} className="h-full w-full object-cover" />
                )}
                <span className="absolute left-2 top-2 rounded-md bg-black/60 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-white">
                  {item.mediaType}
                </span>
              </div>
              <div className="space-y-3 p-3">
                <label className="block text-sm">
                  <span className="mb-1 block text-xs font-medium text-slate-500">Title (optional)</span>
                  <input
                    type="text"
                    defaultValue={item.title}
                    placeholder="Add a title"
                    className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm"
                    onBlur={(e) => {
                      const next = e.target.value.trim();
                      if (next !== item.title) updateTitle(item._id, next);
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setDeleteId(item._id)}
                  className="w-full rounded-lg border border-red-200 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete this media?"
        message="This removes it from the gallery and Cloudinary."
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => !deleting && setDeleteId(null)}
      />
    </div>
  );
}
