"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  isOrderSuccess,
  openRazorpayCheckout,
} from "@/lib/razorpay-checkout";
import { siteConfig } from "@/site.config";

export function PremiumCheckoutButton({
  amountInr,
  phone,
}: {
  amountInr: number;
  phone: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startPayment() {
    setLoading(true);
    setError("");
    try {
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
      });
      const orderJson = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderJson.error || "Unable to start payment");
      }

      await openRazorpayCheckout({
        key: orderJson.keyId,
        amount: orderJson.amount,
        currency: orderJson.currency || "INR",
        order_id: orderJson.orderId,
        name: siteConfig.businessName,
        description: `Lifetime premium · ₹${amountInr}`,
        prefill: { contact: phone },
        theme: { color: siteConfig.colors.primary },
        handler: async (response) => {
          if (!isOrderSuccess(response)) {
            setError("Unexpected payment response");
            setLoading(false);
            return;
          }
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyJson = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyJson.error || "Verification failed");
            }
            router.replace("/profiles");
            router.refresh();
          } catch (err) {
            setError(
              err instanceof Error ? err.message : "Verification failed",
            );
            setLoading(false);
          }
        },
        onDismiss: () => setLoading(false),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={startPayment}
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-lg bg-[#d93025] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#b8251c] disabled:opacity-60 sm:w-auto"
      >
        {loading ? "Opening payment…" : `Pay ₹${amountInr} — lifetime premium`}
      </button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
