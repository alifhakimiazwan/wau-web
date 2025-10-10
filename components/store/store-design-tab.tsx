"use client";

import { useState, useTransition } from "react";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/types/database.types";

type Store = Database["public"]["Tables"]["stores"]["Row"];

interface StoreDesignTabProps {
  store: Store;
}

const themes = [
  { value: "minimal_white", label: "Minimal White", preview: "bg-white" },
  { value: "minimal_black", label: "Minimal Black", preview: "bg-black" },
  {
    value: "gradient_blue",
    label: "Gradient Blue",
    preview: "bg-gradient-to-br from-blue-400 to-blue-600",
  },
  {
    value: "gradient_purple",
    label: "Gradient Purple",
    preview: "bg-gradient-to-br from-purple-400 to-pink-600",
  },
];

const fonts = [
  { value: "Inter", label: "Inter" },
  { value: "Poppins", label: "Poppins" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Space Grotesk", label: "Space Grotesk" },
];

const blockShapes = [
  { value: "square", label: "Square" },
  { value: "round", label: "Rounded" },
  { value: "pill", label: "Pill" },
];

export function StoreDesignTab({ store }: StoreDesignTabProps) {
  const [isPending, startTransition] = useTransition();
  const [theme, setTheme] = useState("minimal_white");
  const [font, setFont] = useState("Inter");
  const [blockShape, setBlockShape] = useState("round");

  const handleSave = () => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/store/design", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme, font, blockShape }),
        });

        const result = await response.json();

        if (result.success) {
          toast.success("Design updated successfully!");
        } else {
          toast.error(result.error);
        }
      } catch (error) {
        toast.error("Failed to update design");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div className="rounded-lg border p-6">
        <div className="space-y-4">
          <div>
            <Typography variant="h3">Theme</Typography>
            <Typography variant="muted">
              Choose a theme for your store
            </Typography>
          </div>

          <RadioGroup value={theme} onValueChange={setTheme}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {themes.map((themeOption) => (
                <div key={themeOption.value}>
                  <RadioGroupItem
                    value={themeOption.value}
                    id={themeOption.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={themeOption.value}
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <div
                      className={`w-full h-24 rounded-md mb-2 ${themeOption.preview}`}
                    />
                    <Typography variant="small">{themeOption.label}</Typography>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Font Selection */}
      <div className="rounded-lg border p-6">
        <div className="space-y-4">
          <div>
            <Typography variant="h3">Font Family</Typography>
            <Typography variant="muted">
              Choose a font for your store
            </Typography>
          </div>

          <Select value={font} onValueChange={setFont}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a font" />
            </SelectTrigger>
            <SelectContent>
              {fonts.map((fontOption) => (
                <SelectItem
                  key={fontOption.value}
                  value={fontOption.value}
                  style={{ fontFamily: fontOption.value }}
                >
                  {fontOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Block Shape */}
      <div className="rounded-lg border p-6">
        <div className="space-y-4">
          <div>
            <Typography variant="h3">Block Shape</Typography>
            <Typography variant="muted">
              Choose how your product cards look
            </Typography>
          </div>

          <RadioGroup value={blockShape} onValueChange={setBlockShape}>
            <div className="grid gap-4 sm:grid-cols-3">
              {blockShapes.map((shape) => (
                <div key={shape.value}>
                  <RadioGroupItem
                    value={shape.value}
                    id={shape.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={shape.value}
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <div
                      className={`w-full h-16 bg-muted mb-2 ${
                        shape.value === "square"
                          ? "rounded-none"
                          : shape.value === "round"
                          ? "rounded-lg"
                          : "rounded-full"
                      }`}
                    />
                    <Typography variant="small">{shape.label}</Typography>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Preview Link */}
      <div className="rounded-lg border p-6">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="h3">Preview Your Store</Typography>
            <Typography variant="muted">
              See how your changes look live
            </Typography>
          </div>
          <Button variant="outline" asChild>
            <a
              href={`/${store.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Store
            </a>
          </Button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Design"
          )}
        </Button>
      </div>
    </div>
  );
}
