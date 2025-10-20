import { Button } from "@/components/ui/button";
import { ProfileCard } from "./profile-card";
import { IconPlus } from "@tabler/icons-react";
import type { Database } from "@/types/database.types";
import Link from "next/link";
import * as motion from "motion/react-client";

type Store = Database["public"]["Tables"]["stores"]["Row"];
type SocialLink = Database["public"]["Tables"]["social_links"]["Row"];

interface StoreDetailsTabProps {
  store: Store;
  socialLinks?: SocialLink[];
}

export function StoreDetailsTab({
  store,
  socialLinks = [],
}: StoreDetailsTabProps) {
  const storeUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://wau.bio"}/${
    store.slug
  }`;

  return (
    <div className="space-y-6">
      <ProfileCard store={store} socialLinks={socialLinks} />
      <Button className="transition-none w-full flex flex-row items-center gap-2" asChild>
        <Link href="/store/products">
          <IconPlus className="h-5 w-5" />
          Add Product
        </Link>
      </Button>
    </div>
  );
}
