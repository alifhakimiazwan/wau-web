"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { AVAILABLE_THEMES } from "@/lib/design/types";

interface ThemeCarouselProps {
  selectedThemeId: string;
  onThemeSelect: (themeId: string) => void;
}

export function ThemeCarousel({
  selectedThemeId,
  onThemeSelect,
}: ThemeCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>();

  return (
    <div className="w-full max-w-5xl mx-auto px-2">
      <Carousel
        setApi={setApi}
        className="w-full p-0"
        opts={{ loop: true, align: "center" }}
      >
        <CarouselContent className="-ml-4">
          {AVAILABLE_THEMES.map((theme) => (
            <CarouselItem key={theme.id} className="basis-1/3 pl-4">
              <div
                onClick={() => onThemeSelect(theme.id)}
                className="cursor-pointer"
              >
                {theme.thumbnail.startsWith("/") ? (
                  <img
                    src={theme.thumbnail}
                    alt={theme.name}
                    className={cn(
                      "w-full aspect-[9/16] object-contain rounded-2xl transition-all duration-200",
                      selectedThemeId === theme.id
                        ? "ring-4 ring-blue-500 ring-inset"
                        : "ring-0 hover:ring-2 hover:ring-muted-foreground/20 ring-inset"
                    )}
                  />
                ) : (
                  <div
                    className={cn(
                      "w-full aspect-[9/16] rounded-2xl transition-all duration-200",
                      selectedThemeId === theme.id
                        ? "ring-4 ring-blue-500 ring-inset"
                        : "ring-0 hover:ring-2 hover:ring-muted-foreground/20 ring-inset"
                    )}
                    style={{
                      background: theme.thumbnail,
                    }}
                  />
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="left-0 bg-background/80 backdrop-blur-sm hover:bg-background" />
        <CarouselNext className="right-0 bg-background/80 backdrop-blur-sm hover:bg-background" />
      </Carousel>
    </div>
  );
}
