"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription } from "@/components/ui/field";
import { Card } from "@/components/ui/card";

// Simple props without generic types - just take the values we need
interface CustomerFieldsSelectorProps {
  watch: (field: string) => boolean;
  setValue: (field: string, value: boolean) => void;
  errors?: { message?: string };
}

export function CustomerFieldsSelector({
  watch,
  setValue,
  errors,
}: CustomerFieldsSelectorProps) {
  const emailChecked = watch("customerFields.email");
  const nameChecked = watch("customerFields.name");
  const phoneChecked = watch("customerFields.phone");

  return (
    <Field>
      <Card className="p-4 space-y-1 mt-2 border-none">
        {/* Email */}
        <div className="flex items-center space-x-3">
          <Checkbox
            id="customerFields.email"
            checked={emailChecked}
            onCheckedChange={(checked) =>
              setValue("customerFields.email", checked === true)
            }
          />
          <label
            htmlFor="customerFields.email"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Email Address
          </label>
        </div>

        {/* Name */}
        <div className="flex items-center space-x-3">
          <Checkbox
            id="customerFields.name"
            checked={nameChecked}
            onCheckedChange={(checked) =>
              setValue("customerFields.name", checked === true)
            }
          />
          <label
            htmlFor="customerFields.name"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Full Name
          </label>
        </div>

        {/* Phone Number */}
        <div className="flex items-center space-x-3">
          <Checkbox
            id="customerFields.phone"
            checked={phoneChecked}
            onCheckedChange={(checked) =>
              setValue("customerFields.phone", checked === true)
            }
          />
          <label
            htmlFor="customerFields.phone"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Phone Number
          </label>
        </div>
      </Card>

      {errors && (
        <FieldDescription className="text-destructive">
          {errors.message}
        </FieldDescription>
      )}
    </Field>
  );
}
