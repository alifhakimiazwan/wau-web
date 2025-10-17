/**
 * useDesignState Hook
 *
 * Manages design customization state with theme integration
 */

import { useState, useCallback } from "react";
import { AVAILABLE_THEMES } from "@/lib/design/types";
import { DEFAULT_BUTTON_CONFIG } from "@/lib/design/buttonTypes";
import type { DesignCustomization } from "@/lib/design/types";

interface UseDesignStateParams {
  initialDesign?: DesignCustomization;
  onChange?: (design: DesignCustomization) => void;
}

export function useDesignState({
  initialDesign,
  onChange,
}: UseDesignStateParams = {}) {
  const [design, setDesign] = useState<DesignCustomization>(
    initialDesign || {
      themeId: "minimal_white",
      fontFamily: "Inter",
      colors: {
        primary: "#FFFFFF",
        accent: "#000000",
      },
      blockShape: "rounded",
      buttonConfig: DEFAULT_BUTTON_CONFIG,
    }
  );

  const updateDesign = useCallback(
    (updates: Partial<DesignCustomization>) => {
      const newDesign = { ...design, ...updates };
      setDesign(newDesign);
      onChange?.(newDesign);
    },
    [design, onChange]
  );

  const selectTheme = useCallback(
    (themeId: string) => {
      const theme = AVAILABLE_THEMES.find((t) => t.id === themeId);
      if (theme) {
        updateDesign({
          themeId,
          fontFamily: theme.fontFamily || design.fontFamily,
          colors: {
            primary: theme.colors.background,
            accent: theme.colors.accent,
          },
        });
      }
    },
    [design.fontFamily, updateDesign]
  );

  const currentTheme = AVAILABLE_THEMES.find((t) => t.id === design.themeId);
  const accentColor =
    currentTheme?.colors.accent || design.colors.accent || "#000000";

  return {
    design,
    updateDesign,
    selectTheme,
    currentTheme,
    accentColor,
  };
}
