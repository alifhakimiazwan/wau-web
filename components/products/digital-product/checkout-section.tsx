"use client";

import {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
} from "react-hook-form";
import { ThumbnailUpload } from "@/components/products/thumbnail-upload";
import { FloatingInput } from "@/components/ui/floating-input";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { MinimalTiptap } from "@/components/ui/shadcn-io/minimal-tiptap";
import { Image as ImageIcon } from "lucide-react";
import type { DigitalProductInput } from "@/lib/products/schemas";

interface CheckoutSectionProps {
  register: UseFormRegister<DigitalProductInput>;
  errors: FieldErrors<DigitalProductInput>;
  watch: UseFormWatch<DigitalProductInput>;
  setValue: UseFormSetValue<DigitalProductInput>;
  checkoutImageUrl: string | null;
  onCheckoutImageChange: (url: string | null) => void;
}

export function CheckoutSection({
  register,
  errors,
  watch,
  setValue,
  checkoutImageUrl,
  onCheckoutImageChange,
}: CheckoutSectionProps) {
  const description = watch("description") || "";

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium">Product Image (Optional)</label>
        <ThumbnailUpload
          value={checkoutImageUrl || undefined}
          onChange={onCheckoutImageChange}
          fallbackIcon={ImageIcon}
        />
      </div>

      <Field>
        <FieldLabel>Product Description *</FieldLabel>
        <MinimalTiptap
          content={description}
          onChange={(value) => setValue("description", value)}
          placeholder="Start typing your product description here..."
          className="min-h-[200px]"
        />
        {errors.description && (
          <FieldError>{errors.description.message}</FieldError>
        )}
      </Field>

      <FloatingInput
        label="Bottom Title *"
        placeholder="What you'll get"
        error={errors.bottomTitle?.message}
        {...register("bottomTitle")}
      />

      <FloatingInput
        label="Call to Action Button *"
        placeholder="Buy Now"
        error={errors.checkoutButtonText?.message}
        {...register("checkoutButtonText")}
      />
    </div>
  );
}
