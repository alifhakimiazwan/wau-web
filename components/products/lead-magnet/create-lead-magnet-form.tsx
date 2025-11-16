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
import {
  createLeadMagnetProduct,
  updateLeadMagnetProduct,
} from "@/lib/products/actions";

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
      freebieLink:
        (config.freebieLink as { url: string; title: string }) || undefined,
      freebieFile:
        (config.freebieFile as {
          url: string;
          filename: string;
          size: number;
        }) || undefined,
      successMessage: (config.successMessage as string) || "",
    };
  };

  const leadMagnetConfig = getLeadMagnetConfig();

  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(
    isEditMode && initialData ? initialData.thumbnail_url || null : null
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
    defaultValues:
      isEditMode && leadMagnetConfig
        ? {
            name: initialData.name || "",
            subtitle: leadMagnetConfig.subtitle,
            buttonText: leadMagnetConfig.buttonText,
            thumbnail: initialData.thumbnail_url || "",
            customerFields: leadMagnetConfig.customerFields,
            freebieType: leadMagnetConfig.freebieType,
            ...(leadMagnetConfig.freebieType === "link" &&
            leadMagnetConfig.freebieLink
              ? { freebieLink: leadMagnetConfig.freebieLink }
              : {}),
            ...(leadMagnetConfig.freebieType === "file" &&
            leadMagnetConfig.freebieFile
              ? { freebieFile: leadMagnetConfig.freebieFile }
              : {}),
            successMessage: leadMagnetConfig.successMessage,
            status: (initialData.status as "draft" | "published") || "draft",
          }
        : {
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
            successMessage:
              "Thank you! Check your email for the download link.",
          },
  });

  const onSubmit = async (
    data: LeadMagnetInput,
    status: "draft" | "published"
  ) => {
    // Debug: Log form data to see what's being submitted
    console.log("Form data before validation:", data);
    console.log("freebieType:", data.freebieType);
    console.log("freebieFile:", data.freebieFile);
    console.log("freebieLink:", data.freebieLink);

    startTransition(async () => {
      try {
        const payload = {
          ...data,
          thumbnail: thumbnailUrl || undefined,
          status,
        };

        const result =
          isEditMode && productId
            ? await updateLeadMagnetProduct(productId, payload)
            : await createLeadMagnetProduct(payload);

        if (!result.success) {
          throw new Error(
            result.error ||
              `Failed to ${isEditMode ? "update" : "create"} lead magnet`
          );
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
            : `Failed to ${isEditMode ? "update" : "create"} lead magnet`
        );
        setError("root", {
          message:
            error instanceof Error
              ? error.message
              : `Failed to ${isEditMode ? "update" : "create"} lead magnet`,
        });
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-2 space-y-8">
        {/* Basic Information Section */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <Typography variant="h3" font="serif">
              Basic Information
            </Typography>
          </div>
          <ProductBasicInfo register={register} errors={errors} />
        </section>

        {/* Thumbnail Section */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
              <ImageIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <Typography variant="h3" font="serif">
              Thumbnail
            </Typography>
          </div>
          <ThumbnailUpload
            value={thumbnailUrl || undefined}
            onChange={(url) => {
              setThumbnailUrl(url);
              setValue("thumbnail", url || "");
            }}
          />
        </section>

        {/* Customer Fields Section */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <Typography variant="h3" font="serif">
              Customer Information
            </Typography>
          </div>
          <CustomerFieldsSelector
            watch={watch}
            setValue={setValue}
            errors={errors.customerFields}
          />
        </section>

        {/* Freebie Delivery Section */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <Typography variant="h3" font="serif">
              Freebie Delivery
            </Typography>
          </div>
          <FreebieSelector
            register={register}
            errors={errors}
            watch={watch}
            setValue={setValue}
          />
        </section>

        {/* Success Message Section */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <Typography variant="h3" font="serif">
              Success Message
            </Typography>
          </div>
          <SuccessMessage register={register} errors={errors} />
        </section>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleSubmit((data) => onSubmit(data, "draft"))}
            disabled={isPending}
            className="flex-1"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? "Updating..." : "Saving..."}
              </>
            ) : (
              "Save as Draft"
            )}
          </Button>

          <Button
            type="button"
            onClick={handleSubmit((data) => onSubmit(data, "published"))}
            disabled={isPending}
            className="flex-1"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? "Updating..." : "Publishing..."}
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                {isEditMode ? "Update Lead Magnet" : "Publish Lead Magnet"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="hidden lg:block">
        <div className="sticky top-24">
          <LeadMagnetPreviewWrapper
            control={control}
            thumbnailUrl={thumbnailUrl}
            designConfig={designConfig}
          />
        </div>
      </div>

      {/* Mobile Preview */}
      <div className="lg:hidden">
        <LeadMagnetPreviewWrapper
          control={control}
          thumbnailUrl={thumbnailUrl}
          designConfig={designConfig}
        />
      </div>
    </div>
  );
}
