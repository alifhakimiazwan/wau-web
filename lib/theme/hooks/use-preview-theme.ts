/**
 * usePreviewTheme Hook
 *
 * Handles theme configuration and color calculations for preview components
 */

import { useMemo } from "react";
import { AVAILABLE_THEMES } from "@/lib/design/types";
import { isLightColor, getBlockShape } from "@/lib/theme/actions";

interface UsePreviewThemeParams {
  theme?: string;
  blockShape?: string;
  colors?: {
    primary?: string;
    accent?: string;
  };
}

export function usePreviewTheme({
  theme = "minimal_white",
  blockShape = "rounded",
  colors,
}: UsePreviewThemeParams) {
  const themeConfig = useMemo(
    () => AVAILABLE_THEMES.find((t) => t.id === theme),
    [theme]
  );

  const primaryColor = useMemo(
    () => colors?.primary || themeConfig?.colors.background || "#FFFFFF",
    [colors?.primary, themeConfig]
  );

  const accentColor = useMemo(
    () => colors?.accent || themeConfig?.colors.accent || "#000000",
    [colors?.accent, themeConfig]
  );

  const textColor = useMemo(
    () => (isLightColor(primaryColor) ? "#111827" : "#FFFFFF"),
    [primaryColor]
  );

  const validBlockShape = useMemo(() => {
    if (blockShape === "square" || blockShape === "rounded" || blockShape === "pill") {
      return blockShape;
    }
    return "rounded" as const;
  }, [blockShape]);

  const borderRadiusClass = useMemo(
    () => getBlockShape(validBlockShape),
    [validBlockShape]
  );

  return {
    themeConfig,
    primaryColor,
    accentColor,
    textColor,
    validBlockShape,
    borderRadiusClass,
  };
}
