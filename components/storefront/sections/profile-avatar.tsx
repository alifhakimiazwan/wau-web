"use client";

import { ThemedAvatar } from "@/components/ui/themed/avatar";
import { getInitials } from "@/lib/profile/actions";
import type { AvatarConfig } from "@/lib/design/types";

interface ProfileAvatarProps {
  name: string;
  profilePicUrl?: string | null;
  avatarConfig?: AvatarConfig;
}

export function ProfileAvatar({
  name,
  profilePicUrl,
  avatarConfig,
}: ProfileAvatarProps) {
  return (
    <div className="relative">
      <ThemedAvatar
        src={profilePicUrl || undefined}
        alt={name}
        fallback={getInitials(name)}
        avatarConfig={avatarConfig}
      />
    </div>
  );
}
