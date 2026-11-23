"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function MemberNavActions({
  authenticated,
  isPremium,
  onNavigate,
}: {
  authenticated: boolean;
  isPremium: boolean;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/members/logout", { method: "POST" });
      onNavigate?.();
      router.refresh();
      router.push("/");
    } finally {
      setLoading(false);
    }
  }

  const linkClass =
    "rounded-md px-3 py-2 text-sm font-medium text-[var(--foreground)]/80 transition hover:bg-[var(--background)] hover:text-[var(--primary)]";

  if (authenticated) {
    return (
      <div className="flex flex-col gap-1 md:flex-row md:items-center">
        {!isPremium ? (
          <Link href="/premium" className={linkClass} onClick={onNavigate}>
            Premium
          </Link>
        ) : null}
        <button
          type="button"
          className={linkClass}
          disabled={loading}
          onClick={logout}
        >
          {loading ? "…" : "Logout"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 md:flex-row md:items-center">
      <Link href="/login" className={linkClass} onClick={onNavigate}>
        Login
      </Link>
      <Link href="/register" className={linkClass} onClick={onNavigate}>
        Register
      </Link>
    </div>
  );
}
