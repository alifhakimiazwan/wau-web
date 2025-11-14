"use client";

import { Card } from "@/components/ui/card";
import { Link2 } from "lucide-react";
import Image from "next/image";
import type { DesignCustomization } from "@/lib/design/types";
import { cn } from "@/lib/utils";
import { getBorderRadius } from "@/lib/utils/design-helpers";
import { useAnalyticsContext } from "@/components/analytics/analytics-provider";
import { trackProductClick } from "@/lib/analytics/actions";

interface LinkClassicPreviewProps {
  name?: string;
  thumbnail?: string | null;
  url?: string;
  designConfig?: DesignCustomization | null;
  cardBackgroundColor?: string;
  cardShadow?: boolean;
  // Analytics props
  productId?: string;
  storeId?: string;
  isPreview?: boolean; // Don't track clicks in preview mode
}

export function LinkClassicPreview({
  name = "Your Link Title",
  thumbnail,
  url = "https://example.com",
  designConfig,
  cardBackgroundColor = "#FFFFFF",
  cardShadow = false,
  productId,
  storeId,
  isPreview = false,
}: LinkClassicPreviewProps) {
  const borderRadius = getBorderRadius(designConfig);

  // Get analytics context only if on storefront (has productId and storeId)
  let analytics;
  try {
    analytics =
      productId && storeId && !isPreview ? useAnalyticsContext() : null;
  } catch {
    // Not wrapped in AnalyticsProvider (e.g., in dashboard preview)
    analytics = null;
  }

  // Determine if this should be clickable
  const isClickable = productId && storeId && !isPreview;

  // Handle click - track and navigate
  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Track the click asynchronously (don't prevent default navigation)
    if (analytics && productId && storeId) {
      trackProductClick({
        storeId,
        productId,
        sessionId: analytics.sessionId || undefined,
        referrer: analytics.referrer,
        ...analytics.utmParams,
      }).catch((error) => {
        console.error("Error tracking product click:", error);
      });
    }
  };

  const content = (
    <Card
      className={cn(
        "overflow-hidden py-0 border-1",
        isClickable &&
          "cursor-pointer transition-all hover:opacity-90 hover:scale-[1.02]",
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
  );

  // If not clickable (dashboard preview), just return the card
  if (!isClickable) {
    return <div className="w-full max-w-md mx-auto">{content}</div>;
  }

  // On storefront - wrap in clickable link
  return (
    <div className="w-full max-w-md mx-auto">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="block no-underline"
      >
        {content}
      </a>
    </div>
  );
}
