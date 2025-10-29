import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { CreateDigitalProductForm } from "@/components/products/digital-product/create-digital-product-form";
import { requireStore } from "@/lib/guards/onboarding-guard";
import { getDesignCustomization } from "@/lib/design/actions";

export default async function CreateDigitalProductPage() {
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
            Lets start creating
          </Typography>
          <Typography variant="muted" className="mt-1">
            Start selling your digital product instantly
          </Typography>
        </div>

        {/* Form Component */}
        <CreateDigitalProductForm designConfig={designConfig} />
      </div>
    </div>
  );
}
