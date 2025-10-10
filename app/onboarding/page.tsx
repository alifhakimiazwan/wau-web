import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { BackgroundBeams } from "@/components/ui/shadcn-io/background-beams";
import { OnboardingToast } from "@/components/onboarding/onboarding-toast";
import { preventCompletedOnboarding } from "@/lib/guards/onboarding-guard";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ confirmed?: string }>;
}) {
  const params = await searchParams;
  const { user } = await preventCompletedOnboarding();

  const userName = user.user_metadata?.full_name || "";

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <BackgroundBeams />
      <div className="relative z-10 w-full max-w-md">
        <OnboardingForm userName={userName} />
      </div>
      <OnboardingToast confirmed={params.confirmed === "true"} />
    </div>
  );
}
