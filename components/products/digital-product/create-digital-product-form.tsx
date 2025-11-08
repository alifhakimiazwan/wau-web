"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  CheckCircle,
  LayoutDashboard,
  ShoppingCart,
  Sparkles,
  FileText,
  Package,
  DollarSign,
  Users,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/radix/tabs";
import { StyleSelector } from "@/components/products/digital-product/style-selector";
import { CardSection } from "@/components/products/digital-product/card-section";
import { CheckoutSection } from "@/components/products/digital-product/checkout-section";
import { PricingSection } from "@/components/products/digital-product/pricing-section";
import { ProductDeliverySection } from "@/components/products/digital-product/product-delivery-section";
import { ReviewsSection } from "@/components/products/digital-product/reviews-section";
import { CustomerFieldsSelector } from "@/components/products/customer-fields-selector";
import {
  digitalProductSchema,
  type DigitalProductInput,
  type ProductReviewSchema,
} from "@/lib/products/schemas";
import { createDigitalProduct, updateDigitalProduct } from "@/lib/products/actions";
import type { DesignCustomization } from "@/lib/design/types";
import type { Product } from "@/lib/products/types";
import { DigitalProductPreview } from "@/components/products/digital-product/digital-product-preview";

interface CreateDigitalProductFormProps {
  designConfig: DesignCustomization | null;
  productId?: string;
  initialData?: Product;
}

export function CreateDigitalProductForm({
  designConfig,
  productId,
  initialData,
}: CreateDigitalProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<
    "landing" | "checkout" | "advanced"
  >("landing");

  const isEditMode = !!productId && !!initialData;

  // Type-safe extraction of digital product config from JSONB
  const getDigitalProductConfig = () => {
    if (!isEditMode || !initialData?.type_config) {
      return null;
    }

    const config = initialData.type_config as Record<string, unknown>;
    return {
      style: (config.style as "classic" | "callout") || "classic",
      cardTitle: (config.cardTitle as string) || "",
      cardSubtitle: (config.cardSubtitle as string) || "",
      cardButtonText: (config.cardButtonText as string) || "",
      cardThumbnail: (config.cardThumbnail as string) || undefined,
      description: (config.description as string) || "",
      bottomTitle: (config.bottomTitle as string) || "",
      checkoutButtonText: (config.checkoutButtonText as string) || "",
      checkoutImage: (config.checkoutImage as string) || undefined,
      price: (config.price as number) || 0,
      discountedPrice: (config.discountedPrice as number) || undefined,
      hasDiscount: (config.hasDiscount as boolean) || false,
      customerFields: (config.customerFields as {
        email: boolean;
        name: boolean;
        phone: boolean;
      }) || { email: true, name: false, phone: false },
      productType: (config.productType as "link" | "file") || "link",
      productLink: (config.productLink as { url: string; title: string }) || undefined,
      productFile: (config.productFile as { url: string; filename: string; size: number }) || undefined,
      reviews: (config.reviews as ProductReviewSchema[]) || [],
    };
  };

  const digitalProductConfig = getDigitalProductConfig();

  const [cardThumbnail, setCardThumbnail] = useState<string | null>(
    isEditMode && digitalProductConfig?.cardThumbnail ? digitalProductConfig.cardThumbnail : null
  );
  const [checkoutImage, setCheckoutImage] = useState<string | null>(
    isEditMode && digitalProductConfig?.checkoutImage ? digitalProductConfig.checkoutImage : null
  );
  const [reviews, setReviews] = useState<ProductReviewSchema[]>(
    isEditMode && digitalProductConfig?.reviews ? digitalProductConfig.reviews : []
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<DigitalProductInput>({
    resolver: zodResolver(digitalProductSchema),
    defaultValues: isEditMode && digitalProductConfig ? {
      style: digitalProductConfig.style,
      cardTitle: digitalProductConfig.cardTitle,
      cardSubtitle: digitalProductConfig.cardSubtitle,
      cardButtonText: digitalProductConfig.cardButtonText,
      cardThumbnail: digitalProductConfig.cardThumbnail,
      description: digitalProductConfig.description,
      bottomTitle: digitalProductConfig.bottomTitle,
      checkoutButtonText: digitalProductConfig.checkoutButtonText,
      checkoutImage: digitalProductConfig.checkoutImage,
      price: digitalProductConfig.price,
      discountedPrice: digitalProductConfig.discountedPrice,
      hasDiscount: digitalProductConfig.hasDiscount,
      customerFields: digitalProductConfig.customerFields,
      productType: digitalProductConfig.productType,
      ...(digitalProductConfig.productType === "link" && digitalProductConfig.productLink
        ? { productLink: digitalProductConfig.productLink }
        : {}),
      ...(digitalProductConfig.productType === "file" && digitalProductConfig.productFile
        ? { productFile: digitalProductConfig.productFile }
        : {}),
      status: (initialData.status as "draft" | "published") || "draft",
    } : {
      style: "classic",
      cardTitle: "Get My [Template/eBook/Course] Now!",
      cardSubtitle: "We will deliver this file right to your inbox",
      cardButtonText: "Get My Guide",
      description:
        "<p><strong>This [Template/eBook/Course] will teach you everything you need to achieve your goals.</strong></p><p>This guide is for you if you're looking to:</p><ul><li>Achieve your Dream</li><li>Find Meaning in Your Work</li><li>Be Happy</li></ul>",
      bottomTitle: "Get My Guide",
      checkoutButtonText: "PURCHASE",
      price: 9.99,
      hasDiscount: false,
      customerFields: {
        email: true,
        name: false,
        phone: false,
      },
      productType: "link",
      status: "draft",
    },
  });

  // Watch only fields needed for conditional rendering in the form
  const selectedStyle = watch("style");

  const onSubmit = async (
    data: DigitalProductInput,
    status: "draft" | "published"
  ) => {
    startTransition(async () => {
      try {
        const payload = {
          ...data,
          cardThumbnail: cardThumbnail || undefined,
          checkoutImage: checkoutImage || undefined,
          status,
          reviews,
        };

        const result = isEditMode && productId
          ? await updateDigitalProduct(productId, payload)
          : await createDigitalProduct(payload);

        if (!result.success) {
          throw new Error(result.error || `Failed to ${isEditMode ? 'update' : 'create'} digital product`);
        }

        toast.success(
          isEditMode
            ? "Digital product updated successfully!"
            : status === "published"
            ? "Digital product published successfully!"
            : "Digital product saved as draft"
        );

        router.push("/store");
      } catch (error) {
        console.error("Submit error:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : `Failed to ${isEditMode ? 'update' : 'create'} digital product`
        );
      }
    });
  };

  // Handle publish with validation
  const handlePublish = () => {
    handleSubmit(
      (data) => onSubmit(data, "published"),
      (errors) => {
        // Find the first error and show it
        const firstErrorKey = Object.keys(errors)[0];
        const firstError = errors[firstErrorKey as keyof typeof errors];
        if (firstError && "message" in firstError) {
          toast.error(firstError.message as string);
        } else {
          toast.error("Please fill in all required fields");
        }
      }
    )();
  };

  // Handle draft with validation
  const handleDraft = () => {
    handleSubmit(
      (data) => onSubmit(data, "draft"),
      (errors) => {
        // Find the first error and show it
        const firstErrorKey = Object.keys(errors)[0];
        const firstError = errors[firstErrorKey as keyof typeof errors];
        if (firstError && "message" in firstError) {
          toast.error(firstError.message as string);
        } else {
          toast.error("Please fill in all required fields");
        }
      }
    )();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Form Section */}
      <form onSubmit={(e) => e.preventDefault()} className="lg:col-span-3">
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "landing" | "checkout" | "advanced")
          }
        >
        <TabsList className="mb-8">
          <TabsTrigger value="landing">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Landing Page
          </TabsTrigger>
          <TabsTrigger value="checkout">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Checkout Page
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Sparkles className="w-4 h-4 mr-2" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContents>
          <TabsContent value="landing" className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
                <LayoutDashboard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <Typography variant="h3" font="serif">
                Basic Details
              </Typography>
            </div>

            <div>
              <label className="text-sm font-medium block">Card Style</label>
              <StyleSelector
                errors={errors}
                selectedStyle={selectedStyle}
                onStyleChange={(style) => setValue("style", style)}
              />
            </div>

            <div>
              <CardSection
                register={register}
                errors={errors}
                selectedStyle={selectedStyle}
                thumbnailUrl={cardThumbnail}
                onThumbnailChange={setCardThumbnail}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="button" onClick={() => setActiveTab("checkout")}>
                Continue
              </Button>
            </div>
          </TabsContent>

          {/* Checkout Page Tab */}
          <TabsContent value="checkout" className="space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <Typography variant="h4" font="serif">
                  Product Details
                </Typography>
              </div>
              <CheckoutSection
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
                checkoutImageUrl={checkoutImage}
                onCheckoutImageChange={setCheckoutImage}
              />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <Typography variant="h4" font="serif">
                  Product Delivery
                </Typography>
              </div>
              <ProductDeliverySection
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
              />
            </div>

            <div className="pt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <Typography variant="h4" font="serif">
                  Pricing
                </Typography>
              </div>
              <PricingSection
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
              />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <Typography variant="h4" font="serif">
                  Customer Information
                </Typography>
              </div>
              <CustomerFieldsSelector
                watch={watch}
                setValue={setValue}
                errors={errors.customerFields}
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab("landing")}
              >
                Back
              </Button>
              <Button type="button" onClick={() => setActiveTab("advanced")}>
                Continue
              </Button>
            </div>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-8">
            <div>
              <ReviewsSection reviews={reviews} onReviewsChange={setReviews} />
            </div>

            {/* Navigation and Submit Buttons */}
            <div className="flex justify-between items-center pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab("checkout")}
              >
                Back
              </Button>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDraft}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isEditMode ? "Updating..." : "Saving..."}
                    </>
                  ) : (
                    "Save as Draft"
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={handlePublish}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isEditMode ? "Updating..." : "Publishing..."}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {isEditMode ? "Update Product" : "Publish Product"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>
        </TabsContents>
      </Tabs>
    </form>

    {/* Preview Section */}
    <div className="lg:col-span-2 hidden lg:block">
      <div className="sticky top-24">
        <DigitalProductPreview
          control={control}
          cardThumbnail={cardThumbnail}
          checkoutImage={checkoutImage}
          activeTab={activeTab}
          designConfig={designConfig}
        />
      </div>
    </div>

    {/* Mobile Preview Button */}
    <div className="lg:hidden">
      <DigitalProductPreview
        control={control}
        cardThumbnail={cardThumbnail}
        checkoutImage={checkoutImage}
        activeTab={activeTab}
        designConfig={designConfig}
      />
    </div>
    </div>
  );
}
