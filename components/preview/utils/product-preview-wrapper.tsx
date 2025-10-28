"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Eye } from "lucide-react";

interface ProductPreviewWrapperProps {
  children: ReactNode; // The preview component to render
}

export function ProductPreviewWrapper({
  children,
}: ProductPreviewWrapperProps) {
  return (
    <>
      {/* Desktop: Sticky sidebar */}
      <div className="hidden lg:block">
        <div className="sticky top-8">
          <div className="rounded-lg bg-muted/30 p-4">
            <h3 className="text-sm font-semibold mb-4">Preview</h3>
            {children}
          </div>
        </div>
      </div>

      {/* Mobile: Floating preview button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="lg"
              className="rounded-full shadow-lg gap-2"
              type="button"
            >
              <Eye className="h-5 w-5" />
              Preview
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Preview</SheetTitle>
            </SheetHeader>
            <div className="flex justify-center pb-8">{children}</div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
