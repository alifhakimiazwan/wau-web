"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { FloatingInput } from "@/components/ui/floating-input";
import type { LinkInput } from "@/lib/products/schemas";

interface URLFieldProps {
  register: UseFormRegister<LinkInput>;
  errors: FieldErrors<LinkInput>;
  placeholder?: string;
  label?: string;
  description?: string;
}

export function URLField({
  register,
  errors,
  placeholder = "https://example.com",
  label = "URL *",
  description,
}: URLFieldProps) {
  return (
    <div className="space-y-1">
      {description && (
        <p className="text-sm text-muted-foreground mb-2">{description}</p>
      )}
      <FloatingInput
        label={label}
        type="url"
        error={errors.url?.message as string}
        {...register("url")}
      />
    </div>
  );
}
