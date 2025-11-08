"use client";

import { LucideBadgeCheck } from "lucide-react";
import { Typography } from "@/components/ui/typography";

interface ProfileHeaderProps {
  name: string;
  showVerifiedBadge?: boolean;
  className?: string;
}

export function ProfileHeader({
  name,
  showVerifiedBadge = true,
  className,
}: ProfileHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <Typography
        variant="h3"
        className={`font-bold tracking-tighter ${className || ""}`}
      >
        {name}
      </Typography>
      {showVerifiedBadge && (
        <LucideBadgeCheck className="text-blue-500 h-5 w-5" />
      )}
    </div>
  );
}
