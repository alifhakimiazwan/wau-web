import { ButtonStyle } from "@/lib/design/types";

/**
 * Shared props for all storefront preview components
 */
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
  colors?: {
    primary: string;
    accent: string;
  };
  buttonConfig?: ButtonStyle;
}
