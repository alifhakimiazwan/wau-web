"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { DEFAULT_BUTTON_CONFIG } from "@/lib/design/types";
import { usePreviewTheme } from "@/lib/preview/hooks/use-preview-theme";
import { useValidLinks } from "@/lib/preview/hooks/use-valid-links";
import { StorefrontPreviewProps } from "@/lib/profile/types";
import { ProfileAvatar } from "../sections/profile-avatar";
import { ProfileHeader } from "../sections/profile-header";
import { ProfileBio } from "../sections/profile-bio";
import { SocialIcons } from "../sections/social-icons";
import { ProductsList } from "../sections/products-list";
import { Card } from "@/components/ui/card";
import { getBorderRadius } from "@/lib/utils/design-helpers";

/**
 * Bento Layout
 * Profile info in a horizontal card with avatar on left, info on right
 */
export const BentoLayout = memo(function BentoLayout({
  name,
  bio,
  location,
  profilePicUrl,
  bannerPicUrl,
  socialLinks,
  products = [],
  theme = "minimal_white",
  fontFamily = "Inter",
  blockShape = "rounded",
  colors,
  buttonConfig = DEFAULT_BUTTON_CONFIG,
}: StorefrontPreviewProps) {
  const validLinks = useValidLinks(socialLinks);
  const {
    themeConfig,
    primaryColor,
    accentColor,
    textColor,
    validBlockShape,
    borderRadiusClass,
  } = usePreviewTheme({ theme, blockShape, colors });

  const cardBackgroundColor = themeConfig?.cardBackgroundColor || "#FFFFFF";
  const cardShadow = themeConfig?.cardShadow || false;

  const designConfig = {
    themeId: theme || "original",
    fontFamily: fontFamily || "Inter",
    colors: {
      primary: primaryColor,
      accent: accentColor,
    },
    blockShape: validBlockShape as "square" | "rounded" | "pill",
    buttonConfig: buttonConfig || DEFAULT_BUTTON_CONFIG,
  };

  const cardBorderRadius = getBorderRadius(designConfig);

  return (
    <div
      className={cn("min-h-full transition-all duration-300")}
      style={{
        fontFamily,
        backgroundColor: primaryColor,
        color: textColor,
      }}
    >
      <div className="px-3 py-6 space-y-6">
        {/* Profile Card - Horizontal Layout */}
        <Card
          className={cn("overflow-hidden border-1 p-2", cardBorderRadius)}
          style={{
            backgroundColor: cardBackgroundColor,
            boxShadow: cardShadow
              ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 2px 5px -2px rgba(0, 0, 0, 0.2)"
              : undefined,
          }}
        >
          <div className="flex items-center gap-4">
            {/* Left: Profile Picture */}
            <div className="flex-shrink-0">
              <ProfileAvatar
                name={name}
                profilePicUrl={profilePicUrl}
                avatarConfig={themeConfig?.avatar}
              />
            </div>

            {/* Right: Name, Bio, Social Icons */}
            <div className="flex-1 min-w-0  text-left">
              {name && <ProfileHeader name={name} />}

              <ProfileBio bio={bio} location={location} />

              <SocialIcons
                socialLinks={validLinks}
                borderRadiusClass={borderRadiusClass}
                className="justify-start"
              />
            </div>
          </div>
        </Card>

        {/* Products Section */}
        <ProductsList products={products} designConfig={designConfig} />
      </div>
    </div>
  );
});
