"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LinkButton } from "@/components/design/button/link-button";
import { IPhoneMockup } from "@/components/preview/device-preview/device-mockup";
import { ShoppingBag } from "lucide-react";
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

interface DigitalProductCheckoutPreviewProps {
  checkoutImage?: string | null;
  description?: string;
  bottomTitle?: string;
  checkoutButtonText?: string;
  price?: number;
  discountedPrice?: number;
  hasDiscount?: boolean;
  customerFields?: CustomerFields;
  designConfig?: DesignCustomization | null;
}

export function DigitalProductCheckoutPreview({
  checkoutImage,
  description = "<p>Your product description will appear here...</p>",
  bottomTitle = "What you'll get",
  checkoutButtonText = "Buy Now",
  price = 29.99,
  discountedPrice,
  hasDiscount = false,
  customerFields = { email: true, name: false, phone: false },
  designConfig,
}: DigitalProductCheckoutPreviewProps) {
  const borderRadius = getBorderRadius(designConfig);
  const inputBorderRadius = getInputBorderRadius(designConfig);
  const topBorderRadius = getBorderRadius(designConfig, "top");

  const displayPrice = hasDiscount && discountedPrice ? discountedPrice : price;
  const showOriginalPrice =
    hasDiscount && discountedPrice && discountedPrice < price;

  return (
    <IPhoneMockup>
      <div className="w-full h-full overflow-y-auto bg-background">
        <Card
          className={cn(
            "overflow-hidden border-0 rounded-none shadow-none py-0"
          )}
        >
          {/* Checkout Image */}
          {checkoutImage ? (
            <div className="relative w-full aspect-[2/1] overflow-hidden">
              <Image
                src={checkoutImage}
                alt="Product"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-full aspect-[2/1] bg-muted flex items-center justify-center">
              <ShoppingBag className="w-16 h-16 text-muted-foreground" />
            </div>
          )}

          {/* Content Section */}
          <div className="p-6 space-y-4">
            {/* Description */}
            <div
              className="text-sm text-muted-foreground prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: description }}
            />

            {/* Bottom Title */}
            <div className="pt-2">
              <h3 className="text-lg font-bold tracking-tight">
                {bottomTitle || "What you'll get"}
              </h3>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                ${displayPrice.toFixed(2)}
              </span>
              {showOriginalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  ${price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Customer Fields */}
            <div className="space-y-3">
              {customerFields.name && (
                <Input
                  placeholder="Name"
                  disabled
                  className={cn(inputBorderRadius, "text-sm")}
                />
              )}
              {customerFields.email && (
                <Input
                  type="email"
                  placeholder="Email"
                  disabled
                  className={cn(inputBorderRadius, "text-sm")}
                />
              )}
              {customerFields.phone && (
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  disabled
                  className={cn(inputBorderRadius, "text-sm")}
                />
              )}
            </div>

            {/* CTA Button */}
            <LinkButton
              label={checkoutButtonText || "Buy Now"}
              config={{
                style: designConfig?.buttonConfig.style || "filled",
                shape: designConfig?.blockShape || "rounded",
              }}
              accentColor={designConfig?.colors.accent}
            />
          </div>
        </Card>
      </div>
    </IPhoneMockup>
  );
}
