import { requireStore } from "@/lib/guards/onboarding-guard";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProfileForm } from "@/components/profile/profile-form";

export default async function ProfilePage() {
  const { user, store } = await requireStore();
  const supabase = await createServerSupabaseClient();

  // Fetch social links
  const { data: socialLinks } = await supabase
    .from("social_links")
    .select("*")
    .eq("store_id", store.id)
    .order("position", { ascending: true });

  return (
    <div className="space-y-6 w-full p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/store">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Profile Form */}
      <ProfileForm store={store} socialLinks={socialLinks || []} />
    </div>
  );
}
