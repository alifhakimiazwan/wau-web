"use client";

import { Card } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import type { DesignCustomization } from "@/lib/design/types";
import { cn } from "@/lib/utils";
import { getBorderRadius } from "@/lib/utils/design-helpers";

interface DigitalProductClassicPreviewProps {
  cardTitle?: string;
  cardThumbnail?: string | null;
  price?: number;
  discountedPrice?: number;
  hasDiscount?: boolean;
  designConfig?: DesignCustomization | null;
  cardBackgroundColor?: string;
  cardShadow?: boolean;
}

export function DigitalProductClassicPreview({
  cardTitle = "Your Product Title",
  cardThumbnail,
  price = 29.99,
  discountedPrice,
  hasDiscount = false,
  designConfig,
  cardBackgroundColor = '#FFFFFF',
  cardShadow = false,
}: DigitalProductClassicPreviewProps) {
  const borderRadius = getBorderRadius(designConfig);

  const displayPrice = hasDiscount && discountedPrice ? discountedPrice : price;
  const showOriginalPrice =
    hasDiscount && discountedPrice && discountedPrice < price;

  return (
    <div className="w-full max-w-md mx-auto">
      <Card
        className={cn(
          "overflow-hidden cursor-pointer transition-shadow py-0 border-1",
          borderRadius
        )}
        style={{
          backgroundColor: cardBackgroundColor,
          boxShadow: cardShadow
            ? "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 2px 5px -2px rgba(0, 0, 0, 0.2)"
            : undefined,
        }}
      >
        <div className="flex items-center gap-3 p-3">
          {/* Thumbnail */}
          {cardThumbnail ? (
            <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-md">
              <Image
                src={cardThumbnail}
                alt={cardTitle || "Product"}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 flex-shrink-0 bg-muted rounded-md flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-muted-foreground" />
            </div>
          )}

          {/* Title and Price */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate">
              {cardTitle || "Your Product Title"}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-lg font-bold">
                ${displayPrice.toFixed(2)}
              </span>
              {showOriginalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ${price.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
