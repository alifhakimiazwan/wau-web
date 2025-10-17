"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import type { DesignTheme } from "@/lib/design/types";

interface ThemePreviewCardProps {
  theme: DesignTheme;
  isSelected: boolean;
  onSelect: () => void;
}

export function ThemePreviewCard({
  theme,
  isSelected,
  onSelect,
}: ThemePreviewCardProps) {
  return (
    <Card
      className={cn(
        "relative cursor-pointer transition-all hover:scale-105 overflow-hidden",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
      onClick={onSelect}
    >
      {/* Preview Area */}
      <div
        className="h-48 w-full relative"
        style={{ background: theme.thumbnail }}
      >
        {/* Mini Mockup */}
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div
            className={cn(
              "w-full max-w-[160px] rounded-lg p-4 space-y-2",
              theme.preview
            )}
          >
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-current/20 mx-auto" />
            {/* Name */}
            <div className="h-3 bg-current/30 rounded w-3/4 mx-auto" />
            {/* Bio */}
            <div className="h-2 bg-current/20 rounded w-full" />
            <div className="h-2 bg-current/20 rounded w-2/3 mx-auto" />
            {/* Links */}
            <div className="space-y-1.5 pt-2">
              <div className="h-8 bg-current/15 rounded" />
              <div className="h-8 bg-current/15 rounded" />
            </div>
          </div>
        </div>

        {/* Selected Badge */}
        {isSelected && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
            <Check className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Theme Info */}
      <div className="p-4 space-y-1">
        <Typography variant="h4" className="text-sm font-semibold">
          {theme.name}
        </Typography>
        <Typography variant="muted" className="text-xs">
          {theme.description}
        </Typography>
      </div>
    </Card>
  );
}
