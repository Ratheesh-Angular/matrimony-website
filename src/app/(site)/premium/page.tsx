import Link from "next/link";
import { redirect } from "next/navigation";
import { PremiumCheckoutButton } from "@/components/member/PremiumCheckoutButton";
import { getMemberFromSession } from "@/lib/member-auth";
import { getPremiumAmountInr } from "@/lib/premium";
import { siteConfig } from "@/site.config";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Premium membership",
};

export default async function PremiumPage() {
  const member = await getMemberFromSession();
  if (member?.isPremium) redirect("/profiles");

  const amountInr = siteConfig.premium?.amountInr ?? getPremiumAmountInr();

  return (
    <div className="min-h-[70vh] bg-[linear-gradient(165deg,#fffef8_0%,#f8f1e4_50%,#e8f0fa_100%)] px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-lg rounded-2xl bg-white/90 p-6 shadow-md ring-1 ring-[#0056b3]/10 sm:p-8">
        <h1 className="font-tamil text-2xl font-bold text-[#d93025] sm:text-3xl">
          பிரீமியம் உறுப்பினர்
        </h1>
        <p className="mt-2 text-sm text-[#0056b3] sm:text-base">
          Premium membership · lifetime access
        </p>

        <div className="mt-6 space-y-3 text-sm leading-relaxed text-slate-700">
          <p className="font-tamil text-base text-slate-800">
            அங்கீகரிக்கப்பட்ட வரன்களைப் பார்க்க ஒருமுறை ₹{amountInr} செலுத்தி
            பிரீமியம் உறுப்பினராகுங்கள்.
          </p>
          <p>
            Pay a one-time fee of ₹{amountInr} for lifetime access to approved
            matrimony profiles. No recurring charges.
          </p>
        </div>

        <div className="mt-8">
          {!member ? (
            <div className="space-y-3">
              <Link
                href="/register"
                className="inline-flex w-full items-center justify-center rounded-lg bg-[#0056b3] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#004494]"
              >
                Create account & continue
              </Link>
              <p className="text-center text-sm text-slate-600">
                Already registered?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#0056b3] hover:underline"
                >
                  Login
                </Link>
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Logged in as{" "}
                <span className="font-semibold text-slate-900">
                  +91 {member.phone}
                </span>
              </p>
              <PremiumCheckoutButton
                amountInr={amountInr}
                phone={member.phone}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
