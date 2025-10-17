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
import { PLATFORM_CATEGORIES } from "./constants";
import type { Database } from "@/types/database.types";

type SocialLink = Database["public"]["Tables"]["social_links"]["Row"];

interface SocialLinksManagerProps {
  storeId: string;
  socialLinks: SocialLink[];
}

export function SocialLinksManager({
  storeId,
  socialLinks,
}: SocialLinksManagerProps) {
  const [showAll, setShowAll] = useState(false);

  // Combine platform categories into a single array for display
  const popularPlatforms = PLATFORM_CATEGORIES.popular;
  const otherPlatforms = PLATFORM_CATEGORIES.other;
  const allPlatforms = [...popularPlatforms, ...otherPlatforms];

  // Platforms to display
  const displayedPlatforms = showAll ? allPlatforms : popularPlatforms;

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
