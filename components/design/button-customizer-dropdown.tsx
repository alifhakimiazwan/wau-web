"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BUTTON_STYLES, type ButtonStyle } from "@/lib/design/types";
import { cn } from "@/lib/utils";

interface ButtonCustomizerDropdownProps {
  buttonConfig: ButtonStyle;
  onChange: (config: ButtonStyle) => void;
  accentColor: string;
  buttonEffect?: string;
}

export function ButtonCustomizerDropdown({
  buttonConfig,
  onChange,
}: ButtonCustomizerDropdownProps) {
  const updateConfig = (style: string) => {
    onChange({ ...buttonConfig, style: style as ButtonStyle["style"] });
  };

  const selectedStyle = BUTTON_STYLES.find(
    (s) => s.value === buttonConfig.style
  );

  return (
    <div className="space-y-2">
      <Select value={buttonConfig.style} onValueChange={updateConfig}>
        <SelectTrigger className="border-none">
          <SelectValue placeholder="Select button style">
            {selectedStyle && (
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-6 h-6 border-2 rounded-lg transition-all",
                    selectedStyle.value === "filled" &&
                      "bg-blue-500 border-blue-500",
                    selectedStyle.value === "outlined" && "border-blue-500",
                    selectedStyle.value === "ghost" &&
                      "border-dashed border-blue-500"
                  )}
                />
              </div>
            )}
            <span>Button Style</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {BUTTON_STYLES.map((style) => (
            <SelectItem key={style.value} value={style.value}>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "w-16 h-6 border-2 rounded-lg transition-all",
                    style.value === "filled" &&
                      (buttonConfig.style === style.value
                        ? "bg-blue-500 border-blue-500"
                        : "bg-gray-300 border-gray-300"),
                    style.value === "outlined" &&
                      (buttonConfig.style === style.value
                        ? "border-blue-500"
                        : "border-gray-300"),
                    style.value === "ghost" &&
                      (buttonConfig.style === style.value
                        ? "border-dashed border-blue-500"
                        : "border-dashed border-gray-300")
                  )}
                />
                <span
                  className={cn(
                    "font-medium",
                    buttonConfig.style === style.value
                      ? "text-blue-500"
                      : "text-gray-500"
                  )}
                >
                  {style.label}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
