"use client";

import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/design/button/link-button";
import { Link2 } from "lucide-react";
import Image from "next/image";
import type { DesignCustomization } from "@/lib/design/types";
import { cn } from "@/lib/utils";
import { getBorderRadius } from "@/lib/utils/design-helpers";

interface LinkCalloutPreviewProps {
  name?: string;
  subtitle?: string;
  buttonText?: string;
  thumbnail?: string | null;
  url?: string;
  designConfig?: DesignCustomization | null;
}

export function LinkCalloutPreview({
  name = "Your Link Title",
  subtitle,
  buttonText = "Visit Link",
  thumbnail,
  url = "https://example.com",
  designConfig,
}: LinkCalloutPreviewProps) {
  const borderRadius = getBorderRadius(designConfig);
  const topBorderRadius = getBorderRadius(designConfig, "top");

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <Card className={cn("overflow-hidden py-0 gap-0", borderRadius)}>
        {/* Thumbnail */}
        {thumbnail ? (
          <div
            className={cn(
              "relative w-full aspect-[2/1] overflow-hidden",
              topBorderRadius
            )}
          >
            <Image
              src={thumbnail}
              alt={name || "Link"}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div
            className={cn(
              "w-full aspect-[2/1] bg-muted flex items-center justify-center",
              topBorderRadius
            )}
          >
            <Link2 className="w-16 h-16 text-muted-foreground" />
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title and Subtitle */}
          <div className="text-left space-y-2">
            <h3 className="text-xl font-bold tracking-tight">
              {name || "Your Link Title"}
            </h3>
            {subtitle && (
              <p className="text-muted-foreground text-sm">{subtitle}</p>
            )}
          </div>

          {/* CTA Button */}
          <LinkButton
            label={buttonText || "Visit Link"}
            config={{
              style: designConfig?.buttonConfig.style || "filled",
              shape: designConfig?.blockShape || "rounded",
            }}
            accentColor={designConfig?.colors.accent}
          />
        </div>
      </Card>
    </div>
  );
}
