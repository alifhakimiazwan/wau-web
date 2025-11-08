"use client";

import { memo } from "react";
import { Typography } from "@/components/ui/typography";
import { DEFAULT_BUTTON_CONFIG } from "@/lib/design/types";
import { usePreviewTheme } from "@/lib/preview/hooks/use-preview-theme";
import { useValidLinks } from "@/lib/preview/hooks/use-valid-links";
import type { StorefrontPreviewProps } from "@/lib/profile/types";
import { ProfileBio } from "../sections/profile-bio";
import { SocialIcons } from "../sections/social-icons";
import { ProductsList } from "../sections/products-list";

/**
 * Hero Layout
 * Profile picture as full-height background with content overlay
 */
export const HeroLayout = memo(function HeroLayout({
  name,
  bio,
  location,
  profilePicUrl,
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
    borderRadiusClass,
    validBlockShape,
  } = usePreviewTheme({
    theme,
    blockShape,
    colors,
  });

  return (
    <div
      className="min-h-full w-full transition-all duration-300 relative overflow-hidden flex flex-col"
      style={{ fontFamily }}
    >
      {/* Top Half: Profile Picture with Gradient */}
      <div className="relative h-[270px] sm:h-[320px] w-full overflow-hidden flex-shrink-0">
        {profilePicUrl ? (
          <img
            src={profilePicUrl}
            alt={name}
            className="w-full h-full object-cover object-center"
            loading="lazy"
            style={{ objectPosition: "center 30%" }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-gray-800 to-gray-900" />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, transparent 0%, ${primaryColor}00 70%, ${primaryColor} 100%)`,
          }}
        />

        {/* Overlaid Content: Name, Bio, Social Icons at bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 space-y-1 flex flex-col items-center">
          <SocialIcons
            socialLinks={validLinks}
            borderRadiusClass={borderRadiusClass}
            variant="glass"
            className="[&_svg]:text-white"
          />
          {name && (
            <Typography
              variant="h2"
              className="font-bold text-white drop-shadow-lg"
            >
              {name}
            </Typography>
          )}

          <ProfileBio
            bio={bio}
            location={location}
            className="text-white text-center mx-auto drop-shadow-md"
          />
        </div>
      </div>

      {/* Products Section */}
      <div
        className="flex-1 px-3 py-6"
        style={{ backgroundColor: primaryColor }}
      >
        <ProductsList
          products={products}
          designConfig={{
            themeId: theme || "original",
            fontFamily: fontFamily || "Inter",
            colors: {
              primary: primaryColor,
              accent: accentColor,
            },
            blockShape: validBlockShape as "square" | "rounded" | "pill",
            buttonConfig: buttonConfig || DEFAULT_BUTTON_CONFIG,
          }}
        />
      </div>
    </div>
  );
});
