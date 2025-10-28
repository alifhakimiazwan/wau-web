"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { FloatingTextarea } from "@/components/ui/floating-textarea";
import type { LinkInput } from "@/lib/products/schemas";

interface SubtitleFieldProps {
  register: UseFormRegister<LinkInput>;
  errors: FieldErrors<LinkInput>;
  placeholder?: string;
}

export function SubtitleField({
  register,
  errors,
  placeholder = "Optional subtitle",
}: SubtitleFieldProps) {
  return (
    <FloatingTextarea
      label="Subtitle (Optional)"
      rows={2}
      error={errors.subtitle?.message as string}
      {...register("subtitle")}
    />
  );
}
