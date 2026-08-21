import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function UserDataRedirectPage() {
  redirect("/profile-details");
}
