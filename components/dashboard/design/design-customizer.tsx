"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeCarousel } from "./dashboard/theme-carousel";
import { FontSelector } from "./font/font-selector";
import { ColorSelectorDropdown } from "./color/color-selector-dropdown";
import { ShapeSelectorDropdown } from "./shape/shape-selector-dropdown";
import { ButtonCustomizerDropdown } from "./button/button-customizer-dropdown";
import { PaletteIcon } from "lucide-react";
import { Typography } from "@/components/ui/typography";
import { useDesignState } from "@/lib/design/hooks/use-design-state";
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

  //TODO: why are we passing accentColor?

  return (
    <div className="space-y-2">
      <Card className="border-none py-2 gap-2">
        <CardTitle className="mb-1">
          <Typography variant="h2" font="serif">
            Themes
          </Typography>
        </CardTitle>
        <CardContent className="p-0 gap-0">
          <ThemeCarousel
            selectedThemeId={design.themeId}
            onThemeSelect={selectTheme}
          />
        </CardContent>
      </Card>
      <Card className="gap-0 py-2 px-0">
        <CardContent className="space-y-6 gap-2 py-0">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <FontSelector
              value={design.fontFamily}
              onChange={(fontFamily) => updateDesign({ fontFamily })}
            />
            <div className="flex gap-2 items-center">
              <PaletteIcon className="text-gray-500 h-4 w-4" />
              <ColorSelectorDropdown
                value={design.colors.primary}
                onChange={(primary) =>
                  updateDesign({ colors: { ...design.colors, primary } })
                }
                description=""
              />
              <ColorSelectorDropdown
                value={design.colors.accent}
                onChange={(accent) =>
                  updateDesign({ colors: { ...design.colors, accent } })
                }
                description=""
              />
            </div>
            <ShapeSelectorDropdown
              value={design.blockShape}
              onChange={(blockShape) =>
                updateDesign({
                  blockShape: blockShape as "square" | "rounded" | "pill",
                })
              }
            />
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
