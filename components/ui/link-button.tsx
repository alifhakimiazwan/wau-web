"use client";

import { cn } from "@/lib/utils";
import type { ButtonStyle } from "@/lib/design/types";
import { BorderBeam } from "@/components/ui/border-beam";
import { useState } from "react";
import { isLightColor } from "@/lib/preview/actions";

interface LinkButtonProps {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  config: ButtonStyle & { buttonEffect?: string };
  accentColor?: string;
  className?: string;
  onClick?: () => void;
}

export function LinkButton({
  icon: Icon,
  label,
  config,
  accentColor,
  className,
  onClick,
}: LinkButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const buttonColor = config.color || accentColor || "#8B5CF6";
  const buttonEffect = config.buttonEffect || "scale"; // ⭐ Use theme hover effect

  // Get shape classes
  const shapeClass = {
    square: "rounded-none",
    rounded: "rounded-lg",
    pill: "rounded-full",
  }[config.shape];

  const buttonEffectClass = {
    none: "",
    scale: "hover:scale-105",
    lift: "hover:-translate-y-1 hover:shadow-lg",
    glow: "hover:shadow-xl",
    beam: "relative overflow-hidden",
  }[buttonEffect];

  // Auto-calculate button text color for filled style
  const buttonTextColor = config.style === "filled"
    ? (isLightColor(buttonColor) ? "#111827" : "#FFFFFF")
    : buttonColor;

  // Get style-specific classes and styles
  const getStyleClasses = () => {
    switch (config.style) {
      case "filled":
        return {
          className: "",
          style: {
            backgroundColor: buttonColor,
            color: buttonTextColor,
          },
        };
      case "outlined":
        return {
          className: "border-2 bg-transparent",
          style: {
            borderColor: buttonColor,
            color: buttonColor,
          },
        };
      case "ghost":
        return {
          className: "border border-dashed bg-transparent",
          style: {
            borderColor: buttonColor,
            color: buttonColor,
          },
        };
      default:
        return { className: "", style: {} };
    }
  };

  const styleConfig = getStyleClasses();

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full p-4 flex items-center justify-center gap-3 transition-all cursor-pointer font-medium",
        shapeClass,
        buttonEffectClass,
        styleConfig.className,
        className
      )}
      style={{
        ...styleConfig.style,
        ...(config.buttonEffect === "glow" && {
          transition: "all 0.3s ease, box-shadow 0.3s ease",
        }),
      }}
      onMouseEnter={(e) => {
        setIsHovered(true);
        if (config.buttonEffect === "glow") {
          e.currentTarget.style.boxShadow = `0 0 20px ${buttonColor}40`;
        }
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        if (config.buttonEffect === "glow") {
          e.currentTarget.style.boxShadow = "none";
        }
      }}
    >
      {Icon && <Icon className="h-5 w-5" />}
      <span className="capitalize">{label}</span>

      {config.buttonEffect === "beam" && (
        <BorderBeam
          duration={4}
          size={100}
          reverse
          className="from-transparent via-gray-400 to-transparent"
        />
      )}
    </button>
  );
}
