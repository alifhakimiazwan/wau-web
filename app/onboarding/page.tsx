import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/onboarding-form";
import { BackgroundBeams } from "@/components/ui/shadcn-io/background-beams";

export default async function OnboardingPage() {
  const supabase = await createServerSupabaseClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user already has a store
  const { data: store } = await supabase
    .from("stores")
    .select("id, slug")
    .eq("user_id", user.id)
    .single();

  if (store) {
    // User already completed onboarding
    redirect("/dashboard");
  }

  // Get user's full name from metadata
  const userName = user.user_metadata?.full_name || "";

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <BackgroundBeams />
      <div className="relative z-10 w-full max-w-md">
        <OnboardingForm userName={userName} />
      </div>
    </div>
  );
}
