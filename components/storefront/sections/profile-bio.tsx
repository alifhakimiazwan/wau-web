"use client";

import { IconMapPin } from "@tabler/icons-react";
import { Typography } from "@/components/ui/typography";

interface ProfileBioProps {
  bio?: string | null;
  location?: string | null;
  className?: string;
}

export function ProfileBio({ bio, location, className }: ProfileBioProps) {
  if (!bio && !location) return null;

  return (
    <div className={`space-y-2 ${className || ""}`}>
      {bio && (
        <Typography
          variant="muted"
          className="opacity-90 max-w-xs tracking-tighter"
        >
          {bio}
        </Typography>
      )}

      {location && (
        <div className="flex items-center gap-1.5 text-sm opacity-80">
          <IconMapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
      )}
    </div>
  );
}
