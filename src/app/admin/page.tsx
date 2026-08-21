import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Banner } from "@/models/Banner";
import { Page } from "@/models/Page";
import { Enquiry } from "@/models/Enquiry";
import { ensureSeeded } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");

  await ensureSeeded();
  await connectDB();
  const [banners, pages, enquiries, newCount] = await Promise.all([
    Banner.countDocuments(),
    Page.countDocuments(),
    Enquiry.countDocuments(),
    Enquiry.countDocuments({ status: "new" }),
  ]);

  const cards = [
    { label: "Banners", value: banners, href: "/admin/banners" },
    { label: "Pages", value: pages, href: "/admin/pages" },
    { label: "Enquiries", value: enquiries, href: "/admin/enquiries" },
    { label: "New enquiries", value: newCount, href: "/admin/enquiries" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-[var(--primary)]">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Manage content for this client site.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition hover:ring-[var(--accent)]"
          >
            <p className="text-sm text-slate-500">{c.label}</p>
            <p className="mt-2 text-3xl font-semibold">{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
