"use client";

import { IPhoneMockup } from "./device-mockup";
import { StorefrontPreview } from "./storefront-preview";
import type { StorefrontPreviewProps } from "./types";

export function DevicePreview(props: StorefrontPreviewProps) {
  return (
    <IPhoneMockup>
      <StorefrontPreview {...props} />
    </IPhoneMockup>
  );
}
