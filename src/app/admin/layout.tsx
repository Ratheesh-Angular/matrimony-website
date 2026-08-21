import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { siteConfig } from "@/site.config";

export const dynamic = "force-dynamic";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/banners", label: "Banner" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/enquiries", label: "Enquiries" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Login page handles its own chrome via nested route group — check path via children only.
  // Auth gate for protected pages is done in each page; layout shows shell when authenticated.
  const authed = await isAdminAuthenticated();

  return (
    <div className="min-h-dvh flex-1 bg-slate-100 text-slate-900">
      {authed ? (
        <div className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
          <aside className="w-full shrink-0 rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5 lg:w-56">
            <p className="font-display text-lg font-semibold text-[var(--primary)]">
              {siteConfig.businessName}
            </p>
            <p className="text-xs text-slate-500">Admin</p>
            <nav className="mt-4 flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-50"
                >
                  {l.label}
                </Link>
              ))}
              <Link href="/" className="rounded-md px-3 py-2 text-sm text-slate-500 hover:bg-slate-50">
                View site
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
                  className="w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Log out
                </button>
              </form>
            </nav>
          </aside>
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
