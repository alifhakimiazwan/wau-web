"use client";

import { memo } from "react";
import { IconMapPin } from "@tabler/icons-react";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { getSocialIcon } from "@/lib/preview/actions";
import { DEFAULT_BUTTON_CONFIG } from "@/lib/design/buttonTypes";
import { ButtonPreviewMockup } from "../design/mock-button";
import { usePreviewTheme, useValidLinks } from "./hooks";
import type { StorefrontPreviewProps } from "./types";

export const HeroStorefrontPreview = memo(function HeroStorefrontPreview({
  name,
  bio,
  location,
  profilePicUrl,
  socialLinks,
  theme = "minimal_white",
  fontFamily = "Inter",
  blockShape = "rounded",
  colors,
  buttonConfig = DEFAULT_BUTTON_CONFIG,
}: StorefrontPreviewProps) {
  const validLinks = useValidLinks(socialLinks);
  const { themeConfig, accentColor, borderRadiusClass } = usePreviewTheme({
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
      <div className="relative h-[100%] w-full overflow-hidden">
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
        {/* Gradient fade to bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/0 to-black" />
      </div>

      {/* Bottom Half: Dark Background with Content */}
      <div className="flex-1 bg-black px-6 py-6 space-y-2 flex flex-col justify-center">
        {/* Name with verified badge */}
        {name && (
          <div className="flex items-center justify-center pb-0">
            <Typography variant="h2" className="font-bold text-white">
              {name}
            </Typography>
          </div>
        )}

        {bio && (
          <Typography
            variant="p"
            className="opacity-90 max-w-xs mx-auto text-center text-white mt-0"
          >
            {bio}
          </Typography>
        )}

        {location && (
          <div className="flex items-center justify-center gap-1.5 text-sm opacity-80 text-white">
            <IconMapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
        )}

        {validLinks.length > 0 && (
          <div className="flex items-center justify-center gap-4 flex-wrap pb-2">
            {validLinks.map((link, index) => {
              const Icon = getSocialIcon(link.platform);
              return (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "p-2 transition-all hover:scale-110 bg-white/20 backdrop-blur-sm hover:bg-white/30",
                    borderRadiusClass
                  )}
                  aria-label={`Visit ${link.platform}`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </a>
              );
            })}
          </div>
        )}

        <ButtonPreviewMockup
          buttonConfig={buttonConfig}
          blockShape={blockShape}
          buttonEffect={themeConfig?.buttonEffect}
          accentColor={accentColor}
          fontFamily={fontFamily}
        />

        <div className="text-center pt-6 opacity-40">
          <Typography variant="small" className="text-xs text-white">
            Powered by Wau.bio
          </Typography>
        </div>
      </div>
    </div>
  );
});
