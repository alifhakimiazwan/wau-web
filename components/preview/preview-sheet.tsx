"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Eye } from "lucide-react";
import { IPhoneMockup } from "./device-mockup";
import { StorefrontPreview } from "./storefront-preview";
import type { StorefrontPreviewProps } from "./types";

export function PreviewSheet(props: StorefrontPreviewProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="rounded-full shadow-lg gap-2"
          type="button" // ⭐ Prevent form submission
        >
          <Eye className="h-5 w-5" />
          Preview
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
        {/* Center the mockup */}
        <div className="flex justify-center pb-8">
          <div className="scale-90 origin-top">
            <IPhoneMockup>
              <StorefrontPreview {...props} />
            </IPhoneMockup>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
