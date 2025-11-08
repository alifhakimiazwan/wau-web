import { requireStore } from "@/lib/guards/onboarding-guard";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getDesignCustomization } from "@/lib/design/actions";
import { getStoreProducts } from "@/lib/products/actions";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { StoreDetailsTab } from "@/components/dashboard/store/store-details-tab";
import { StoreDesignTab } from "@/components/dashboard/store/store-design-tab";
import { Store, Palette } from "lucide-react";

interface StorePageProps {
  searchParams: {
    tab?: string;
  };
}

export default async function StorePage({ searchParams }: StorePageProps) {
  const params = await searchParams;
  const { user, store } = await requireStore();
  const supabase = await createServerSupabaseClient();

  const [{ data: socialLinks }, initialDesign, productsResult] = await Promise.all([
    supabase
      .from("social_links")
      .select("*")
      .eq("store_id", store.id)
      .order("position", { ascending: true }),
    getDesignCustomization(store.id),
    getStoreProducts(),
  ]);

  const products = productsResult.success ? productsResult.data || [] : [];
  const activeTab = params.tab || "details";

  return (
    <div className="space-y-6 p-5 min-h-screen">
      <Tabs defaultValue={activeTab} className="space-y-4">
        <TabsList className="gap-2">
          <TabsTrigger value="details">
            <Store className="w-4 h-4" />
            My Store
          </TabsTrigger>
          <TabsTrigger value="design">
            <Palette className="w-4 h-4" />
            Edit Design
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <StoreDetailsTab
            store={store}
            socialLinks={socialLinks || []}
            products={products}
            designConfig={initialDesign ?? undefined}
          />
        </TabsContent>

        <TabsContent value="design" className="space-y-4">
          <StoreDesignTab
            store={store}
            socialLinks={socialLinks || []}
            products={products}
            initialDesign={initialDesign ?? undefined}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
