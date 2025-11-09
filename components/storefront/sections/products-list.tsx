"use client";

import type { Database } from "@/types/database.types";
import type { DesignCustomization } from "@/lib/design/types";
import { AVAILABLE_THEMES } from "@/lib/design/types";
import { LinkClassicPreview } from "@/components/preview/link/link-classic-preview";
import { LinkCalloutPreview } from "@/components/preview/link/link-callout-preview";
import { LinkEmbedPreview } from "@/components/preview/link/link-embed-preview";
import { DigitalProductClassicPreview } from "@/components/preview/digital-product/digital-product-classic-preview";
import { DigitalProductCalloutPreview } from "@/components/preview/digital-product/digital-product-callout-preview";
import { LeadMagnetPreview } from "@/components/preview/lead-magnet/lead-magnet-preview";
import { isSection } from "@/lib/products/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface ProductsListProps {
  products: Product[];
  designConfig?: DesignCustomization | null;
  storeId: string; // For analytics tracking
}

export function ProductsList({ products, designConfig, storeId }: ProductsListProps) {
  // Filter published products and sections, sort by position
  const visibleItems = products
    .filter((item) => {
      // Show sections (always visible)
      if (isSection(item)) return true;
      // Show only published products
      return item.status === "published";
    })
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  // Get current theme config for card styling
  const currentTheme = AVAILABLE_THEMES.find(t => t.id === designConfig?.themeId);
  const cardBackgroundColor = currentTheme?.cardBackgroundColor || '#FFFFFF';
  const cardShadow = currentTheme?.cardShadow || false;

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 w-full">
      {visibleItems.map((item) => {
        // Check if this is a section
        if (isSection(item)) {
          return (
            <div key={item.id} className="pt-4 pb-2">
              <h3
                className="text-lg font-semibold px-1 text-center"
                style={{ color: designConfig?.colors?.accent || '#1e2ed4' }}
              >
                {item.name}
              </h3>
            </div>
          );
        }

        // Render product
        const product = item;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const config = product.type_config as any;

        // Render based on product type
        switch (product.type) {
          case "link":
            const linkStyle = config?.style || "classic";

            if (linkStyle === "classic") {
              return (
                <LinkClassicPreview
                  key={product.id}
                  name={config?.name}
                  thumbnail={product.thumbnail_url}
                  url={config?.url}
                  designConfig={designConfig}
                  cardBackgroundColor={cardBackgroundColor}
                  cardShadow={cardShadow}
                  productId={product.id}
                  storeId={storeId}
                />
              );
            }

            if (linkStyle === "callout") {
              return (
                <LinkCalloutPreview
                  key={product.id}
                  name={config?.name}
                  subtitle={config?.subtitle}
                  buttonText={config?.buttonText}
                  thumbnail={product.thumbnail_url}
                  url={config?.url}
                  designConfig={designConfig}
                  cardBackgroundColor={cardBackgroundColor}
                  cardShadow={cardShadow}
                  productId={product.id}
                  storeId={storeId}
                />
              );
            }

            if (linkStyle === "embed") {
              return (
                <LinkEmbedPreview
                  key={product.id}
                  url={config?.url}
                  designConfig={designConfig}
                  cardBackgroundColor={cardBackgroundColor}
                  cardShadow={cardShadow}
                  productId={product.id}
                  storeId={storeId}
                />
              );
            }
            return null;

          case "digital_product":
            const dpStyle = config?.style || "classic";

            if (dpStyle === "classic") {
              return (
                <DigitalProductClassicPreview
                  key={product.id}
                  cardTitle={config?.cardTitle}
                  cardThumbnail={product.thumbnail_url}
                  price={config?.price}
                  discountedPrice={config?.discountedPrice}
                  hasDiscount={config?.hasDiscount}
                  designConfig={designConfig}
                  cardBackgroundColor={cardBackgroundColor}
                  cardShadow={cardShadow}
                />
              );
            }

            if (dpStyle === "callout") {
              return (
                <DigitalProductCalloutPreview
                  key={product.id}
                  cardTitle={config?.cardTitle}
                  cardSubtitle={config?.cardSubtitle}
                  cardButtonText={config?.cardButtonText}
                  cardThumbnail={product.thumbnail_url}
                  price={config?.price}
                  discountedPrice={config?.discountedPrice}
                  hasDiscount={config?.hasDiscount}
                  designConfig={designConfig}
                  cardBackgroundColor={cardBackgroundColor}
                  cardShadow={cardShadow}
                />
              );
            }
            return null;

          case "lead_magnet":
            return (
              <LeadMagnetPreview
                key={product.id}
                name={product.name}
                subtitle={config?.subtitle}
                buttonText={config?.buttonText}
                thumbnail={product.thumbnail_url}
                customerFields={config?.customerFields}
                successMessage={config?.successMessage}
                designConfig={designConfig}
                cardBackgroundColor={cardBackgroundColor}
                cardShadow={cardShadow}
                productId={product.id}
                storeId={storeId}
                isPreview={false}
              />
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
