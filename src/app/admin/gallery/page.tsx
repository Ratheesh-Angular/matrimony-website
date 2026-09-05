import { redirect } from "next/navigation";
import { GalleryManager } from "@/components/gallery/GalleryManager";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  return <GalleryManager />;
}
