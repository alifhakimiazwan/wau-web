import { PLATFORMS } from "./types";
export const getPlaceholder = (platform: string) => {
    const placeholders: Record<string, string> = {
      instagram: "https://instagram.com/yourhandle",
      twitter: "https://twitter.com/yourhandle",
      tiktok: "https://tiktok.com/@yourhandle",
      youtube: "https://youtube.com/@yourhandle",
      facebook: "https://facebook.com/yourpage",
      linkedin: "https://linkedin.com/in/yourprofile",
      github: "https://github.com/yourusername",
      discord: "https://discord.gg/yourinvite",
      gmail: "your@email.com",
      portfolio: "https://yourwebsite.com",
      other: "https://...",
    };
  
    return placeholders[platform] || "https://...";
  };

export const getInitials = (name: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "U";
  };

export const getPlatformInfo = (platformValue: string) => {
    return PLATFORMS.find((p) => p.value === platformValue) || PLATFORMS[0];
  };

  