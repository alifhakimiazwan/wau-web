"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeCarousel } from "./theme-carousel";
import { FontSelector } from "./font-selector";
import { ColorSelectorDropdown } from "./color-selector-dropdown";
import { ShapeSelectorDropdown } from "./shape-selector-dropdown";
import { ButtonCustomizerDropdown } from "./button-customizer-dropdown";
import { PaletteIcon } from "lucide-react";
import { Typography } from "../ui/typography";
import { useDesignState } from "./hooks";
import type { DesignCustomization } from "@/lib/design/types";

interface DesignCustomizerProps {
  initialDesign?: DesignCustomization;
  onChange: (design: DesignCustomization) => void;
}

export function DesignCustomizer({
  initialDesign,
  onChange,
}: DesignCustomizerProps) {
  const { design, updateDesign, selectTheme, accentColor } = useDesignState({
    initialDesign,
    onChange,
  });

  return (
    <div className="space-y-2">
      {/* Theme Selection */}
      <Card className="border-none py-2 gap-2">
        <CardHeader>
          <CardTitle>
            <Typography variant="h2" className=" font-bold">
              Themes
            </Typography>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 gap-0">
          <ThemeCarousel
            selectedThemeId={design.themeId}
            onThemeSelect={selectTheme}
          />
        </CardContent>
      </Card>

      {/* Customization Options */}
      <Card className="gap-0 py-2 px-0">
        <CardContent className="space-y-6 gap-2 py-0">
          {/* All selectors - responsive layout: 2x2 on mobile/tablet, 1 row on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Font Family */}
            <FontSelector
              value={design.fontFamily}
              onChange={(fontFamily) => updateDesign({ fontFamily })}
            />

            {/* Color Pickers - Grouped Closer */}
            <div className="flex gap-2 items-center">
              <PaletteIcon className="text-gray-500 h-4 w-4" />
              {/* Primary Color */}
              <ColorSelectorDropdown
                label="Primary Color"
                value={design.colors.primary}
                onChange={(primary) =>
                  updateDesign({ colors: { ...design.colors, primary } })
                }
                description=""
              />

              {/* Accent Color */}
              <ColorSelectorDropdown
                label="Accent Color"
                value={design.colors.accent}
                onChange={(accent) =>
                  updateDesign({ colors: { ...design.colors, accent } })
                }
                description=""
              />
            </div>

            {/* Block Shape */}
            <ShapeSelectorDropdown
              value={design.blockShape}
              onChange={(blockShape) =>
                updateDesign({
                  blockShape: blockShape as "square" | "rounded" | "pill",
                })
              }
            />

            {/* Button Style */}
            <ButtonCustomizerDropdown
              buttonConfig={design.buttonConfig}
              onChange={(buttonConfig) => updateDesign({ buttonConfig })}
              accentColor={accentColor}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
