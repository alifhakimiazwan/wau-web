import type { DesignCustomization } from "@/lib/design/types";

/**
 * Get border radius classes based on block shape
 */
export function getBorderRadius(
  designConfig?: DesignCustomization | null,
  position: "all" | "top" | "bottom" = "all"
): string {
  const shape = designConfig?.blockShape || "rounded";

  const radiusMap = {
    square: {
      all: "rounded-none",
      top: "rounded-t-none",
      bottom: "rounded-b-none",
    },
    rounded: {
      all: "rounded-lg",
      top: "rounded-t-lg",
      bottom: "rounded-b-lg",
    },
    pill: {
      all: "rounded-3xl",
      top: "rounded-t-3xl",
      bottom: "rounded-b-3xl",
    },
  };

  return radiusMap[shape][position];
}

/**
 * Get input border radius (pills use full rounded)
 */
export function getInputBorderRadius(
  designConfig?: DesignCustomization | null
): string {
  if (designConfig?.blockShape === "pill") {
    return "rounded-full";
  }
  return getBorderRadius(designConfig);
}
