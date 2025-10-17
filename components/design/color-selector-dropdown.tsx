"use client";

import { forwardRef, useMemo, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { cn } from "@/lib/utils";
import { useForwardedRef } from "@/lib/use-forwarded-ref";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface ColorSelectorDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

const ColorPickerButton = forwardRef<
  HTMLButtonElement,
  { value: string; onChange: (value: string) => void }
>(({ value, onChange }, forwardedRef) => {
  const ref = useForwardedRef(forwardedRef);
  const [open, setOpen] = useState(false);

  const parsedValue = useMemo(() => {
    return value || "#FFFFFF";
  }, [value]);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          className="w-7 h-8"
          onClick={() => {
            setOpen(true);
          }}
          style={{
            backgroundColor: parsedValue,
          }}
          variant="outline"
        >
          <div />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full">
        <HexColorPicker color={parsedValue} onChange={onChange} />
        <Input
          maxLength={7}
          onChange={(e) => {
            onChange(e?.currentTarget?.value);
          }}
          value={parsedValue}
          className="mt-2"
        />
      </PopoverContent>
    </Popover>
  );
});
ColorPickerButton.displayName = "ColorPickerButton";

export function ColorSelectorDropdown({
  label,
  value,
  onChange,
  description,
}: ColorSelectorDropdownProps) {
  return (
    <div className="space-y-2">
      <ColorPickerButton value={value} onChange={onChange} />
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
