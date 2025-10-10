"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SocialLinkItem } from "./social-link-items";
import type { Database } from "@/types/database.types";

type SocialLink = Database["public"]["Tables"]["social_links"]["Row"];

interface SocialLinksManagerProps {
  storeId: string;
  socialLinks: SocialLink[];
}

// Define all available platforms
const ALL_PLATFORMS = [
  // Top 5 - Most popular
  { value: "instagram", label: "Instagram", popular: true },
  { value: "twitter", label: "Twitter/X", popular: true },
  { value: "tiktok", label: "TikTok", popular: true },
  { value: "youtube", label: "YouTube", popular: true },
  { value: "facebook", label: "Facebook", popular: true },

  // Others - Show more
  { value: "linkedin", label: "LinkedIn", popular: false },
  { value: "github", label: "GitHub", popular: false },
  { value: "discord", label: "Discord", popular: false },
  { value: "gmail", label: "Email", popular: false },
  { value: "portfolio", label: "Website", popular: false },
  { value: "other", label: "Other", popular: false },
];

export function SocialLinksManager({
  storeId,
  socialLinks,
}: SocialLinksManagerProps) {
  const [showAll, setShowAll] = useState(false);

  // Get popular platforms
  const popularPlatforms = ALL_PLATFORMS.filter((p) => p.popular);
  const otherPlatforms = ALL_PLATFORMS.filter((p) => !p.popular);

  // Platforms to display
  const displayedPlatforms = showAll ? ALL_PLATFORMS : popularPlatforms;

  // Get existing link for platform
  const getLinkForPlatform = (platform: string) => {
    return socialLinks.find((link) => link.platform === platform);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Links</CardTitle>
        <CardDescription>
          Add your social media profiles and website
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Display platforms */}
        {displayedPlatforms.map((platform) => {
          const existingLink = getLinkForPlatform(platform.value);

          return (
            <SocialLinkItem
              key={platform.value}
              storeId={storeId}
              platform={platform.value}
              platformLabel={platform.label}
              existingLink={existingLink}
            />
          );
        })}

        {/* Show More/Less Button */}
        {otherPlatforms.length > 0 && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                Show More ({otherPlatforms.length} more)
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
