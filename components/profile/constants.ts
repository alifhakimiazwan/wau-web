/**
 * Profile Component Constants
 */

export const PLATFORM_CATEGORIES = {
  popular: [
    { value: "instagram", label: "Instagram" },
    { value: "twitter", label: "Twitter/X" },
    { value: "tiktok", label: "TikTok" },
    { value: "youtube", label: "YouTube" },
    { value: "facebook", label: "Facebook" },
  ],
  other: [
    { value: "linkedin", label: "LinkedIn" },
    { value: "github", label: "GitHub" },
    { value: "discord", label: "Discord" },
    { value: "gmail", label: "Email" },
    { value: "portfolio", label: "Website" },
    { value: "other", label: "Other" },
  ],
} as const;

export const IMAGE_UPLOAD = {
  maxSize: 10 * 1024 * 1024, // 10MB
  acceptedFormats: ["image/jpeg", "image/jpg", "image/png", "image/webp"] as string[],
  dimensions: {
    avatar: { width: 400, height: 400 },
    banner: { width: 1200, height: 400 },
  },
  quality: 0.8,
} as const;

export const SAVED_INDICATOR_DELAY = 2000; // 2 seconds
