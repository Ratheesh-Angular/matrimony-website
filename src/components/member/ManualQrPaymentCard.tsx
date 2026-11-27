"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { PaymentStatus } from "@/models/Member";
import { siteConfig } from "@/site.config";

const UPI_ID = "9962881239@superyes";
const PAYEE_NAME = "SENTHIL KUMAR";
const QR_IMAGE_SRC = "/qr%20code.jpeg";

function formatSubmittedTime(iso: string | null) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "";
  }
}

export function ManualQrPaymentCard({
  amountInr,
  memberName,
  phone,
  initialStatus,
  initialSubmittedAt,
  initialReference,
}: {
  amountInr: number;
  memberName: string;
  phone: string;
  initialStatus: PaymentStatus;
  initialSubmittedAt: string | null;
  initialReference: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<PaymentStatus>(initialStatus);
  const [submittedAt, setSubmittedAt] = useState<string | null>(initialSubmittedAt);
  const [reference, setReference] = useState(initialReference);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [statusNote, setStatusNote] = useState("");
  const [error, setError] = useState("");

  async function copyUpiId() {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be unavailable in some browsers
    }
  }

  async function handlePaymentCompleted(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/members/payment-submitted", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentReference: reference.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Unable to submit payment confirmation");
      }
      if (json.alreadyPremium) {
        router.replace("/profiles");
        router.refresh();
        return;
      }
      setStatus("pending_review");
      setSubmittedAt(json.paymentSubmittedAt || new Date().toISOString());
      setReference(json.paymentReference ?? reference.trim());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function checkApprovalStatus() {
    setChecking(true);
    setStatusNote("");
    try {
      const res = await fetch("/api/members/me", { cache: "no-store" });
      const json = await res.json();
      if (json.isPremium) {
        router.replace("/profiles");
        router.refresh();
        return;
      }
      if (json.paymentStatus === "rejected") {
        setStatus("rejected");
        setStatusNote("");
        return;
      }
      setStatusNote("Still under review. Please check again shortly.");
    } catch {
      setStatusNote("Could not check status right now. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  const whatsappHelpHref = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
    `வணக்கம் ${siteConfig.businessName}! நான் ₹${amountInr} பிரீமியம் கட்டணம் செலுத்தியுள்ளேன். Name: ${memberName || "-"}, Mobile: +91 ${phone}${reference ? `, UTR: ${reference}` : ""}. என் கணக்கை செயல்படுத்த உதவுங்கள்.`,
  )}`;

  if (status === "pending_review") {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700 ring-4 ring-amber-50">
            <svg
              className="h-7 w-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>

          <h2 className="mt-4 font-tamil text-xl font-bold text-slate-900">
            கட்டண உறுதிப்படுத்தல் பெறப்பட்டது
          </h2>
          <p className="mt-1 text-sm font-semibold text-amber-800">
            Payment Confirmation Received — Under Admin Review
          </p>

          <p className="mt-4 text-sm leading-relaxed text-slate-700">
            Our admin will review your payment and your account will be enabled
            within <span className="font-semibold text-slate-900">30 mins – 1 hour</span>,
            then you can see profiles.
          </p>
          <p className="mt-2 font-tamil text-sm leading-relaxed text-slate-600">
            எங்கள் நிர்வாகி உங்கள் கட்டணத்தை சரிபார்த்து{" "}
            <span className="font-semibold text-slate-800">
              30 நிமிடம் – 1 மணி நேரத்திற்குள்
            </span>{" "}
            உங்கள் கணக்கை செயல்படுத்துவார். அதன் பிறகு அனைத்து அங்கீகரிக்கப்பட்ட
            வரன்களையும் பார்க்கலாம்.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-sm">
          <p className="font-semibold text-slate-800">Submitted Account Details</p>
          <dl className="mt-2 space-y-1.5 text-slate-600">
            {memberName ? (
              <div className="flex justify-between gap-2">
                <dt>Name</dt>
                <dd className="font-medium text-slate-900">{memberName}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-2">
              <dt>Mobile</dt>
              <dd className="font-medium text-slate-900">+91 {phone}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Amount</dt>
              <dd className="font-medium text-slate-900">₹{amountInr} (One-time)</dd>
            </div>
            {reference ? (
              <div className="flex justify-between gap-2">
                <dt>UPI Ref / UTR</dt>
                <dd className="font-mono text-xs font-semibold text-slate-900">
                  {reference}
                </dd>
              </div>
            ) : null}
            {submittedAt ? (
              <div className="flex justify-between gap-2">
                <dt>Submitted at</dt>
                <dd className="font-medium text-slate-900">
                  {formatSubmittedTime(submittedAt)}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={checkApprovalStatus}
            disabled={checking}
            className="inline-flex flex-1 items-center justify-center rounded-lg bg-[#0056b3] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#004494] disabled:opacity-60"
          >
            {checking ? "Checking…" : "Refresh Approval Status"}
          </button>
          <a
            href={whatsappHelpHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-1 items-center justify-center rounded-lg border border-emerald-600/30 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
          >
            Need Help? WhatsApp Us
          </a>
        </div>

        {statusNote ? (
          <p className="text-center text-xs font-medium text-slate-600">
            {statusNote}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#0056b3]/15 bg-[#f4f8fd] px-4 py-3 text-sm">
        <div>
          <p className="text-xs text-slate-500">Logged in account</p>
          <p className="font-semibold text-slate-900">
            {memberName ? `${memberName} · ` : ""}+91 {phone}
          </p>
        </div>
        <span className="rounded-full bg-[#d93025] px-3 py-1 text-xs font-bold text-white">
          ₹{amountInr} · Lifetime
        </span>
      </div>

      {status === "rejected" ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="font-semibold">Previous payment could not be verified</p>
          <p className="mt-1 text-xs leading-relaxed text-red-700">
            Please ensure you completed the ₹{amountInr} UPI transfer to{" "}
            <span className="font-semibold">{PAYEE_NAME}</span> and submit again
            below (adding your UPI Transaction ID / UTR helps us verify faster).
          </p>
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-center">
          <p className="font-tamil text-base font-bold text-[#0056b3]">
            கீழே உள்ள QR குறியீட்டை ஸ்கேன் செய்து ₹{amountInr} செலுத்தவும்
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Scan &amp; pay ₹{amountInr} using GPay, PhonePe, Paytm, Super.money,
            or any UPI app
          </p>
        </div>

        <div className="mx-auto mt-4 max-w-[270px] overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={QR_IMAGE_SRC}
            alt={`UPI QR Code to pay ₹${amountInr} to ${PAYEE_NAME}`}
            className="h-auto w-full rounded-lg object-contain"
          />
        </div>

        <div className="mt-4 flex flex-col items-center gap-1.5 rounded-xl bg-slate-50 px-4 py-3 text-center">
          <p className="text-xs font-medium text-slate-500">
            Payee: <span className="font-semibold text-slate-800">{PAYEE_NAME}</span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="font-mono text-xs font-semibold text-slate-800">
              {UPI_ID}
            </span>
            <button
              type="button"
              onClick={copyUpiId}
              className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-[#0056b3] transition hover:bg-slate-100"
            >
              {copied ? "Copied!" : "Copy UPI ID"}
            </button>
          </div>
        </div>

        <ol className="mt-4 space-y-1.5 rounded-xl bg-[#fffdf7] px-4 py-3 text-xs leading-relaxed text-slate-700 ring-1 ring-amber-200/70">
          <li>
            <span className="font-semibold text-slate-900">1.</span> Scan the QR
            code above and pay{" "}
            <span className="font-semibold text-slate-900">₹{amountInr}</span>.
          </li>
          <li>
            <span className="font-semibold text-slate-900">2.</span> Optionally
            enter your UPI Transaction ID / UTR below for faster verification.
          </li>
          <li>
            <span className="font-semibold text-slate-900">3.</span> Click{" "}
            <span className="font-semibold text-slate-900">Payment Completed</span>.
            Our admin will verify and enable your account within 30 mins – 1 hour.
          </li>
        </ol>
      </div>

      <form onSubmit={handlePaymentCompleted} className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">
            UPI Transaction ID / UTR{" "}
            <span className="font-normal text-slate-400">(optional)</span>
          </span>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            maxLength={80}
            placeholder="e.g. 412345678901 (helps faster approval)"
            className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm focus:border-[#0056b3] focus:outline-none focus:ring-2 focus:ring-[#0056b3]/15"
          />
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
        >
          {loading ? "Submitting confirmation…" : "Payment Completed"}
        </button>
      </form>
    </div>
  );
}
