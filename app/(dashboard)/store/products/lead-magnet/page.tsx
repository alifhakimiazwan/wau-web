import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { CreateLeadMagnetForm } from "@/components/products/lead-magnet/create-lead-magnet-form";

import { requireStore } from "@/lib/guards/onboarding-guard";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { DesignCustomization } from "@/lib/design/types";

export default async function CreateLeadMagnetPage() {
  // Server-side data fetching
  const { store } = await requireStore();
  const supabase = await createServerSupabaseClient();

  // Fetch design customization
  const { data: customization } = await supabase
    .from("store_customization")
    .select("*")
    .eq("store_id", store.id)
    .maybeSingle();

  const designConfig: DesignCustomization | null = customization
    ? {
        themeId: customization.theme || "minimal_white",
        fontFamily: customization.font_family || "Inter",
        colors: {
          primary: customization.primary_color || "#000000",
          accent: customization.accent_color || "#3B82F6",
        },
        blockShape:
          (customization.block_shape as "square" | "rounded" | "pill") ||
          "rounded",
        buttonConfig: {
          style:
            (customization.button_style as "filled" | "outlined" | "ghost") ||
            "filled",
        },
      }
    : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-6 px-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/store/products">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <Typography variant="h2" font="serif">
            Create Lead Magnet
          </Typography>
          <Typography variant="muted" className="mt-2">
            Capture leads by offering free resources to your audience
          </Typography>
        </div>

        {/* Form Component */}
        <CreateLeadMagnetForm designConfig={designConfig} />
      </div>
    </div>
  );
}
