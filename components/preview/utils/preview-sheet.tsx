"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Eye } from "lucide-react";
import { IPhoneMockup } from "../device-preview/device-mockup";
import { StorefrontPreview } from "@/components/storefront/storefront";
import type { StorefrontPreviewProps } from "@/lib/profile/types";

//Mobile Preview Sheet
export function MobilePreviewSheet(props: StorefrontPreviewProps) {
  return (
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
