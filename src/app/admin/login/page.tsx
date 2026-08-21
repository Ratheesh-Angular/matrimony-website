import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import AdminLoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }
  return <AdminLoginForm />;
}
