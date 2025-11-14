"use client";

import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import type { DesignCustomization } from "@/lib/design/types";
import { cn } from "@/lib/utils";
import { getBorderRadius } from "@/lib/utils/design-helpers";
import { getYoutubeEmbedUrl, getSpotifyEmbedUrl } from "@/lib/theme/actions";
import { useAnalyticsContext } from "@/components/analytics/analytics-provider";
import { trackProductClick } from "@/lib/analytics/actions";

interface LinkEmbedPreviewProps {
  url?: string;
  designConfig?: DesignCustomization | null;
  cardBackgroundColor?: string;
  cardShadow?: boolean;
  // Analytics props
  productId?: string;
  storeId?: string;
  isPreview?: boolean;
}

export function LinkEmbedPreview({
  url = "https://example.com",
  designConfig,
  cardBackgroundColor = '#FFFFFF',
  cardShadow = false,
  productId,
  storeId,
  isPreview = false,
}: LinkEmbedPreviewProps) {
  const borderRadius = getBorderRadius(designConfig);

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

  const youtubeEmbedUrl = getYoutubeEmbedUrl(url);
  const spotifyEmbedUrl = getSpotifyEmbedUrl(url);

  const isEmbeddable = youtubeEmbedUrl || spotifyEmbedUrl;

  // Handle click for non-embeddable content - track and navigate
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
        "overflow-hidden py-0 border-1",
        isClickable && !isEmbeddable && "cursor-pointer transition-all hover:opacity-90 hover:scale-[1.02]",
        borderRadius
      )}
      style={{
        backgroundColor: cardBackgroundColor,
        boxShadow: cardShadow
          ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 2px 5px -2px rgba(0, 0, 0, 0.2)"
          : undefined,
      }}
    >
      <div className="space-y-4">
        {youtubeEmbedUrl ? (
          <div className="w-full aspect-video">
            <iframe
              src={youtubeEmbedUrl}
              className="w-full h-full rounded-md"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="YouTube video player"
            />
          </div>
        ) : spotifyEmbedUrl ? (
          <div className="w-full h-[152px]">
            <iframe
              src={spotifyEmbedUrl}
              className="w-full h-full rounded-md"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Spotify embed player"
            />
          </div>
        ) : (
          <div className="w-full aspect-video bg-muted rounded-md flex flex-col items-center justify-center gap-3">
            <ExternalLink className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
      </div>
    </Card>
  );

  // If not clickable or embeddable content, just return the card
  if (!isClickable || isEmbeddable) {
    return <div className="w-full max-w-md mx-auto">{content}</div>;
  }

  // On storefront with non-embeddable content - wrap in clickable link
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
