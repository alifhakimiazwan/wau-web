"use client";

import { IPhoneMockup } from "./device-mockup";
import { StorefrontPreview } from "@/components/storefront/storefront";
import type { StorefrontPreviewProps } from "@/lib/profile/types";

export function DevicePreview(props: StorefrontPreviewProps) {
  return (
    <IPhoneMockup>
      <StorefrontPreview {...props} />
    </IPhoneMockup>
  );
}
