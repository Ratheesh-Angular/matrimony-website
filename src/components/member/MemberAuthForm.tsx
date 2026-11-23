"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "login" | "register";

export function MemberAuthForm({
  mode,
  nextPath = "/premium",
}: {
  mode: Mode;
  nextPath?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const phone = String(form.get("phone") || "").trim();
    const password = String(form.get("password") || "");
    const confirmPassword = String(form.get("confirmPassword") || "");

    try {
      const res = await fetch(
        mode === "login" ? "/api/members/login" : "/api/members/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            mode === "login"
              ? { phone, password }
              : { phone, password, confirmPassword },
          ),
        },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");

      const dest = json.isPremium ? "/profiles" : nextPath;
      router.replace(dest);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5"
    >
      <div>
        <h1 className="font-tamil text-2xl font-semibold text-[var(--primary)]">
          {mode === "login" ? "உள்நுழைவு" : "கணக்கு உருவாக்கம்"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {mode === "login"
            ? "Login with your mobile number and password"
            : "Create an account with mobile number and password"}
        </p>
      </div>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Mobile number</span>
        <input
          type="tel"
          name="phone"
          required
          inputMode="numeric"
          autoComplete="tel"
          placeholder="10-digit number"
          className="w-full rounded-md border border-slate-200 px-3 py-2.5"
          autoFocus
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Password</span>
        <input
          type="password"
          name="password"
          required
          minLength={6}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className="w-full rounded-md border border-slate-200 px-3 py-2.5"
        />
      </label>

      {mode === "register" ? (
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Confirm password</span>
          <input
            type="password"
            name="confirmPassword"
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full rounded-md border border-slate-200 px-3 py-2.5"
          />
        </label>
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading
          ? mode === "login"
            ? "Signing in…"
            : "Creating…"
          : mode === "login"
            ? "Sign in"
            : "Create account"}
      </button>

      <p className="text-center text-sm text-slate-600">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/register" className="font-semibold text-[var(--primary)]">
              Register
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[var(--primary)]">
              Login
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
