"use client";

import { IPhoneMockup } from "./device-mockup";
import { StorefrontPreview } from "./storefront-preview";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";

interface DevicePreviewProps {
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

export function DevicePreview(props: DevicePreviewProps) {
  return (
    <IPhoneMockup>
      <StorefrontPreview {...props} />
    </IPhoneMockup>
  );
}
