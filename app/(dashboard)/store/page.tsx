import { requireStore } from "@/lib/guards/onboarding-guard";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StoreDetailsTab } from "@/components/store/store-details-tab";
import { StoreDesignTab } from "@/components/store/store-design-tab";

interface StorePageProps {
  searchParams: Promise<{
    tab?: string;
  }>;
}

export default async function StorePage({ searchParams }: StorePageProps) {
  const params = await searchParams;
  const { user, store } = await requireStore();
  const supabase = await createServerSupabaseClient();

  // Fetch data in parallel for better performance
  const [{ data: socialLinks }, { data: customization }] = await Promise.all([
    supabase
      .from("social_links")
      .select("*")
      .eq("store_id", store.id)
      .order("position", { ascending: true }),
    supabase
      .from("store_customization")
      .select("*")
      .eq("store_id", store.id)
      .maybeSingle(),
  ]);

  const activeTab = params.tab || "details";

  // Prepare initial design
  const initialDesign = customization
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
          style: (customization.button_style as "filled" | "outlined" | "ghost") || "filled",
        },
      }
    : undefined;

  return (
    <div className="space-y-6 p-5">
      <Tabs defaultValue={activeTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">My Store</TabsTrigger>
          <TabsTrigger value="design">Edit Design</TabsTrigger>
        </TabsList>

        {/* My Store Tab */}
        <TabsContent value="details" className="space-y-4">
          <StoreDetailsTab store={store} socialLinks={socialLinks || []} />
        </TabsContent>

        {/* Edit Design Tab */}
        <TabsContent value="design" className="space-y-4">
          {/* ✅ Pass data only, no functions */}
          <StoreDesignTab
            store={store}
            socialLinks={socialLinks || []}
            initialDesign={initialDesign}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
