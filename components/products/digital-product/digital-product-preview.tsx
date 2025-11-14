"use client";

import { useWatch } from "react-hook-form";
import type { Control } from "react-hook-form";
import { ProductPreviewWrapper } from "@/components/product-cards/utils/product-preview-wrapper";
import { DigitalProductClassicPreview } from "@/components/product-cards/digital-product/digital-product-classic-preview";
import { DigitalProductCalloutPreview } from "@/components/product-cards/digital-product/digital-product-callout-preview";
import { DigitalProductCheckoutPreview } from "@/components/product-cards/digital-product/digital-product-checkout-preview";
import type { DigitalProductInput } from "@/lib/products/schemas";
import type { DesignCustomization } from "@/lib/design/types";

interface DigitalProductPreviewProps {
  control: Control<DigitalProductInput>;
  cardThumbnail: string | null;
  checkoutImage: string | null;
  activeTab: "landing" | "checkout" | "advanced";
  designConfig: DesignCustomization | null;
}

export function DigitalProductPreview({
  control,
  cardThumbnail,
  checkoutImage,
  activeTab,
  designConfig,
}: DigitalProductPreviewProps) {
  // Watch all fields needed for preview in one call
  const formValues = useWatch({
    control,
    name: [
      "style",
      "cardTitle",
      "cardSubtitle",
      "cardButtonText",
      "description",
      "bottomTitle",
      "checkoutButtonText",
      "price",
      "discountedPrice",
      "hasDiscount",
      "customerFields",
    ],
  });

  const [
    style,
    cardTitle,
    cardSubtitle,
    cardButtonText,
    description,
    bottomTitle,
    checkoutButtonText,
    price,
    discountedPrice,
    hasDiscount,
    customerFields,
  ] = formValues;

  return (
    <ProductPreviewWrapper>
      {/* Landing Page Preview */}
      {activeTab === "landing" && (
        <>
          {style === "classic" && (
            <DigitalProductClassicPreview
              cardTitle={cardTitle}
              cardThumbnail={cardThumbnail}
              price={price}
              discountedPrice={discountedPrice}
              hasDiscount={hasDiscount}
              designConfig={designConfig}
            />
          )}
          {style === "callout" && (
            <DigitalProductCalloutPreview
              cardTitle={cardTitle}
              cardSubtitle={cardSubtitle}
              cardButtonText={cardButtonText}
              cardThumbnail={cardThumbnail}
              price={price}
              discountedPrice={discountedPrice}
              hasDiscount={hasDiscount}
              designConfig={designConfig}
            />
          )}
        </>
      )}

      {/* Checkout Page Preview */}
      {activeTab === "checkout" && (
        <DigitalProductCheckoutPreview
          checkoutImage={checkoutImage}
          description={description}
          bottomTitle={bottomTitle}
          checkoutButtonText={checkoutButtonText}
          price={price}
          discountedPrice={discountedPrice}
          hasDiscount={hasDiscount}
          customerFields={customerFields}
          designConfig={designConfig}
        />
      )}

      {/* Advanced Tab - Show checkout preview as well */}
      {activeTab === "advanced" && (
        <DigitalProductCheckoutPreview
          checkoutImage={checkoutImage}
          description={description}
          bottomTitle={bottomTitle}
          checkoutButtonText={checkoutButtonText}
          price={price}
          discountedPrice={discountedPrice}
          hasDiscount={hasDiscount}
          customerFields={customerFields}
          designConfig={designConfig}
        />
      )}
    </ProductPreviewWrapper>
  );
}
