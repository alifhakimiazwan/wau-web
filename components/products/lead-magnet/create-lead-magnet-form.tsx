"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  FileText,
  Image as ImageIcon,
  Users,
  Gift,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import { ProductBasicInfo } from "@/components/products/product-basic-info";
import { ThumbnailUpload } from "@/components/products/thumbnail-upload";
import { CustomerFieldsSelector } from "@/components/products/customer-fields-selector";
import { FreebieSelector } from "@/components/products/freebie-selector";
import { SuccessMessage } from "@/components/products/success-message";
import { LeadMagnetPreviewWrapper } from "@/components/products/lead-magnet/lead-magnet-preview-wrapper";
import { leadMagnetSchema, type LeadMagnetInput } from "@/lib/products/schemas";
import type { DesignCustomization } from "@/lib/design/types";
import type { Product } from "@/lib/products/types";
import { createLeadMagnetProduct, updateLeadMagnetProduct } from "@/lib/products/actions";

interface CreateLeadMagnetFormProps {
  designConfig: DesignCustomization | null;
  productId?: string;
  initialData?: Product;
}

export function CreateLeadMagnetForm({
  designConfig,
  productId,
  initialData,
}: CreateLeadMagnetFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditMode = !!productId && !!initialData;

  // Type-safe extraction of lead magnet config from JSONB
  const getLeadMagnetConfig = () => {
    if (!isEditMode || !initialData?.type_config) {
      return null;
    }

    const config = initialData.type_config as Record<string, unknown>;
    return {
      subtitle: (config.subtitle as string) || "",
      buttonText: (config.buttonText as string) || "",
      customerFields: (config.customerFields as {
        email: boolean;
        name: boolean;
        phone: boolean;
      }) || { email: true, name: false, phone: false },
      freebieType: (config.freebieType as "link" | "file") || "link",
      freebieLink: (config.freebieLink as { url: string; title: string }) || undefined,
      freebieFile: (config.freebieFile as { url: string; filename: string; size: number }) || undefined,
      successMessage: (config.successMessage as string) || "",
    };
  };

  const leadMagnetConfig = getLeadMagnetConfig();

  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(
    isEditMode && initialData ? (initialData.thumbnail_url || null) : null
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
    setError,
  } = useForm<LeadMagnetInput>({
    resolver: zodResolver(leadMagnetSchema),
    defaultValues: isEditMode && leadMagnetConfig ? {
      name: initialData.name || "",
      subtitle: leadMagnetConfig.subtitle,
      buttonText: leadMagnetConfig.buttonText,
      thumbnail: initialData.thumbnail_url || "",
      customerFields: leadMagnetConfig.customerFields,
      freebieType: leadMagnetConfig.freebieType,
      ...(leadMagnetConfig.freebieType === "link" && leadMagnetConfig.freebieLink
        ? { freebieLink: leadMagnetConfig.freebieLink }
        : {}),
      ...(leadMagnetConfig.freebieType === "file" && leadMagnetConfig.freebieFile
        ? { freebieFile: leadMagnetConfig.freebieFile }
        : {}),
      successMessage: leadMagnetConfig.successMessage,
      status: (initialData.status as "draft" | "published") || "draft",
    } : {
      name: "Get My Free [Guide/Template/Checklist]",
      subtitle: "Download your free resource instantly",
      buttonText: "Get It Free",
      thumbnail: "",
      customerFields: {
        email: true,
        name: false,
        phone: false,
      },
      freebieType: "link",
      freebieLink: {
        url: "",
        title: "My Free Resource",
      },
      successMessage: "Thank you! Check your email for the download link.",
    },
  });

  const onSubmit = async (
    data: LeadMagnetInput,
    status: "draft" | "published"
  ) => {
    startTransition(async () => {
      try {
        const payload = {
          ...data,
          thumbnail: thumbnailUrl || undefined,
          status,
        };

        const result = isEditMode && productId
          ? await updateLeadMagnetProduct(productId, payload)
          : await createLeadMagnetProduct(payload);

        if (!result.success) {
          throw new Error(result.error || `Failed to ${isEditMode ? 'update' : 'create'} lead magnet`);
        }

        toast.success(
          isEditMode
            ? "Lead magnet updated successfully!"
            : status === "draft"
            ? "Lead magnet saved as draft!"
            : "Lead magnet published successfully!"
        );
        router.push("/store");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : `Failed to ${isEditMode ? 'update' : 'create'} lead magnet`
        );
        setError("root", {
          message:
            error instanceof Error
              ? error.message
              : `Failed to ${isEditMode ? 'update' : 'create'} lead magnet`,
        });
      }
    });
  };

  return (
    <div className="flex gap-8">
      <div className="flex-1">
        <form onSubmit={(e) => e.preventDefault()}>
          {/* Basic Information Section */}
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <Typography variant="h4" font="serif">
                  Basic Information
                </Typography>
                <Typography variant="muted" className="mt-1">
                  Tell us about your lead magnet
                </Typography>
              </div>
            </div>
            <div className="sm:max-w-3xl md:col-span-2">
              <ProductBasicInfo register={register} errors={errors} />
            </div>
          </div>
          <Separator className="my-8" />

          {/* Thumbnail Section */}
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center flex-shrink-0">
                <ImageIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <Typography variant="h4" font="serif">
                  Thumbnail
                </Typography>
                <Typography variant="muted" className="mt-1">
                  Add a visual representation for your lead magnet
                </Typography>
              </div>
            </div>
            <div className="sm:max-w-3xl md:col-span-2">
              <ThumbnailUpload
                value={thumbnailUrl || undefined}
                onChange={(url) => {
                  setThumbnailUrl(url);
                  setValue("thumbnail", url || "");
                }}
              />
            </div>
          </div>

          <Separator className="my-8" />

          {/* Customer Fields Section */}
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-950 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <Typography variant="h4" font="serif">
                  Customer Information
                </Typography>
                <Typography variant="muted" className="mt-1">
                  What information do you need from customers?
                </Typography>
              </div>
            </div>
            <div className="sm:max-w-3xl md:col-span-2">
              <CustomerFieldsSelector
                watch={watch}
                setValue={setValue}
                errors={errors.customerFields}
              />
            </div>
          </div>

          <Separator className="my-8" />

          {/* Freebie Delivery Section */}
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-950 flex items-center justify-center flex-shrink-0">
                <Gift className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <Typography variant="h4" font="serif">
                  Freebie Delivery
                </Typography>
                <Typography variant="muted" className="mt-1">
                  How will customers receive their free resource?
                </Typography>
              </div>
            </div>
            <div className="sm:max-w-3xl md:col-span-2">
              <FreebieSelector
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
              />
            </div>
          </div>

          <Separator className="my-8" />

          {/* Success Message Section */}
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <Typography variant="h4" font="serif">
                  Success Message
                </Typography>
                <Typography variant="muted" className="mt-1">
                  Customize the thank you message shown after submission
                </Typography>
              </div>
            </div>
            <div className="sm:max-w-3xl md:col-span-2">
              <SuccessMessage register={register} errors={errors} />
            </div>
          </div>

          <Separator className="my-8" />

          {/* Error Message */}
          {/* {errors.root && (
            <div className="mb-8">
              <div className="p-4 border border-destructive bg-destructive/10 rounded-lg">
                <Typography variant="small" className="text-destructive">
                  {errors.root.message}
                </Typography>
              </div>
            </div>
          )} */}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/store/products")}
              disabled={isPending}
              className="rounded-full"
            >
              Cancel
            </Button>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleSubmit((data) => onSubmit(data, "draft"))}
                disabled={isPending}
                className="rounded-full"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isEditMode ? "Updating..." : "Saving..."}
                  </>
                ) : (
                  "Save Draft"
                )}
              </Button>
              <Button
                type="button"
                onClick={handleSubmit((data) => onSubmit(data, "published"))}
                disabled={isPending}
                className="rounded-full"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isEditMode ? "Updating..." : "Publishing..."}
                  </>
                ) : (
                  isEditMode ? "Update Lead Magnet" : "Publish Lead Magnet"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Preview Column */}
      <div className="lg:w-96 hidden lg:block">
        <div className="sticky top-24">
          <LeadMagnetPreviewWrapper
            control={control}
            thumbnailUrl={thumbnailUrl}
            designConfig={designConfig}
          />
        </div>
      </div>

      {/* Mobile Preview */}
      <div className="lg:hidden mt-8">
        <LeadMagnetPreviewWrapper
          control={control}
          thumbnailUrl={thumbnailUrl}
          designConfig={designConfig}
        />
      </div>
    </div>
  );
}
