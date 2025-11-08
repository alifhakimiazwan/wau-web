"use client";

import { Button } from "@/components/ui/button";
import { ProfileCard } from "./profile-card";
import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { Store } from "@/lib/profile/types";
import { SocialLink } from "@/lib/profile/types";
import dynamic from "next/dynamic";
import { Product } from "@/lib/products/types";
import { MobilePreviewSheet } from "@/components/preview/utils/preview-sheet";
import { DevicePreview } from "@/components/preview/device-preview/device-preview";
import type { DesignCustomization } from "@/lib/design/types";
import { AddSectionDialog } from "./add-section-dialog";

// Dynamically import SortableProductsList with SSR disabled to prevent hydration mismatch
// dnd-kit generates different IDs on server vs client
const SortableProductsList = dynamic(
  () =>
    import("@/components/products/sortable-products-list").then(
      (mod) => mod.SortableProductsList
    ),
  { ssr: false }
);

interface StoreDetailsTabProps {
  store: Store;
  socialLinks?: SocialLink[];
  products?: Product[];
  designConfig?: DesignCustomization;
}

export function StoreDetailsTab({
  store,
  socialLinks = [],
  products = [],
  designConfig,
}: StoreDetailsTabProps) {
  // const storeUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://wau.bio"}/${
  //   store.slug
  // }`;

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
          theme={designConfig?.themeId || "original"}
          fontFamily={designConfig?.fontFamily || "DM Sans"}
          blockShape={designConfig?.blockShape || "rounded"}
          colors={
            designConfig?.colors || { primary: "#FFFFFF", accent: "#1e2ed4" }
          }
          buttonConfig={designConfig?.buttonConfig || { style: "filled" }}
        />
      </div>

      <div className="flex gap-10 w-full overflow-x-hidden">
        {/* Left: Store Details */}
        <div className="space-y-6 w-full lg:w-auto lg:flex-1 lg:max-w-2xl pb-20 lg:pb-0">
          <ProfileCard store={store} socialLinks={socialLinks} />

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              className="transition-none w-full flex flex-row items-center gap-2"
              asChild
            >
              <Link href="/store/products">
                <IconPlus className="h-5 w-5" />
                Add Product
              </Link>
            </Button>

            <AddSectionDialog />
          </div>

          {/* My Products Section */}
          {products.length > 0 && (
            <>
              <div className="space-y-4">
                <SortableProductsList
                  key={products.map((p) => p.id).join(",")}
                  initialProducts={products}
                />
              </div>
            </>
          )}
        </div>

        {/* Right: Desktop Preview */}
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
              theme={designConfig?.themeId || "original"}
              fontFamily={designConfig?.fontFamily || "DM Sans"}
              blockShape={designConfig?.blockShape || "rounded"}
              colors={
                designConfig?.colors || {
                  primary: "#FFFFFF",
                  accent: "#1e2ed4",
                }
              }
              buttonConfig={designConfig?.buttonConfig || { style: "filled" }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
