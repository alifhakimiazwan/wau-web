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
import { ProductPreviewWrapper } from "@/components/preview/product-preview-wrapper";
import { LeadMagnetPreview } from "@/components/preview/lead-magnet-preview";

import { leadMagnetSchema, type LeadMagnetSchema } from "@/lib/products/schema";
import type { DesignCustomization } from "@/lib/design/types";

interface CreateLeadMagnetFormProps {
  designConfig: DesignCustomization | null;
}

export function CreateLeadMagnetForm({ designConfig }: CreateLeadMagnetFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    setError,
  } = useForm<LeadMagnetSchema>({
    resolver: zodResolver(leadMagnetSchema),
    defaultValues: {
      name: "",
      subtitle: "",
      buttonText: "",
      thumbnail: "",
      customerFields: {
        email: false,
        name: false,
        phone: false,
      },
      freebieType: "link",
      freebieLink: {
        url: "",
        title: "",
      },
      successMessage: "",
    },
  });

  // Watch form values for real-time preview
  const watchedName = watch("name");
  const watchedSubtitle = watch("subtitle");
  const watchedButtonText = watch("buttonText");
  const watchedCustomerFields = watch("customerFields");

  const onSubmit = async (
    data: LeadMagnetSchema,
    status: "draft" | "published"
  ) => {
    startTransition(async () => {
      try {
        const payload = {
          ...data,
          thumbnail: thumbnailUrl || undefined,
          status,
        };

        const response = await fetch("/api/products/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "lead_magnet",
            ...payload,
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to create lead magnet");
        }

        toast.success(
          status === "draft"
            ? "Lead magnet saved as draft!"
            : "Lead magnet published successfully!"
        );
        router.push("/store/products");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to create lead magnet"
        );
        setError("root", {
          message:
            error instanceof Error
              ? error.message
              : "Failed to create lead magnet",
        });
      }
    });
  };

  return (
    <div className="flex gap-8">
      {/* Form Column */}
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
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
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
          {errors.root && (
            <div className="mb-8">
              <div className="p-4 border border-destructive bg-destructive/10 rounded-lg">
                <Typography variant="small" className="text-destructive">
                  {errors.root.message}
                </Typography>
              </div>
            </div>
          )}

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
                    Saving...
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
                    Publishing...
                  </>
                ) : (
                  "Publish Lead Magnet"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Preview Column */}
      <div className="lg:w-96">
        <ProductPreviewWrapper>
          <LeadMagnetPreview
            name={watchedName}
            subtitle={watchedSubtitle}
            buttonText={watchedButtonText}
            thumbnail={thumbnailUrl}
            customerFields={watchedCustomerFields}
            designConfig={designConfig}
          />
        </ProductPreviewWrapper>
      </div>
    </div>
  );
}
