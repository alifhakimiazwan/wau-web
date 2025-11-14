"use client";

import { cn } from "@/lib/utils";
import { getSocialIcon } from "@/lib/theme/actions";
import type { SocialLink } from "@/lib/profile/types";

interface SocialIconsProps {
  socialLinks: SocialLink[] | Array<{ platform: string; url: string }>;
  borderRadiusClass?: string;
  className?: string;
  iconSize?: number;
  variant?: "default" | "glass";
}

export function SocialIcons({
  socialLinks,
  borderRadiusClass = "rounded-lg",
  className,
  iconSize = 6,
  variant = "default",
}: SocialIconsProps) {
  if (!socialLinks || socialLinks.length === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4 flex-wrap",
        className
      )}
    >
      {socialLinks.map((link, index) => {
        const Icon = getSocialIcon(link.platform);

        return (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "p-1 transition-all hover:scale-110",
              variant === "glass" &&
                "bg-white/20 backdrop-blur-sm hover:bg-white/30",
              borderRadiusClass
            )}
            aria-label={`Visit ${link.platform}`}
          >
            <Icon className={`h-${iconSize} w-${iconSize}`} />
          </a>
        );
      })}
    </div>
  );
}
