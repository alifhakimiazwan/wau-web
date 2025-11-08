"use client";

import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import type { DesignCustomization } from "@/lib/design/types";
import { cn } from "@/lib/utils";
import { getBorderRadius } from "@/lib/utils/design-helpers";
import { getYoutubeEmbedUrl, getSpotifyEmbedUrl } from "@/lib/preview/actions";

interface LinkEmbedPreviewProps {
  url?: string;
  designConfig?: DesignCustomization | null;
  cardBackgroundColor?: string;
  cardShadow?: boolean;
}

export function LinkEmbedPreview({
  url = "https://example.com",
  designConfig,
  cardBackgroundColor = '#FFFFFF',
  cardShadow = false,
}: LinkEmbedPreviewProps) {
  const borderRadius = getBorderRadius(designConfig);

  const youtubeEmbedUrl = getYoutubeEmbedUrl(url);
  const spotifyEmbedUrl = getSpotifyEmbedUrl(url);

  const isEmbeddable = youtubeEmbedUrl || spotifyEmbedUrl;

  return (
    <div className="w-full max-w-md mx-auto">
      <Card
        className={cn(
          "overflow-hidden py-0 border-1",
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
    </div>
  );
}
