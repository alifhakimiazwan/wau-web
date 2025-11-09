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

/**
 * Default Layout
 * Centered profile with optional banner
 */
export const DefaultLayout = memo(function DefaultLayout({
  storeId,
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

  const showBanner = themeConfig?.showBanner && bannerPicUrl;

  return (
    <div
      className={cn("min-h-full transition-all duration-300")}
      style={{
        fontFamily,
        backgroundColor: primaryColor,
        color: textColor,
      }}
    >
      {showBanner && (
        <div className="w-full h-32 relative">
          <img
            src={bannerPicUrl}
            alt="Banner"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div
        className={cn(
          "px-3 space-y-6 pb-6",
          showBanner ? "py-0 -mt-16" : "py-6"
        )}
      >
        <div className="flex flex-col items-center text-center space-y-1">
          <div className={cn(showBanner && "shadow-xl rounded-full")}>
            <ProfileAvatar
              name={name}
              profilePicUrl={profilePicUrl}
              avatarConfig={themeConfig?.avatar}
            />
          </div>

          {name && <ProfileHeader name={name} />}

          <ProfileBio bio={bio} location={location} />

          <SocialIcons
            socialLinks={validLinks}
            borderRadiusClass={borderRadiusClass}
          />
        </div>

        {/* Products Section */}
        <ProductsList
          products={products}
          storeId={storeId || ""}
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
