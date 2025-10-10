import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { ProfileCard } from "./profile-card";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import type { Database } from "@/types/database.types";

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
    </div>
  );
}
