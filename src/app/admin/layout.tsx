import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { siteConfig } from "@/site.config";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdminAuthenticated();

  return (
    <div className="min-h-dvh flex-1 bg-slate-100 text-slate-900">
      {authed ? (
        <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 py-5 sm:px-6">
          <header className="mb-5 flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-black/5">
            <div className="min-w-0">
              <p className="truncate font-display text-base font-semibold text-[var(--primary)]">
                {siteConfig.businessName}
              </p>
              <p className="text-xs text-slate-500">Admin</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Link
                href="/admin"
                className="rounded-md px-2.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Home
              </Link>
              <Link
                href="/"
                className="rounded-md px-2.5 py-2 text-sm text-slate-500 hover:bg-slate-50"
              >
                Site
              </Link>
              <form
                action={async () => {
                  "use server";
                  const { getClearAdminCookieOptions } = await import("@/lib/auth");
                  const { cookies } = await import("next/headers");
                  const jar = await cookies();
                  const c = getClearAdminCookieOptions();
                  jar.set(c.name, c.value, c);
                  redirect("/admin/login");
                }}
              >
                <button
                  type="submit"
                  className="rounded-md px-2.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Log out
                </button>
              </form>
            </div>
          </header>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
