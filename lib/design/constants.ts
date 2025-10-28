/**
 * Design Component Constants
 */

import {
  IconBrandInstagram,
  IconBrandTwitter,
  IconBrandYoutube,
  IconBrandTiktok,
} from "@tabler/icons-react";

export const MOCK_LINKS = [
  { icon: IconBrandInstagram, label: "Instagram", url: "instagram.com/user" },
  { icon: IconBrandTwitter, label: "Twitter", url: "twitter.com/user" },
  { icon: IconBrandYoutube, label: "YouTube", url: "youtube.com/@user" },
  { icon: IconBrandTiktok, label: "TikTok", url: "tiktok.com/@user" },
] as const;

export const SHAPE_BORDER_CLASSES = {
  square: "rounded-none",
  rounded: "rounded-md",
  pill: "rounded-full",
} as const;
