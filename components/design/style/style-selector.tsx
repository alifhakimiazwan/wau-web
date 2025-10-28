"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface StyleSelectorProps {
  label: string;
  options: Array<{
    value: string;
    label: string;
    preview?: React.ReactNode;
  }>;
  value: string;
  onChange: (value: string) => void;
}

export function StyleSelector({
  label,
  options,
  value,
  onChange,
}: StyleSelectorProps) {
  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <RadioGroup value={value} onValueChange={onChange}>
        <div className="grid grid-cols-3 gap-3">
          {options.map((option) => (
            <div key={option.value}>
              <RadioGroupItem
                value={option.value}
                id={option.value}
                className="peer sr-only"
              />
              <Label
                htmlFor={option.value}
                className={cn(
                  "flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-all"
                )}
              >
                {option.preview}
                <span className="text-xs font-medium mt-2">{option.label}</span>
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
}
