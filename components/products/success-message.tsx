"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { FloatingTextarea } from "@/components/ui/floating-textarea";
import type { LeadMagnetInput } from "@/lib/products/schemas";

interface SuccessMessageProps {
  register: UseFormRegister<LeadMagnetInput>;
  errors: FieldErrors<LeadMagnetInput>;
  defaultMessage?: string;
}

export function SuccessMessage({
  register,
  errors,
  defaultMessage = "Thank you! Check your email for your free download.",
}: SuccessMessageProps) {
  return (
    <FloatingTextarea
      label="Success Message (Optional)"
      rows={3}
      error={errors.successMessage?.message as string}
      {...register("successMessage")}
    />
  );
}
