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
import { Check } from "lucide-react";

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
    <div className="w-full max-w-5xl mx-auto">
      <Carousel
        setApi={setApi}
        className="w-full p-0"
        opts={{ loop: true, align: "center" }}
      >
        <CarouselContent className="ml-0 gap-3 px-3">
          {AVAILABLE_THEMES.map((theme) => (
            <CarouselItem key={theme.id} className="basis-full md:basis-1/3 pl-0 pr-0">
              <div
                onClick={() => onThemeSelect(theme.id)}
                className="cursor-pointer relative"
              >
                {theme.thumbnail.startsWith("/") ? (
                  <img
                    src={theme.thumbnail}
                    alt={theme.name}
                    className="w-full aspect-[9/16] object-contain transition-all duration-200"
                  />
                ) : (
                  <div
                    className="w-full aspect-[9/16] transition-all duration-200"
                    style={{
                      background: theme.thumbnail,
                    }}
                  />
                )}

                {/* Checkmark Badge */}
                {selectedThemeId === theme.id && (
                  <div className="absolute top-2 right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-5 h-5 text-white" strokeWidth={3} />
                  </div>
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
