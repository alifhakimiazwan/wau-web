import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { CreateDigitalProductForm } from "@/components/products/digital-product/create-digital-product-form";
import { requireStore } from "@/lib/guards/onboarding-guard";
import { getDesignCustomization } from "@/lib/design/actions";
import { getProductById } from "@/lib/products/actions";

export default async function EditDigitalProductPage({
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

  // Ensure this is a digital product
  if (product.type !== "digital_product") {
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
            Edit Digital Product
          </Typography>
          <Typography variant="muted" className="mt-1">
            Update your digital product
          </Typography>
        </div>

        {/* Form Component */}
        <CreateDigitalProductForm
          designConfig={designConfig}
          productId={product.id}
          initialData={product}
        />
      </div>
    </div>
  );
}
