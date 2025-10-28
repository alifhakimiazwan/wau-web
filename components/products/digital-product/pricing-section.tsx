"use client";

import {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
} from "react-hook-form";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { DigitalProductInput } from "@/lib/products/schemas";

interface PricingSectionProps {
  register: UseFormRegister<DigitalProductInput>;
  errors: FieldErrors<DigitalProductInput>;
  watch: UseFormWatch<DigitalProductInput>;
  setValue: UseFormSetValue<DigitalProductInput>;
}

export function PricingSection({
  register,
  errors,
  watch,
  setValue,
}: PricingSectionProps) {
  const hasDiscount = watch("hasDiscount");
  const price = watch("price");

  return (
    <div className="space-y-4">
      <Field>
        <FieldLabel htmlFor="price">Price (RM) *</FieldLabel>
        <FieldDescription>Price</FieldDescription>
        <Input
          id="price"
          type="number"
          step="0.01"
          min="0"
          {...register("price", { valueAsNumber: true })}
          placeholder="99.00"
        />
        {errors.price && <FieldError>{errors.price.message}</FieldError>}
      </Field>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="hasDiscount"
          checked={hasDiscount}
          onCheckedChange={(checked) =>
            setValue("hasDiscount", checked as boolean)
          }
        />
        <label
          htmlFor="hasDiscount"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Offer a discount?
        </label>
      </div>

      {hasDiscount && (
        <Field>
          <FieldLabel htmlFor="discountedPrice">Discounted Price</FieldLabel>
          <Input
            id="discountedPrice"
            type="number"
            step="0.01"
            min="0"
            {...register("discountedPrice", { valueAsNumber: true })}
            placeholder="79.00"
          />
          {errors.discountedPrice && (
            <FieldError>{errors.discountedPrice.message}</FieldError>
          )}
        </Field>
      )}
    </div>
  );
}
