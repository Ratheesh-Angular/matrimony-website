"use client";

import { FormEvent, useState } from "react";

type FormType = "contact" | "enquiry";

export function ContactForm({
  type = "contact",
  title,
}: {
  type?: FormType;
  title?: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      phone: String(data.get("phone") || ""),
      subject: String(data.get("subject") || ""),
      message: String(data.get("message") || ""),
      type,
    };

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Something went wrong");
      }
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to send");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl bg-[var(--surface)] p-6 shadow-sm ring-1 ring-black/5">
      {title ? <h2 className="font-display text-2xl font-semibold text-[var(--primary)]">{title}</h2> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Name *</span>
          <input
            name="name"
            required
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2 outline-none focus:border-[var(--accent)]"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Phone</span>
          <input
            name="phone"
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2 outline-none focus:border-[var(--accent)]"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Email</span>
          <input
            type="email"
            name="email"
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2 outline-none focus:border-[var(--accent)]"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Subject</span>
          <input
            name="subject"
            className="w-full rounded-md border border-black/10 bg-white px-3 py-2 outline-none focus:border-[var(--accent)]"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Message *</span>
        <textarea
          name="message"
          required
          rows={5}
          className="w-full rounded-md border border-black/10 bg-white px-3 py-2 outline-none focus:border-[var(--accent)]"
        />
      </label>

      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-md bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-dark)] disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : type === "enquiry" ? "Send enquiry" : "Send message"}
      </button>

      {status === "success" ? (
        <p className="text-sm font-medium text-[var(--accent)]">Thanks — we received your message.</p>
      ) : null}
      {status === "error" ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
    </form>
  );
}
