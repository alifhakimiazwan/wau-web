"use client";

import { memo } from "react";
import { LucideBadgeCheck } from "lucide-react";
import { IconMapPin } from "@tabler/icons-react";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { getSocialIcon } from "@/lib/preview/actions";
import { getInitials } from "@/lib/profile/actions";
import { DEFAULT_BUTTON_CONFIG } from "@/lib/design/types";
import { ThemedAvatar } from "../../../design/theme/theme-avatar";
import { ButtonPreviewMockup } from "../../../design/button/mock-button";
import { HeroStorefrontPreview } from "../hero/hero-storefront-preview";
import { usePreviewTheme } from "@/lib/preview/hooks/use-preview-theme";
import { useValidLinks } from "@/lib/preview/hooks/use-valid-links";
import { StorefrontPreviewProps } from "@/lib/profile/types";

export const StorefrontPreview = memo(function StorefrontPreview({
  name,
  bio,
  location,
  profilePicUrl,
  bannerPicUrl,
  socialLinks,
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

  if (themeConfig?.layout === "hero") {
    return (
      <HeroStorefrontPreview
        name={name}
        bio={bio}
        location={location}
        profilePicUrl={profilePicUrl}
        bannerPicUrl={bannerPicUrl}
        socialLinks={socialLinks}
        theme={theme}
        fontFamily={fontFamily}
        blockShape={blockShape}
        colors={colors}
        buttonConfig={buttonConfig}
      />
    );
  }

  return (
    <div
      className={cn("min-h-full transition-all duration-300")}
      style={{
        fontFamily,
        backgroundColor: primaryColor,
        color: textColor,
      }}
    >
      {bannerPicUrl && (
        <div className="w-full h-32 relative">
          <img
            src={bannerPicUrl}
            alt="Banner"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="px-6 py-6 space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="relative">
            <ThemedAvatar
              src={profilePicUrl || undefined}
              alt={name}
              fallback={getInitials(name)}
              avatarConfig={themeConfig?.avatar}
              blockShape={validBlockShape as "square" | "rounded" | "pill"}
              accentColor={accentColor}
            />
          </div>

          {/* Name with verified badge (like images) */}
          {name && (
            <div className="flex items-center gap-2">
              <Typography variant="h3" className="font-bold">
                {name}
              </Typography>
              <LucideBadgeCheck className="text-blue-500"></LucideBadgeCheck>
            </div>
          )}

          {bio && (
            <Typography variant="small" className="opacity-90 max-w-xs">
              {bio}
            </Typography>
          )}

          {location && (
            <div className="flex items-center gap-1.5 text-sm opacity-80">
              <IconMapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
          )}
          {validLinks.length > 0 && (
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {validLinks.map((link, index) => {
                const Icon = getSocialIcon(link.platform);

                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "p-2 transition-all hover:scale-110",
                      borderRadiusClass
                    )}
                    aria-label={`Visit ${link.platform}`}
                  >
                    <Icon className="h-6 w-6" />
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <ButtonPreviewMockup
          buttonConfig={buttonConfig}
          blockShape={blockShape}
          buttonEffect={themeConfig?.buttonEffect}
          accentColor={accentColor}
          fontFamily={fontFamily}
        />
      </div>
    </div>
  );
});
