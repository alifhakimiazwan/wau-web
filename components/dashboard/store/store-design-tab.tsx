"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { DesignCustomizer } from "@/components/dashboard/design/design-customizer";
import { DevicePreview } from "@/components/product-cards/device-preview/device-preview";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { DesignCustomization } from "@/lib/design/types";
import { MobilePreviewSheet } from "@/components/product-cards/utils/preview-sheet";
import { DEFAULT_DESIGN } from "@/lib/design/types";
import { Store, Product } from "@/lib/profile/types";
import { SocialLink } from "@/lib/profile/types";
import { useRouter } from "next/navigation";
import axios from "axios";

interface StoreDesignClientProps {
  store: Store;
  socialLinks: SocialLink[];
  products: Product[];
  initialDesign?: DesignCustomization;
}

export function StoreDesignTab({
  store,
  socialLinks,
  products,
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
        console.log("Saving design:", { storeId: store.id, design });

        const { data } = await axios.put("/api/store/design", {
          storeId: store.id,
          design,
        });

        if (data.success) {
          toast.success("Design saved successfully!");
          router.refresh();
        } else {
          console.error("Save failed:", data.error);
          toast.error(data.error || "Failed to save design");
        }
      } catch (error: unknown) {
        console.error("Save error:", error);
        const err = error as {
          response?: { data?: { error?: string } };
          message?: string;
        };
        console.error("Error response:", err.response?.data);

        const errorMessage =
          err.response?.data?.error || err.message || "Failed to save design";
        toast.error(errorMessage);
      }
    });
  };

  return (
    <>
      {/* Mobile Preview Button - Fixed to bottom right */}
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
          products={products}
          theme={design.themeId}
          fontFamily={design.fontFamily}
          blockShape={design.blockShape}
          colors={design.colors}
          buttonConfig={design.buttonConfig}
        />
      </div>

      <div className="flex gap-10 w-full overflow-x-hidden">
        {/* Left: Design Customizer */}
        <div className="space-y-6 w-full lg:w-auto lg:flex-1 lg:max-w-2xl pb-20 lg:pb-0">
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

        <div className="hidden lg:block lg:w-[400px]">
          <div className="fixed top-24 w-[400px]">
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
              products={products}
              theme={design.themeId}
              fontFamily={design.fontFamily}
              blockShape={design.blockShape}
              colors={design.colors}
              buttonConfig={design.buttonConfig}
            />
          </div>
        </div>
      </div>
    </>
  );
}
