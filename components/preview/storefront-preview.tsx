"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Typography } from "@/components/ui/typography";
import {
  getSocialIcon,
  getThemeClasses,
  getBlockShape,
} from "@/lib/preview/actions";
import { IconMapPin } from "@tabler/icons-react";
import { getInitials } from "@/lib/profile/actions";
import { cn } from "@/lib/utils";
import { StorefrontPreviewProps } from "@/lib/profile/types";
import { memo } from "react";

export const StorefrontPreview = memo(function StorefrontPreview({
  name,
  bio,
  location,
  profilePicUrl,
  bannerPicUrl,
  socialLinks,
  theme = "minimal_white",
  fontFamily = "Inter",
  blockShape = "round",
}: StorefrontPreviewProps) {
  // Filter out empty URLs
  const validLinks = socialLinks.filter((link) => link.url.trim());

  return (
    <div
      className={cn(
        "min-h-full transition-all duration-300",
        getThemeClasses(theme)
      )}
      style={{ fontFamily }}
    >
      {/* Banner */}
      {bannerPicUrl && (
        <div className="w-full h-32 relative">
          <img
            src={bannerPicUrl}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Profile Section */}
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Avatar */}
          <Avatar
            className={cn(
              "h-24 w-24 border-4",
              theme?.includes("white") ? "border-white" : "border-gray-900"
            )}
          >
            <AvatarImage src={profilePicUrl || undefined} alt={name} />
            <AvatarFallback className="text-xl font-semibold">
              {getInitials({ name })}
            </AvatarFallback>
          </Avatar>

          {/* Name */}
          {name && (
            <Typography variant="h3" className="font-bold">
              {name}
            </Typography>
          )}

          {/* Bio */}
          {bio && (
            <Typography variant="small" className="opacity-90 max-w-xs">
              {bio}
            </Typography>
          )}

          {/* Location */}
          {location && (
            <div className="flex items-center gap-1.5 text-sm opacity-80">
              <IconMapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
          )}
        </div>

        {/* Social Links */}
        {validLinks.length > 0 && (
          <div className="space-y-3">
            {validLinks.map((link, index) => {
              const Icon = getSocialIcon(link.platform);
              return (
                <div
                  key={index}
                  className={cn(
                    "w-full p-4 flex items-center justify-center gap-3 transition-all",
                    getBlockShape(blockShape),
                    theme?.includes("white")
                      ? "bg-gray-100 text-gray-900"
                      : "bg-white/10 backdrop-blur-sm"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium capitalize">
                    {link.platform}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {validLinks.length === 0 && (
          <div className="text-center py-12 opacity-50">
            <Typography variant="small">No links added yet</Typography>
          </div>
        )}

        {/* Powered by */}
        <div className="text-center pt-6 opacity-40">
          <Typography variant="small" className="text-xs">
            Powered by Wau.bio
          </Typography>
        </div>
      </div>
    </div>
  );
});
