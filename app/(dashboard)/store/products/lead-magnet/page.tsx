import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { CreateLeadMagnetForm } from "@/components/products/lead-magnet/create-lead-magnet-form";
import { requireStore } from "@/lib/guards/onboarding-guard";
import { getDesignCustomization } from "@/lib/design/actions";

export default async function CreateLeadMagnetPage() {
  const { store } = await requireStore();

  const designConfig = await getDesignCustomization(store.id);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-6 px-6">
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
