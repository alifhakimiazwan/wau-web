"use client";

import { memo } from "react";
import { DEFAULT_BUTTON_CONFIG } from "@/lib/design/types";
import { usePreviewTheme } from "@/lib/preview/hooks/use-preview-theme";
import { StorefrontPreviewProps } from "@/lib/profile/types";
import { DefaultLayout } from "./layouts/default-layout";
import { HeroLayout } from "./layouts/hero-layout";
import { BentoLayout } from "./layouts/bento-layout";

/**
 * Main Storefront Component
 * Routes to the appropriate layout based on theme configuration
 */
export const StorefrontPreview = memo(function StorefrontPreview({
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
  const { themeConfig } = usePreviewTheme({ theme, blockShape, colors });

  // Route to appropriate layout based on theme config
  if (themeConfig?.layout === "hero") {
    return (
      <HeroLayout
        name={name}
        bio={bio}
        location={location}
        profilePicUrl={profilePicUrl}
        bannerPicUrl={bannerPicUrl}
        socialLinks={socialLinks}
        products={products}
        theme={theme}
        fontFamily={fontFamily}
        blockShape={blockShape}
        colors={colors}
        buttonConfig={buttonConfig}
      />
    );
  }

  if (themeConfig?.layout === "bento") {
    return (
      <BentoLayout
        name={name}
        bio={bio}
        location={location}
        profilePicUrl={profilePicUrl}
        bannerPicUrl={bannerPicUrl}
        socialLinks={socialLinks}
        products={products}
        theme={theme}
        fontFamily={fontFamily}
        blockShape={blockShape}
        colors={colors}
        buttonConfig={buttonConfig}
      />
    );
  }

  // Default layout
  return (
    <DefaultLayout
      name={name}
      bio={bio}
      location={location}
      profilePicUrl={profilePicUrl}
      bannerPicUrl={bannerPicUrl}
      socialLinks={socialLinks}
      products={products}
      theme={theme}
      fontFamily={fontFamily}
      blockShape={blockShape}
      colors={colors}
      buttonConfig={buttonConfig}
    />
  );
});
