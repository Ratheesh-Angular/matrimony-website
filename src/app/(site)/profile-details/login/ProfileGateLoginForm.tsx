"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileGateLoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const username = String(fd.get("username") || "").trim();
    const password = String(fd.get("password") || "");
    try {
      const res = await fetch("/api/profile-gate/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Login failed");
      router.replace("/profile-details");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12 sm:px-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6"
      >
        <h1 className="font-display text-xl font-semibold text-[var(--primary)] sm:text-2xl">
          Profile access
        </h1>
        <p className="text-sm text-slate-500">
          Enter your username and password to view profile details.
        </p>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Username</span>
          <input
            type="text"
            name="username"
            required
            autoComplete="username"
            className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-base"
            autoFocus
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Password</span>
          <input
            type="password"
            name="password"
            required
            autoComplete="current-password"
            className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-base"
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
