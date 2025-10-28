import { Button } from "@/components/ui/button";
import { ProfileCard } from "./profile-card";
import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { Store } from "@/lib/profile/types";
import { SocialLink } from "@/lib/profile/types";
import { SortableProductsList } from "@/components/products/sortable-products-list";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import type { Database } from "@/types/database.types";
import { Product } from "@/lib/products/types";

interface StoreDetailsTabProps {
  store: Store;
  socialLinks?: SocialLink[];
  products?: Product[];
}

export function StoreDetailsTab({
  store,
  socialLinks = [],
  products = [],
}: StoreDetailsTabProps) {
  // const storeUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://wau.bio"}/${
  //   store.slug
  // }`;

  return (
    <div className="space-y-6">
      <ProfileCard store={store} socialLinks={socialLinks} />
      <Button
        className="transition-none w-full flex flex-row items-center gap-2"
        asChild
      >
        <Link href="/store/products">
          <IconPlus className="h-5 w-5" />
          Add Product
        </Link>
      </Button>

      {/* My Products Section */}
      {products.length > 0 && (
        <>
          <div className="space-y-4">
            <SortableProductsList initialProducts={products} />
          </div>
        </>
      )}
    </div>
  );
}
