"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import type { UseFormWatch, UseFormSetValue, FieldErrors, Path } from "react-hook-form";

// Generic type for any form that has customerFields
type FormWithCustomerFields = {
  customerFields: {
    email: boolean;
    name: boolean;
    phone: boolean;
  };
};

interface CustomerFieldsSelectorProps<T extends FormWithCustomerFields> {
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
  errors?: FieldErrors<T["customerFields"]>;
}

export function CustomerFieldsSelector<T extends FormWithCustomerFields>({
  watch,
  setValue,
  errors,
}: CustomerFieldsSelectorProps<T>) {
  const emailChecked = watch("customerFields.email" as Path<T>) as boolean;
  const nameChecked = watch("customerFields.name" as Path<T>) as boolean;
  const phoneChecked = watch("customerFields.phone" as Path<T>) as boolean;

  return (
    <Field>
      <Card className="p-4 space-y-1 mt-2 border-none">
        {/* Email */}
        <div className="flex items-center space-x-3">
          <Checkbox
            id="customerFields.email"
            checked={emailChecked}
            onCheckedChange={(checked) =>
              setValue("customerFields.email" as Path<T>, (checked === true) as never)
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
              setValue("customerFields.name" as Path<T>, (checked === true) as never)
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
              setValue("customerFields.phone" as Path<T>, (checked === true) as never)
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
    </Field>
  );
}
