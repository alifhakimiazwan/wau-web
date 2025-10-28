/**
 * ShapePreview Component
 *
 * Reusable component for rendering shape previews
 */

import { cn } from "@/lib/utils";
import { SHAPE_BORDER_CLASSES } from "@/lib/design/constants";

interface ShapePreviewProps {
  shape: "square" | "rounded" | "pill";
  isSelected?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "w-6 h-6",
  md: "w-16 h-6",
  lg: "w-24 h-8",
} as const;

export function ShapePreview({
  shape,
  isSelected = false,
  size = "md",
  className,
}: ShapePreviewProps) {
  return (
    <div
      className={cn(
        "border-2",
        SIZE_CLASSES[size],
        SHAPE_BORDER_CLASSES[shape],
        isSelected ? "border-blue-500" : "border-gray-300",
        className
      )}
    />
  );
}
