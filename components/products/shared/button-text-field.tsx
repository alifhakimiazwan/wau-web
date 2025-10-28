"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { FloatingInput } from "@/components/ui/floating-input";
import type { LinkInput } from "@/lib/products/schemas";

interface ButtonTextFieldProps {
  register: UseFormRegister<LinkInput>;
  errors: FieldErrors<LinkInput>;
  placeholder?: string;
}

export function ButtonTextField({
  register,
  errors,
  placeholder = "Click Here",
}: ButtonTextFieldProps) {
  return (
    <FloatingInput
      label="Button Text (Optional)"
      error={errors.buttonText?.message as string}
      {...register("buttonText")}
    />
  );
}
