"use client";

import { memo } from "react";
import { usePreviewTheme } from "@/lib/theme/hooks/use-preview-theme";
import { useValidLinks } from "@/lib/theme/hooks/use-valid-links";
import { ProfileAvatar } from "./sections/profile-avatar";
import { ProfileHeader } from "./sections/profile-header";
import { ProfileBio } from "./sections/profile-bio";
import { SocialIcons } from "./sections/social-icons";
import { ProductsList } from "./sections/products-list";
import { DefaultLayout } from "./layouts/default-layout";
import { HeroLayout } from "./layouts/hero-layout";
import { BentoLayout } from "./layouts/bento-layout";
import type { PublicStoreData } from "@/lib/storefront/actions";

type LandingPageLayoutProps = PublicStoreData;

/**
 * Landing Page Layout
 * Responsive 2-column layout for customer-facing storefronts
 * - Mobile: Stack profile and products vertically (same as preview)
 * - Desktop: Profile on left (sticky), products on right (scrollable)
 */
export const LandingPageLayout = memo(function LandingPageLayout({
  store,
  products,
  socialLinks,
  customization,
}: LandingPageLayoutProps) {
  // Transform social links to expected format
  const transformedSocialLinks = socialLinks.map((link) => ({
    platform: link.platform,
    url: link.url || "",
  }));

  // Get theme configuration
  const theme = customization?.theme || "original";
  const fontFamily = customization?.font_family || "DM Sans";
  const blockShape = customization?.block_shape || "rounded";
  const primaryColor = customization?.primary_color;
  const accentColor = customization?.accent_color;
  const buttonStyle = customization?.button_style || "filled";

  const {
    themeConfig,
    primaryColor: resolvedPrimaryColor,
    accentColor: resolvedAccentColor,
    textColor,
    validBlockShape,
    borderRadiusClass,
  } = usePreviewTheme({
    theme,
    blockShape,
    colors:
      primaryColor && accentColor
        ? { primary: primaryColor, accent: accentColor }
        : undefined,
  });

  const buttonConfig = {
    style: buttonStyle as "filled" | "outlined" | "ghost",
  };

  // Prepare props for theme layouts
  const layoutProps = {
    storeId: store.id,
    name: store.name,
    bio: store.bio || undefined,
    location: store.location || undefined,
    profilePicUrl: store.profile_pic_url || undefined,
    bannerPicUrl: store.banner_pic_url || undefined,
    socialLinks: transformedSocialLinks,
    products,
    theme,
    fontFamily,
    blockShape,
    colors:
      primaryColor && accentColor
        ? { primary: primaryColor, accent: accentColor }
        : undefined,
    buttonConfig,
  };

  // Determine layout based on theme
  const themeLayout = themeConfig?.layout || "default";

  // Render mobile layout using theme-specific component
  const MobileLayout = () => {
    switch (themeLayout) {
      case "hero":
        return <HeroLayout {...layoutProps} />;
      case "bento":
        return <BentoLayout {...layoutProps} />;
      default:
        return <DefaultLayout {...layoutProps} />;
    }
  };

  return (
    <>
      {/* Mobile Layout: Use theme-specific layout */}
      <div
        className="lg:hidden min-h-screen"
        style={{
          fontFamily,
          backgroundColor: resolvedPrimaryColor,
          color: textColor,
        }}
      >
        <MobileLayout />
      </div>

      {/* Desktop Layout: Uniform 2-column grid for all themes */}
      <div
        className="hidden lg:block lg:min-h-screen"
        style={{
          fontFamily,
          backgroundColor: resolvedPrimaryColor,
          color: textColor,
        }}
      >
        <div className="lg:grid lg:grid-cols-[400px_1fr] lg:gap-8 lg:p-8 lg:max-w-7xl lg:mx-auto">
          {/* Left Column: Profile (Sticky) */}
          <div className="sticky top-8 h-fit flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <div className="flex flex-col items-center text-center space-y-4 w-full">
              <ProfileAvatar
                name={store.name}
                profilePicUrl={store.profile_pic_url || undefined}
                avatarConfig={themeConfig?.avatar}
              />

              <ProfileHeader name={store.name} />

              <ProfileBio
                bio={store.bio || undefined}
                location={store.location || undefined}
              />

              <SocialIcons
                socialLinks={socialLinks}
                borderRadiusClass={borderRadiusClass}
              />
            </div>
          </div>

          {/* Right Column: Products (Scrollable) */}
          <div className="pb-8">
            <ProductsList
              products={products}
              storeId={store.id}
              designConfig={{
                themeId: theme,
                fontFamily,
                colors: {
                  primary: resolvedPrimaryColor,
                  accent: resolvedAccentColor,
                },
                blockShape: validBlockShape as "square" | "rounded" | "pill",
                buttonConfig,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
});
