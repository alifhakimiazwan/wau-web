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
import { ButtonStyle } from "../design/types";

export type Product = Database["public"]["Tables"]["products"]["Row"];

export interface StorefrontPreviewProps {
    storeId?: string; // For analytics tracking on storefront
    name: string;
    bio?: string;
    location?: string;
    profilePicUrl?: string;
    bannerPicUrl?: string;
    socialLinks: Array<{
      platform: string;
      url: string;
    }>;
    products?: Product[];
    theme?: string;
    fontFamily?: string;
    blockShape?: string;
    colors?: {
      primary: string
      accent: string
    }
    buttonConfig?: ButtonStyle
  }


export type Store = Database["public"]["Tables"]["stores"]["Row"];
export type SocialLink = Database["public"]["Tables"]["social_links"]["Row"];
export type StoreCustomization = Database["public"]["Tables"]["store_customization"]["Row"];

export interface ProfileFormProps {
  store: Store;
  socialLinks: SocialLink[];
  customization?: StoreCustomization | null;
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