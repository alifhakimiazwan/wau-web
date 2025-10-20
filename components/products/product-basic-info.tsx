"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Typography } from "../ui/typography";

interface ProductBasicInfoProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
}

export function ProductBasicInfo({ register, errors }: ProductBasicInfoProps) {
  return (
    <div className="space-y-4">
      {/* Title */}
      <Field>
        <FieldLabel htmlFor="name">
          Title<span className="text-destructive">*</span>
        </FieldLabel>
        <Input
          id="name"
          placeholder="Free Social Media Template Pack"
          {...register("name")}
        />
        {errors.name && (
          <FieldDescription className="text-destructive">
            {errors.name.message as string}
          </FieldDescription>
        )}
      </Field>

      {/* Subtitle */}
      <Field>
        <FieldLabel htmlFor="subtitle">
          Subtitle{" "}
          <Typography variant="p" className="text-muted-foreground text-xs">
            (Optional)
          </Typography>
        </FieldLabel>
        <Textarea id="subtitle" rows={2} {...register("subtitle")} />
        {errors.subtitle && (
          <FieldDescription className="text-destructive">
            {errors.subtitle.message as string}
          </FieldDescription>
        )}
      </Field>

      {/* Button Text */}
      <Field>
        <FieldLabel htmlFor="buttonText">
          Button Text
          <Typography variant="p" className="text-muted-foreground text-xs">
            (Optional)
          </Typography>
        </FieldLabel>
        <Input
          id="buttonText"
          placeholder="Get Free Access"
          {...register("buttonText")}
        />

        {errors.buttonText && (
          <FieldDescription className="text-destructive">
            {errors.buttonText.message as string}
          </FieldDescription>
        )}
      </Field>
    </div>
  );
}
