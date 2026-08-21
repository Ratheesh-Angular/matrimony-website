import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isProfileGateAuthenticated } from "@/lib/profile-gate-auth";
import ProfileGateLoginForm from "./ProfileGateLoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profile access",
  description: "Sign in to view matrimony profile details",
};

export default async function ProfileDetailsLoginPage() {
  if (await isProfileGateAuthenticated()) {
    redirect("/profile-details");
  }

  return <ProfileGateLoginForm />;
}
