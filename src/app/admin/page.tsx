import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

const actions = [
  {
    href: "/profile-details",
    title: "Manage Profiles",
    description: "View, approve, reject, or delete biodata submissions.",
    accent: "bg-[var(--primary)]",
  },
  {
    href: "/admin/gallery",
    title: "Manage Gallery",
    description: "Upload photos and videos shown on the public gallery page.",
    accent: "bg-[var(--accent)]",
  },
];

export default async function AdminDashboard() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-[var(--primary)] sm:text-3xl">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-slate-500">Choose what you want to manage.</p>

      <div className="mt-6 flex flex-col gap-4">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex min-h-[7.5rem] items-stretch overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition active:scale-[0.99] hover:ring-[var(--accent)]"
          >
            <span className={`w-2 shrink-0 ${action.accent}`} aria-hidden />
            <span className="flex flex-1 flex-col justify-center px-5 py-5">
              <span className="text-lg font-semibold text-slate-900 group-hover:text-[var(--primary)]">
                {action.title}
              </span>
              <span className="mt-1 text-sm leading-snug text-slate-500">{action.description}</span>
              <span className="mt-3 text-sm font-medium text-[var(--accent)]">Open →</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
