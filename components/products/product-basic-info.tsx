"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { FloatingInput } from "@/components/ui/floating-input";
import { FloatingTextarea } from "@/components/ui/floating-textarea";
import type { LeadMagnetInput } from "@/lib/products/schemas";

interface ProductBasicInfoProps {
  register: UseFormRegister<LeadMagnetInput>;
  errors: FieldErrors<LeadMagnetInput>;
}

export function ProductBasicInfo({ register, errors }: ProductBasicInfoProps) {
  return (
    <div className="space-y-4">
      {/* Title */}
      <FloatingInput
        label="Title *"
        error={errors.name?.message as string}
        {...register("name")}
      />

      {/* Subtitle */}
      <FloatingTextarea
        label="Subtitle (Optional)"
        rows={2}
        error={errors.subtitle?.message as string}
        {...register("subtitle")}
      />

      {/* Button Text */}
      <FloatingInput
        label="Button Text (Optional)"
        error={errors.buttonText?.message as string}
        {...register("buttonText")}
      />
    </div>
  );
}
