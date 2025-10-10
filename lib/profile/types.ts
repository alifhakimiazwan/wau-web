import {
    IconBrandFacebook,
    IconBrandInstagram,
    IconBrandTwitter,
    IconBrandLinkedin,
    IconBrandYoutube,
    IconBrandTiktok,
    IconBrandGithub,
    IconBrandDiscord,
    IconMail,
    IconWorld,
  } from "@tabler/icons-react";
import type { Database } from "@/types/database.types";

export interface StorefrontPreviewProps {
    name: string;
    bio?: string;
    location?: string;
    profilePicUrl?: string;
    bannerPicUrl?: string;
    socialLinks: Array<{
      platform: string;
      url: string;
    }>;
    theme?: string;
    fontFamily?: string;
    blockShape?: string;
  }


export type Store = Database["public"]["Tables"]["stores"]["Row"];
export type SocialLink = Database["public"]["Tables"]["social_links"]["Row"];

export interface ProfileFormProps {
  store: Store;
  socialLinks: SocialLink[];
}

  // Available platforms
export const PLATFORMS = [
    { value: "instagram", label: "Instagram", icon: IconBrandInstagram },
    { value: "twitter", label: "Twitter/X", icon: IconBrandTwitter },
    { value: "tiktok", label: "TikTok", icon: IconBrandTiktok },
    { value: "youtube", label: "YouTube", icon: IconBrandYoutube },
    { value: "facebook", label: "Facebook", icon: IconBrandFacebook },
    { value: "linkedin", label: "LinkedIn", icon: IconBrandLinkedin },
    { value: "github", label: "GitHub", icon: IconBrandGithub },
    { value: "discord", label: "Discord", icon: IconBrandDiscord },
    { value: "gmail", label: "Email", icon: IconMail },
    { value: "portfolio", label: "Website", icon: IconWorld },
  ];