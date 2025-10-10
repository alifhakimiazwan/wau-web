import { requireStore } from "@/lib/guards/onboarding-guard";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StoreDetailsTab } from "@/components/store/store-details-tab";
import { StoreDesignTab } from "@/components/store/store-design-tab";
import { DevicePreview } from "@/components/preview/device-preview";

interface StorePageProps {
  searchParams: {
    tab?: string;
  };
}

export default async function StorePage({ searchParams }: StorePageProps) {
  const { user, store } = await requireStore();
  const supabase = await createServerSupabaseClient();

  // Fetch social links
  const { data: socialLinks } = await supabase
    .from("social_links")
    .select("*")
    .eq("store_id", store.id)
    .order("position", { ascending: true });

  // Get tab from URL or default to 'details'
  const activeTab = searchParams.tab || "details";

  return (
    <div className="flex gap-6 p-5 w-full">
      <div className="flex-1 max-w-4xl">
        {/* Tabs */}
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
            <StoreDesignTab store={store} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Fixed Device Preview on the Right */}
      <div className="hidden xl:block w-[420px] flex-shrink-0">
        <div className="sticky top-[calc(var(--header-height)+1.5rem)]">
          <DevicePreview
            name={store.name || ""}
            bio={store.bio}
            location={store.location}
            profilePicUrl={store.profile_pic_url}
            bannerPicUrl={store.banner_pic_url}
            socialLinks={
              socialLinks?.map((link) => ({
                platform: link.platform,
                url: link.url,
              })) || []
            }
            theme="minimal_white"
            fontFamily="Inter"
            blockShape="round"
          />
        </div>
      </div>
    </div>
  );
}
