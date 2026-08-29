"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatusDialog } from "@/components/ui/StatusDialog";
import type { ProfileStatus } from "@/lib/profiles";

type ProfileCardActionsProps = {
  profileId: string;
  status: ProfileStatus;
  layout?: "card" | "toolbar";
  onDeleted?: () => void;
};

type PendingAction = "reject" | "delete" | null;

type StatusFeedback = {
  variant: "success" | "error";
  title: string;
  message: string;
  afterClose?: "refresh" | "deleted";
} | null;

const SUCCESS_COPY = {
  approved: {
    title: "Profile approved",
    message: "This profile is now visible on the homepage.",
  },
  rejected: {
    title: "Profile rejected",
    message: "This profile is hidden from the public homepage.",
  },
  deleted: {
    title: "Profile deleted",
    message: "The biodata was permanently removed.",
  },
} as const;

export function ProfileCardActions({
  profileId,
  status,
  layout = "card",
  onDeleted,
}: ProfileCardActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<PendingAction>(null);
  const [feedback, setFeedback] = useState<StatusFeedback>(null);

  const handleFeedbackClose = useCallback(() => {
    const afterClose = feedback?.afterClose;
    setFeedback(null);
    if (afterClose === "deleted") {
      if (onDeleted) {
        onDeleted();
      } else {
        router.refresh();
      }
      return;
    }
    if (afterClose === "refresh") {
      router.refresh();
    }
  }, [feedback, onDeleted, router]);

  async function patchStatus(next: "approved" | "rejected") {
    setLoading(true);
    try {
      const res = await fetch(`/api/profiles/${profileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Update failed");
      }
      setPending(null);
      const copy = SUCCESS_COPY[next];
      setFeedback({
        variant: "success",
        title: copy.title,
        message: copy.message,
        afterClose: "refresh",
      });
    } catch (err) {
      setPending(null);
      setFeedback({
        variant: "error",
        title: "Unable to update profile",
        message: err instanceof Error ? err.message : "Unable to update profile.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    setLoading(true);
    try {
      const res = await fetch(`/api/profiles/${profileId}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Delete failed");
      }
      setPending(null);
      setFeedback({
        variant: "success",
        title: SUCCESS_COPY.deleted.title,
        message: SUCCESS_COPY.deleted.message,
        afterClose: "deleted",
      });
    } catch (err) {
      setPending(null);
      setFeedback({
        variant: "error",
        title: "Unable to delete profile",
        message: err instanceof Error ? err.message : "Unable to delete profile.",
      });
    } finally {
      setLoading(false);
    }
  }

  const btnBase =
    layout === "toolbar"
      ? "rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 sm:text-sm sm:px-4 sm:py-2"
      : "flex-1 rounded-lg px-2 py-2 text-xs font-semibold transition disabled:opacity-50 sm:text-sm";

  const actionsDisabled = loading || feedback !== null;

  return (
    <>
      <div
        className={
          layout === "toolbar"
            ? "flex flex-wrap items-center gap-2"
            : "flex flex-wrap gap-2"
        }
      >
        {status !== "approved" ? (
          <button
            type="button"
            disabled={actionsDisabled}
            onClick={() => patchStatus("approved")}
            className={`${btnBase} bg-emerald-600 text-white hover:bg-emerald-700`}
          >
            Approve
          </button>
        ) : null}
        {status !== "rejected" ? (
          <button
            type="button"
            disabled={actionsDisabled}
            onClick={() => setPending("reject")}
            className={`${btnBase} border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100`}
          >
            Reject
          </button>
        ) : null}
        <button
          type="button"
          disabled={actionsDisabled}
          onClick={() => setPending("delete")}
          className={`${btnBase} border border-red-200 bg-red-50 text-red-700 hover:bg-red-100`}
        >
          Delete
        </button>
      </div>

      <ConfirmDialog
        open={pending === "reject"}
        title="Reject this profile?"
        message="This profile will be hidden from the public homepage. You can still view it here as rejected."
        confirmLabel="Reject profile"
        variant="default"
        loading={loading}
        onCancel={() => setPending(null)}
        onConfirm={() => patchStatus("rejected")}
      />

      <ConfirmDialog
        open={pending === "delete"}
        title="Delete this profile?"
        message="This will permanently remove the biodata from the database. This action cannot be undone."
        confirmLabel="Delete permanently"
        variant="danger"
        loading={loading}
        onCancel={() => setPending(null)}
        onConfirm={remove}
      />

      <StatusDialog
        open={feedback !== null}
        title={feedback?.title ?? ""}
        message={feedback?.message ?? ""}
        variant={feedback?.variant ?? "success"}
        onClose={handleFeedbackClose}
      />
    </>
  );
}
