"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Eye } from "lucide-react";
import { IPhoneMockup } from "./device-mockup";
import { StorefrontPreview } from "./storefront-preview";

interface PreviewSheetProps {
  name: string;
  bio?: string;
  location?: string;
  profilePicUrl?: string;
  bannerPicUrl?: string;
  socialLinks: Array<{
    platform: string;
    url: string;
  }>;
  theme?: string;
  fontFamily?: string;
  blockShape?: string;
}

export function PreviewSheet(props: PreviewSheetProps) {
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
        <SheetHeader className="pb-4">
          <SheetTitle>Live Preview</SheetTitle>
        </SheetHeader>

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
