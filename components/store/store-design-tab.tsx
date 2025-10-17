"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { DesignCustomizer } from "@/components/design/design-customizer";
import { DevicePreview } from "../preview/device-preview";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { DesignCustomization } from "@/lib/design/types";
import type { Database } from "@/types/database.types";
import { PreviewSheet } from "../preview/preview-sheet";
import { DEFAULT_BUTTON_CONFIG } from "@/lib/design/buttonTypes";
import { useRouter } from "next/navigation";

type Store = Database["public"]["Tables"]["stores"]["Row"];
type SocialLink = Database["public"]["Tables"]["social_links"]["Row"];

interface StoreDesignClientProps {
  store: Store;
  socialLinks: SocialLink[];
  initialDesign?: DesignCustomization;
}

export function StoreDesignTab({
  store,
  socialLinks,
  initialDesign,
}: StoreDesignClientProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [design, setDesign] = useState<DesignCustomization>(
    initialDesign || {
      themeId: "minimal_white",
      fontFamily: "Inter",
      colors: {
        primary: "#FFFFFF",
        accent: "#000000",
      },
      blockShape: "rounded",
      buttonConfig: DEFAULT_BUTTON_CONFIG,
    }
  );

  const handleSave = () => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/store/design/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storeId: store.id,
            design,
          }),
        });

        const result = await response.json();

        if (result.success) {
          toast.success("Design saved successfully!");
          // Refresh the page to show updated data
          window.location.reload();
        } else {
          toast.error(result.error || "Failed to save design");
        }
      } catch (error) {
        console.error("Save error:", error);
        toast.error("Failed to save design");
      }
    });
  };

  return (
    <div className="flex gap-6 w-full overflow-x-hidden">
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <PreviewSheet
          name={store.name || "Your Store"}
          bio={store.bio || ""}
          location={store.location || ""}
          profilePicUrl={store.profile_pic_url || ""}
          bannerPicUrl={store.banner_pic_url || ""}
          socialLinks={socialLinks.map((link) => ({
            platform: link.platform,
            url: link.url,
          }))}
          theme={design.themeId}
          fontFamily={design.fontFamily}
          blockShape={design.blockShape}
          colors={design.colors}
          buttonConfig={design.buttonConfig}
        />
      </div>
      {/* Left: Design Customizer */}
      <div className="space-y-6 w-full lg:w-auto lg:flex-1 lg:max-w-2xl">
        <DesignCustomizer initialDesign={design} onChange={setDesign} />

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isPending} size="lg">
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

      {/* Right: Live Preview */}
      <div className="hidden lg:block lg:flex-shrink-0">
        <DevicePreview
          name={store.name || "Your Store"}
          bio={store.bio || ""}
          location={store.location || ""}
          profilePicUrl={store.profile_pic_url || ""}
          bannerPicUrl={store.banner_pic_url || ""}
          socialLinks={socialLinks.map((link) => ({
            platform: link.platform,
            url: link.url,
          }))}
          theme={design.themeId}
          fontFamily={design.fontFamily}
          blockShape={design.blockShape}
          colors={design.colors}
          buttonConfig={design.buttonConfig}
        />
      </div>
    </div>
  );
}
