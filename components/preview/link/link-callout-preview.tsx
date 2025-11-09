"use client";

import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/themed/button";
import { Link2 } from "lucide-react";
import Image from "next/image";
import type { DesignCustomization } from "@/lib/design/types";
import { cn } from "@/lib/utils";
import { getBorderRadius } from "@/lib/utils/design-helpers";
import { useAnalyticsContext } from "@/components/analytics/analytics-provider";
import { trackProductClick } from "@/lib/analytics/actions";

interface LinkCalloutPreviewProps {
  name?: string;
  subtitle?: string;
  buttonText?: string;
  thumbnail?: string | null;
  url?: string;
  designConfig?: DesignCustomization | null;
  cardBackgroundColor?: string;
  cardShadow?: boolean;
  // Analytics props
  productId?: string;
  storeId?: string;
  isPreview?: boolean;
}

export function LinkCalloutPreview({
  name = "Your Link Title",
  subtitle,
  buttonText = "Visit Link",
  thumbnail,
  url = "https://example.com",
  designConfig,
  cardBackgroundColor = "#FFFFFF",
  cardShadow = false,
  productId,
  storeId,
  isPreview = false,
}: LinkCalloutPreviewProps) {
  const borderRadius = getBorderRadius(designConfig);
  const topBorderRadius = getBorderRadius(designConfig, "top");

  // Get analytics context only if on storefront (has productId and storeId)
  let analytics;
  try {
    analytics = productId && storeId && !isPreview ? useAnalyticsContext() : null;
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
        console.error('Error tracking product click:', error);
      });
    }
  };

  const content = (
    <Card
      className={cn(
        "overflow-hidden py-0 gap-0 border-1",
        isClickable && "cursor-pointer transition-all hover:opacity-90 hover:scale-[1.02]",
        borderRadius
      )}
      style={{
        backgroundColor: cardBackgroundColor,
        boxShadow: cardShadow
          ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 2px 5px -2px rgba(0, 0, 0, 0.2)"
          : undefined,
      }}
    >
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
