"use client";

import { useRouter } from "next/navigation";
import { ProfileCardActions } from "@/components/profile/ProfileCardActions";
import type { ProfileStatus } from "@/lib/profiles";

type ProfileDetailToolbarProps = {
  profileId: string;
  status: ProfileStatus;
};

export function ProfileDetailToolbar({ profileId, status }: ProfileDetailToolbarProps) {
  const router = useRouter();

  return (
    <ProfileCardActions
      profileId={profileId}
      status={status}
      layout="toolbar"
      onDeleted={() => router.push("/profile-details")}
    />
  );
}
