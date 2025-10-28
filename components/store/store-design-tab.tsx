"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { DesignCustomizer } from "@/components/design/design-customizer";
import { DevicePreview } from "../preview/device-preview/device-preview";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { DesignCustomization } from "@/lib/design/types";
import { MobilePreviewSheet } from "../preview/utils/preview-sheet";
import { DEFAULT_DESIGN } from "@/lib/design/types";
import { Store } from "@/lib/profile/types";
import { SocialLink } from "@/lib/profile/types";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";

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
  const [design, setDesign] = useState<DesignCustomization>(
    initialDesign || DEFAULT_DESIGN
  );
  const router = useRouter();

  const handleSave = () => {
    startTransition(async () => {
      try {
        const { data } = await api.post("/api/store/design/update", {
          storeId: store.id,
          design,
        });

        const result = await data.json();

        if (result.success) {
          toast.success("Design saved successfully!");
          router.refresh();
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
        <MobilePreviewSheet
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
