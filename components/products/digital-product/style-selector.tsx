"use client";

import { FieldErrors } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldDescription } from "@/components/ui/field";
import { Typography } from "@/components/ui/typography";
import { Link2, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DigitalProductInput } from "@/lib/products/schemas";

interface StyleSelectorProps {
  errors: FieldErrors<DigitalProductInput>;
  selectedStyle: "classic" | "callout";
  onStyleChange: (style: "classic" | "callout") => void;
}

const cardStyles = [
  {
    id: "classic",
    name: "Classic",
    icon: Link2,
  },
  {
    id: "callout",
    name: "Callout",
    icon: Megaphone,
  },
] as const;

export function StyleSelector({
  errors,
  selectedStyle,
  onStyleChange,
}: StyleSelectorProps) {
  return (
    <Field>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {cardStyles.map((style) => {
          const Icon = style.icon;
          const isSelected = selectedStyle === style.id;

          return (
            <Card
              key={style.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md py-0",
                isSelected
                  ? "ring-2 ring-primary border-primary"
                  : "hover:border-primary/50"
              )}
              onClick={() => onStyleChange(style.id as "classic" | "callout")}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div
                    className={cn(
                      "p-3 rounded-full",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <div>
                    <Typography variant="h4" className="font-semibold">
                      {style.name}
                    </Typography>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {errors.style && (
        <FieldDescription className="text-destructive mt-2">
          {errors.style.message as string}
        </FieldDescription>
      )}
    </Field>
  );
}
