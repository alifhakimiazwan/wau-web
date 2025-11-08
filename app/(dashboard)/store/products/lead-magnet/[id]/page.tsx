import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { CreateLeadMagnetForm } from "@/components/products/lead-magnet/create-lead-magnet-form";
import { requireStore } from "@/lib/guards/onboarding-guard";
import { getDesignCustomization } from "@/lib/design/actions";
import { getProductById } from "@/lib/products/actions";

export default async function EditLeadMagnetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { store } = await requireStore();
  const designConfig = await getDesignCustomization(store.id);

  // Fetch the product
  const productResult = await getProductById(id);

  if (!productResult.success || !productResult.data) {
    notFound();
  }

  const product = productResult.data;

  // Ensure this is a lead magnet product
  if (product.type !== "lead_magnet") {
    notFound();
  }

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
            Edit Lead Magnet
          </Typography>
          <Typography variant="muted" className="mt-2">
            Update your lead magnet product
          </Typography>
        </div>

        {/* Form Component */}
        <CreateLeadMagnetForm
          designConfig={designConfig}
          productId={product.id}
          initialData={product}
        />
      </div>
    </div>
  );
}
