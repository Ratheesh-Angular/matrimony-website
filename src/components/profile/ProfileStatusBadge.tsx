import type { ProfileStatus } from "@/lib/profiles";

const styles: Record<ProfileStatus, string> = {
  new: "bg-amber-100 text-amber-800 ring-amber-200",
  approved: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  rejected: "bg-slate-200 text-slate-700 ring-slate-300",
};

const labels: Record<ProfileStatus, string> = {
  new: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export function ProfileStatusBadge({ status }: { status: ProfileStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
