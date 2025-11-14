"use client";

import { useWatch } from "react-hook-form";
import type { Control } from "react-hook-form";
import { ProductPreviewWrapper } from "@/components/product-cards/utils/product-preview-wrapper";
import { LeadMagnetPreview } from "@/components/product-cards/lead-magnet/lead-magnet-preview";
import type { LeadMagnetInput } from "@/lib/products/schemas";
import type { DesignCustomization } from "@/lib/design/types";

interface LeadMagnetPreviewWrapperProps {
  control: Control<LeadMagnetInput>;
  thumbnailUrl: string | null;
  designConfig: DesignCustomization | null;
}

export function LeadMagnetPreviewWrapper({
  control,
  thumbnailUrl,
  designConfig,
}: LeadMagnetPreviewWrapperProps) {
  // Watch all fields needed for preview in one call
  const formValues = useWatch({
    control,
    name: ["name", "subtitle", "buttonText", "customerFields", "successMessage"],
  });

  const [name, subtitle, buttonText, customerFields, successMessage] = formValues;

  return (
    <ProductPreviewWrapper>
      <LeadMagnetPreview
        name={name}
        subtitle={subtitle}
        buttonText={buttonText}
        thumbnail={thumbnailUrl}
        customerFields={customerFields}
        successMessage={successMessage}
        designConfig={designConfig}
      />
    </ProductPreviewWrapper>
  );
}
