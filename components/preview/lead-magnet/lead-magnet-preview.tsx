"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LinkButton } from "@/components/design/button/link-button";
import { Magnet } from "lucide-react";
import Image from "next/image";
import type { DesignCustomization } from "@/lib/design/types";
import { cn } from "@/lib/utils";
import {
  getBorderRadius,
  getInputBorderRadius,
} from "@/lib/utils/design-helpers";

interface CustomerFields {
  email?: boolean;
  name?: boolean;
  phone?: boolean;
}

interface LeadMagnetPreviewProps {
  name?: string;
  subtitle?: string;
  buttonText?: string;
  thumbnail?: string | null;
  customerFields?: CustomerFields;
  designConfig?: DesignCustomization | null;
}

export function LeadMagnetPreview({
  name = "Your Lead Magnet Title",
  subtitle,
  buttonText = "Get Free Access",
  thumbnail,
  customerFields = { email: false, name: false, phone: false },
  designConfig,
}: LeadMagnetPreviewProps) {
  const borderRadius = getBorderRadius(designConfig);
  const inputBorderRadius = getInputBorderRadius(designConfig);
  const topBorderRadius = getBorderRadius(designConfig, "top");

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <Card className={cn("overflow-hidden py-0 gap-0", borderRadius)}>
        {/* Thumbnail - 1/2 on top - Full width, no padding */}
        {thumbnail ? (
          <div
            className={cn(
              "relative w-full aspect-[2/1] overflow-hidden",
              topBorderRadius
            )}
          >
            <Image
              src={thumbnail}
              alt={name || "Lead magnet"}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div
            className={cn(
              "w-full aspect-[2/1] bg-muted flex items-center justify-center",
              topBorderRadius
            )}
          >
            <Magnet className="w-16 h-16 text-muted-foreground" />
          </div>
        )}

        {/* Content section with padding */}
        <div className="p-6 space-y-4">
          {/* Title and Subtitle */}
          <div className="text-left space-y-2">
            <h3 className="text-xl font-bold tracking-tight">
              {name || "Your Lead Magnet Title"}
            </h3>
            {subtitle && (
              <p className="text-muted-foreground text-sm">{subtitle}</p>
            )}
          </div>

          {/* Customer Fields */}
          <div className="space-y-3">
            {customerFields.name && (
              <div className="space-y-1.5">
                <Input
                  id="preview-name"
                  placeholder="Name"
                  disabled
                  className={cn(inputBorderRadius, "text-sm")}
                />
              </div>
            )}
            {customerFields.email && (
              <div className="space-y-1.5">
                <Input
                  id="preview-email"
                  type="email"
                  placeholder="Email"
                  disabled
                  className={cn(inputBorderRadius, "text-sm")}
                />
              </div>
            )}
            {customerFields.phone && (
              <div className="space-y-1.5">
                <Input
                  id="preview-phone"
                  type="tel"
                  placeholder="Phone Number"
                  disabled
                  className={cn(inputBorderRadius, "text-sm")}
                />
              </div>
            )}
          </div>

          {/* CTA Button */}
          <LinkButton
            label={buttonText || "Get Free Access"}
            config={{
              style: designConfig?.buttonConfig.style || "filled",
              shape: designConfig?.blockShape || "rounded",
            }}
            accentColor={designConfig?.colors.accent}
          />
        </div>
      </Card>
    </div>
  );
}
