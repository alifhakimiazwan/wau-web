"use client";

import { useWatch } from "react-hook-form";
import type { Control } from "react-hook-form";
import { ProductPreviewWrapper } from "@/components/product-cards/utils/product-preview-wrapper";
import { LinkClassicPreview } from "@/components/product-cards/link/link-classic-preview";
import { LinkCalloutPreview } from "@/components/product-cards/link/link-callout-preview";
import { LinkEmbedPreview } from "@/components/product-cards/link/link-embed-preview";
import type { LinkInput } from "@/lib/products/schemas";
import type { DesignCustomization } from "@/lib/design/types";

interface LinkPreviewProps {
  control: Control<LinkInput>;
  thumbnailUrl: string | null;
  designConfig: DesignCustomization | null;
}

export function LinkPreview({
  control,
  thumbnailUrl,
  designConfig,
}: LinkPreviewProps) {
  // Watch all fields needed for preview in one call
  const formValues = useWatch({
    control,
    name: ["style", "name", "subtitle", "buttonText", "url"],
  });

  const [style, name, subtitle, buttonText, url] = formValues;

  return (
    <ProductPreviewWrapper>
      {style === "classic" && (
        <LinkClassicPreview
          name={name}
          thumbnail={thumbnailUrl}
          url={url}
          designConfig={designConfig}
        />
      )}
      {style === "callout" && (
        <LinkCalloutPreview
          name={name}
          subtitle={subtitle}
          buttonText={buttonText}
          thumbnail={thumbnailUrl}
          url={url}
          designConfig={designConfig}
        />
      )}
      {style === "embed" && (
        <LinkEmbedPreview url={url} designConfig={designConfig} />
      )}
    </ProductPreviewWrapper>
  );
}
