"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BLOCK_SHAPES } from "@/lib/design/buttonTypes";
import { cn } from "@/lib/utils";
import { Typography } from "../ui/typography";
import { ShapePreview } from "./shape-preview";

interface ShapeSelectorDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

export function ShapeSelectorDropdown({
  value,
  onChange,
}: ShapeSelectorDropdownProps) {
  const selectedShape = BLOCK_SHAPES.find((s) => s.value === value);

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="border-none">
          <SelectValue placeholder="Select a shape" className="border-none">
            {selectedShape && (
              <div className="flex items-center gap-2">
                <ShapePreview
                  shape={selectedShape.value as "square" | "rounded" | "pill"}
                  isSelected
                  size="sm"
                />
              </div>
            )}
            <Typography variant="p">Block Shape</Typography>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {BLOCK_SHAPES.map((shape) => (
            <SelectItem key={shape.value} value={shape.value}>
              <div className="flex items-center gap-2">
                <ShapePreview
                  shape={shape.value as "square" | "rounded" | "pill"}
                  isSelected={value === shape.value}
                  size="md"
                />
                <span
                  className={cn(
                    "font-medium",
                    value === shape.value ? "text-blue-500" : "text-gray-500"
                  )}
                >
                  {shape.label}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
