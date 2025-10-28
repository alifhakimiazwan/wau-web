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
}

export function LinkEmbedPreview({
  url = "https://example.com",
  designConfig,
}: LinkEmbedPreviewProps) {
  const borderRadius = getBorderRadius(designConfig);

  const youtubeEmbedUrl = getYoutubeEmbedUrl(url);
  const spotifyEmbedUrl = getSpotifyEmbedUrl(url);

  const isEmbeddable = youtubeEmbedUrl || spotifyEmbedUrl;

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <Card className={cn("overflow-hidden py-0 border-none", borderRadius)}>
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
