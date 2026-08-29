"use client";

import { useEffect, useRef } from "react";

type StatusDialogProps = {
  open: boolean;
  title: string;
  message: string;
  variant?: "success" | "error";
  confirmLabel?: string;
  onClose: () => void;
};

export function StatusDialog({
  open,
  title,
  message,
  variant = "success",
  confirmLabel = "OK",
  onClose,
}: StatusDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const confirmClass =
    variant === "error"
      ? "bg-[#d93025] text-white hover:brightness-110"
      : "bg-emerald-600 text-white hover:bg-emerald-700";

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="status-dialog-title"
        aria-describedby="status-dialog-message"
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/10"
      >
        <h2
          id="status-dialog-title"
          className="font-tamil text-lg font-bold text-[#1a3a5c]"
        >
          {title}
        </h2>
        <p id="status-dialog-message" className="mt-2 text-sm leading-relaxed text-slate-600">
          {message}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            ref={confirmRef}
            type="button"
            onClick={onClose}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
