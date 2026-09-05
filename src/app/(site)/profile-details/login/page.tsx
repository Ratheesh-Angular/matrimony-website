import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin login",
  description: "Sign in to manage matrimony profiles",
};

export default async function ProfileDetailsLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }
  redirect("/admin/login");
}
