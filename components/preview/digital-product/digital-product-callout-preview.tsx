"use client";

import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/design/button/link-button";
import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import type { DesignCustomization } from "@/lib/design/types";
import { cn } from "@/lib/utils";
import { getBorderRadius } from "@/lib/utils/design-helpers";

interface DigitalProductCalloutPreviewProps {
  cardTitle?: string;
  cardSubtitle?: string;
  cardButtonText?: string;
  cardThumbnail?: string | null;
  price?: number;
  discountedPrice?: number;
  hasDiscount?: boolean;
  designConfig?: DesignCustomization | null;
}

export function DigitalProductCalloutPreview({
  cardTitle = "Your Product Title",
  cardSubtitle = "A brief description of your amazing digital product",
  cardButtonText = "Buy Now",
  cardThumbnail,
  price = 29.99,
  discountedPrice,
  hasDiscount = false,
  designConfig,
}: DigitalProductCalloutPreviewProps) {
  const borderRadius = getBorderRadius(designConfig);
  const topBorderRadius = getBorderRadius(designConfig, "top");

  const displayPrice = hasDiscount && discountedPrice ? discountedPrice : price;
  const showOriginalPrice =
    hasDiscount && discountedPrice && discountedPrice < price;

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <Card className={cn("overflow-hidden py-0 gap-0", borderRadius)}>
        {/* Thumbnail */}
        {cardThumbnail ? (
          <div
            className={cn(
              "relative w-full aspect-[2/1] overflow-hidden",
              topBorderRadius
            )}
          >
            <Image
              src={cardThumbnail}
              alt={cardTitle || "Product"}
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
            <ShoppingBag className="w-16 h-16 text-muted-foreground" />
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title and Subtitle */}
          <div className="text-left space-y-2">
            <h3 className="text-xl font-bold tracking-tight">
              {cardTitle || "Your Product Title"}
            </h3>
            {cardSubtitle && (
              <p className="text-muted-foreground text-sm">{cardSubtitle}</p>
            )}
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

          {/* CTA Button */}
          <LinkButton
            label={cardButtonText || "Buy Now"}
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
