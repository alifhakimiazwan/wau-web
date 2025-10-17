"use client";

import { LinkButton } from "@/components/ui/link-button";
import type { ButtonStyle } from "@/types/design";
import { MOCK_LINKS } from "./constants";

interface ButtonPreviewMockupProps {
  buttonConfig: ButtonStyle;
  blockShape: string;
  buttonEffect?: string;
  accentColor?: string;
  fontFamily?: string;
}

export function ButtonPreviewMockup({
  buttonConfig,
  blockShape,
  buttonEffect,
  accentColor,
  fontFamily = "Inter",
}: ButtonPreviewMockupProps) {
  return (
    <div className="space-y-3">
      {MOCK_LINKS.map((link) => (
        <LinkButton
          key={link.label}
          icon={link.icon}
          label={link.label}
          config={{
            ...buttonConfig,
            shape: blockShape as 'square' | 'rounded' | 'pill',
            buttonEffect: buttonEffect,
          }}
          accentColor={accentColor}
        />
      ))}
    </div>
  );
}
