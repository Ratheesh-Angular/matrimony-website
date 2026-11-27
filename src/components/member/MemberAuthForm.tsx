"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@/components/ui/PasswordInput";

type Mode = "login" | "register";

function IndiaFlagIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 16"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="24" height="16" rx="1.5" fill="#fff" />
      <rect width="24" height="5.33" y="0" fill="#FF9933" />
      <rect width="24" height="5.33" y="10.67" fill="#138808" />
      <circle cx="12" cy="8" r="2.1" fill="none" stroke="#000080" strokeWidth="0.7" />
      <circle cx="12" cy="8" r="0.35" fill="#000080" />
    </svg>
  );
}

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
    const name = String(form.get("name") || "").trim();
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
              : { name, phone, password, confirmPassword },
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
      method="post"
      action="#"
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
            : "Create an account with your name, mobile number, and password"}
        </p>
      </div>

      {mode === "register" ? (
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Full name</span>
          <input
            type="text"
            name="name"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            placeholder="Enter your full name"
            className="w-full rounded-md border border-slate-200 px-3 py-2.5"
            autoFocus
          />
        </label>
      ) : null}

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Mobile number</span>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center gap-1.5 pl-3">
            <IndiaFlagIcon className="h-3.5 w-[1.35rem] shrink-0 rounded-[2px] shadow-sm ring-1 ring-black/10" />
            <span className="text-sm font-medium text-slate-600">+91</span>
            <span className="h-4 w-px bg-slate-200" aria-hidden />
          </span>
          <input
            type="tel"
            name="phone"
            required
            inputMode="numeric"
            autoComplete="tel"
            placeholder="10-digit number"
            maxLength={10}
            pattern="[6-9][0-9]{9}"
            title="Enter a 10-digit Indian mobile number"
            className="w-full rounded-md border border-slate-200 py-2.5 pl-[5.25rem] pr-3"
            autoFocus={mode === "login"}
            onInput={(e) => {
              e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 10);
            }}
          />
        </div>
      </label>

      <label className="block text-sm">
        <span className="mb-1 block font-medium">Password</span>
        <PasswordInput
          name="password"
          required
          minLength={6}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </label>

      {mode === "register" ? (
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Confirm password</span>
          <PasswordInput
            name="confirmPassword"
            required
            minLength={6}
            autoComplete="new-password"
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
