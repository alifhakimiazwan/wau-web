"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";

interface SuccessMessageProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  defaultMessage?: string;
}

export function SuccessMessage({
  register,
  errors,
  defaultMessage = "Thank you! Check your email for your free download.",
}: SuccessMessageProps) {
  return (
    <Field>
      <Textarea
        id="successMessage"
        placeholder={defaultMessage}
        rows={3}
        {...register("successMessage")}
      />

      {errors.successMessage && (
        <FieldDescription className="text-destructive">
          {errors.successMessage.message as string}
        </FieldDescription>
      )}
    </Field>
  );
}
