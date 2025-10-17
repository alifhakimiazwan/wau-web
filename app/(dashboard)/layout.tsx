import { requireStore } from "@/lib/guards/onboarding-guard";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/dashboard/site-header";
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, store } = await requireStore();

  const sidebarUser = {
    id: user.id,
    email: user.email || "",
    name: store.name || user.user_metadata?.full_name || "User",
    avatar: store.profile_pic_url || undefined,
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar user={sidebarUser} variant="inset" />
      <SidebarInset>
        <SiteHeader />

        <main className="w-full">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
