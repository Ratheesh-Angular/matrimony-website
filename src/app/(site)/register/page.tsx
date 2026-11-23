import { redirect } from "next/navigation";
import { MemberAuthForm } from "@/components/member/MemberAuthForm";
import { getMemberFromSession } from "@/lib/member-auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Register",
};

export default async function RegisterPage() {
  const member = await getMemberFromSession();
  if (member?.isPremium) redirect("/profiles");
  if (member) redirect("/premium");

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <MemberAuthForm mode="register" nextPath="/premium" />
    </div>
  );
}
