"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { ThumbnailUpload } from "@/components/products/thumbnail-upload";
import { FloatingInput } from "@/components/ui/floating-input";
import { ShoppingBag } from "lucide-react";
import type { DigitalProductInput } from "@/lib/products/schemas";

interface CardSectionProps {
  register: UseFormRegister<DigitalProductInput>;
  errors: FieldErrors<DigitalProductInput>;
  selectedStyle: "classic" | "callout";
  thumbnailUrl: string | null;
  onThumbnailChange: (url: string | null) => void;
}

export function CardSection({
  register,
  errors,
  selectedStyle,
  thumbnailUrl,
  onThumbnailChange,
}: CardSectionProps) {
  const showSubtitle = selectedStyle === "callout";
  const showButtonText = selectedStyle === "callout";

  return (
    <div className="space-y-4">
      <FloatingInput
        label="Title*"
        error={errors.cardTitle?.message}
        {...register("cardTitle")}
      />

      {showSubtitle && (
        <FloatingInput
          label="Card Subtitle *"
          error={errors.cardSubtitle?.message}
          {...register("cardSubtitle")}
        />
      )}

      {showButtonText && (
        <FloatingInput
          label="Card Button Text *"
          error={errors.cardButtonText?.message}
          {...register("cardButtonText")}
        />
      )}

      <div>
        <label className="text-sm font-medium">Card Thumbnail (Optional)</label>
        <ThumbnailUpload
          value={thumbnailUrl || undefined}
          onChange={onThumbnailChange}
          fallbackIcon={ShoppingBag}
        />
      </div>
    </div>
  );
}
