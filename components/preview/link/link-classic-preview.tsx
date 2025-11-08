"use client";

import { Card } from "@/components/ui/card";
import { Link2, ExternalLink } from "lucide-react";
import Image from "next/image";
import type { DesignCustomization } from "@/lib/design/types";
import { cn } from "@/lib/utils";
import { getBorderRadius } from "@/lib/utils/design-helpers";

interface LinkClassicPreviewProps {
  name?: string;
  thumbnail?: string | null;
  url?: string;
  designConfig?: DesignCustomization | null;
  cardBackgroundColor?: string;
  cardShadow?: boolean;
}

export function LinkClassicPreview({
  name = "Your Link Title",
  thumbnail,
  url = "https://example.com",
  designConfig,
  cardBackgroundColor = "#FFFFFF",
  cardShadow = false,
}: LinkClassicPreviewProps) {
  const borderRadius = getBorderRadius(designConfig);

  return (
    <div className="w-full max-w-md mx-auto">
      <Card
        className={cn(
          "overflow-hidden s cursor-pointer transition-shadow py-0 border-1",
          borderRadius
        )}
        style={{
          backgroundColor: cardBackgroundColor,
          boxShadow: cardShadow
            ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 2px 5px -2px rgba(0, 0, 0, 0.2)"
            : undefined,
        }}
      >
        <div className="flex items-center gap-3 p-3">
          {/* Thumbnail */}
          {thumbnail ? (
            <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-md">
              <Image
                src={thumbnail}
                alt={name || "Link"}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 flex-shrink-0 bg-muted rounded-md flex items-center justify-center">
              <Link2 className="w-8 h-8 text-muted-foreground" />
            </div>
          )}

          {/* Title */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">
              {name || "Your Link Title"}
            </h3>
          </div>
        </div>
      </Card>
    </div>
  );
}
