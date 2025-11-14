"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BorderBeam } from "@/components/ui/border-beam";
import { cn } from "@/lib/utils";
import type { AvatarConfig } from "@/lib/design/types";
import { getBlockShape } from "@/lib/theme/actions";

interface ThemedAvatarProps {
  src?: string;
  alt: string;
  fallback: string;
  avatarConfig?: AvatarConfig;
  className?: string;
}

export function ThemedAvatar({
  src,
  alt,
  fallback,
  avatarConfig,
  className,
}: ThemedAvatarProps) {
  const effect = avatarConfig?.effect || "none";
  const shape = avatarConfig?.shape || "pill";  // Default to pill if not specified
  const shapeClass = getBlockShape(shape);

  // ⭐ Render based on effect type
  const renderAvatar = () => {
    
    const baseAvatar = (
      <Avatar
        className={cn("h-24 w-24 border-4 border-current/20", shapeClass)}
      >
        <AvatarImage src={src} alt={alt} loading="lazy" />
        <AvatarFallback className="text-xl font-semibold">
          {fallback}
        </AvatarFallback>
      </Avatar>
    );

    switch (effect) {
      case "border-beam":
        return (
          <div className={cn("relative h-24 w-24", shapeClass)}>
            {baseAvatar}
            <BorderBeam
              duration={6}
              size={100}
              className="from-transparent via-red-500 to-transparent"
            />
            <BorderBeam
              duration={6}
              delay={3}
              size={100}
              borderWidth={2}
              className="from-transparent via-blue-500 to-transparent"
            />
          </div>
        );

      case "none":
      default:
        return baseAvatar;
    }
  };

  return <div className={cn("inline-block", className)}>{renderAvatar()}</div>;
}
