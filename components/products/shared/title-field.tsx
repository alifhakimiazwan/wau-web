"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { FloatingInput } from "@/components/ui/floating-input";
import type { LinkInput } from "@/lib/products/schemas";

interface TitleFieldProps {
  register: UseFormRegister<LinkInput>;
  errors: FieldErrors<LinkInput>;
  placeholder?: string;
  required?: boolean;
}

export function TitleField({
  register,
  errors,
  placeholder = "Enter title",
  required = true,
}: TitleFieldProps) {
  return (
    <FloatingInput
      label={`Title${required ? " *" : ""}`}
      error={errors.name?.message as string}
      {...register("name")}
    />
  );
}
