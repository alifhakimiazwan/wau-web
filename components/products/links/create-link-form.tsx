"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  Image as ImageIcon,
  ExternalLink,
  Palette,
  CheckCircle,
  LayoutDashboard,
  Link as LinkIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";

import { StyleSelector } from "./style-selector";
import { TitleField } from "@/components/products/shared/title-field";
import { SubtitleField } from "@/components/products/shared/subtitle-field";
import { ButtonTextField } from "@/components/products/shared/button-text-field";
import { URLField } from "@/components/products/shared/url-field";
import { ThumbnailUpload } from "@/components/products/thumbnail-upload";
import { ProductPreviewWrapper } from "@/components/preview/utils/product-preview-wrapper";
import { LinkClassicPreview } from "@/components/preview/link/link-classic-preview";
import { LinkCalloutPreview } from "@/components/preview/link/link-callout-preview";
import { LinkEmbedPreview } from "@/components/preview/link/link-embed-preview";

import {
  linkSchema,
  type LinkSchema,
  type LinkInput,
} from "@/lib/products/schemas";
import type { DesignCustomization } from "@/lib/design/types";
import { createLinkProduct } from "@/lib/products/actions";

interface CreateLinkFormProps {
  designConfig: DesignCustomization | null;
}

export function CreateLinkForm({ designConfig }: CreateLinkFormProps) {
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
  } = useForm<LinkInput>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      style: "classic",
      name: "",
      subtitle: "",
      buttonText: "",
      thumbnail: "",
      url: "",
    },
  });

  // Watch form values for real-time preview
  const watchedStyle = watch("style");
  const watchedName = watch("name");
  const watchedSubtitle = watch("subtitle");
  const watchedButtonText = watch("buttonText");
  const watchedUrl = watch("url");

  const onSubmit = async (data: LinkInput, status: "draft" | "published") => {
    startTransition(async () => {
      try {
        // Omit status from data since we're using the parameter
        const { status: _, ...dataWithoutStatus } = data;
        const payload = {
          ...dataWithoutStatus,
          thumbnail: thumbnailUrl || undefined,
          status,
        };

        const result = await createLinkProduct(payload);

        if (!result.success) {
          throw new Error(result.error || "Failed to create link");
        }

        toast.success(
          status === "published"
            ? "Link published successfully!"
            : "Link saved as draft"
        );

        router.push("/store/products");
      } catch (error) {
        console.error("Submit error:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to create link"
        );
      }
    });
  };

  const handleStyleChange = (style: "classic" | "callout" | "embed") => {
    setValue("style", style);
  };

  // Determine which fields to show based on style
  const showTitle = watchedStyle === "classic" || watchedStyle === "callout";
  const showSubtitle = watchedStyle === "callout";
  const showButtonText = watchedStyle === "callout";
  const showThumbnail =
    watchedStyle === "classic" || watchedStyle === "callout";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-2 space-y-8">
        {/* Step 1: Style Selection */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
              <LayoutDashboard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <Typography variant="h3" font="serif">
              Basic Details
            </Typography>
          </div>

          <StyleSelector
            errors={errors}
            selectedStyle={watchedStyle}
            onStyleChange={handleStyleChange}
          />
        </section>

        {/* Step 2: Details (conditional) */}
        {watchedStyle !== "embed" && (
          <>
            <section>
              <div className="space-y-4">
                {showTitle && (
                  <TitleField
                    register={register}
                    errors={errors}
                    placeholder="Enter link title"
                  />
                )}

                {showSubtitle && (
                  <SubtitleField
                    register={register}
                    errors={errors}
                    placeholder="Brief description of your link"
                  />
                )}

                {showButtonText && (
                  <ButtonTextField
                    register={register}
                    errors={errors}
                    placeholder="Visit Now"
                  />
                )}
              </div>
            </section>
          </>
        )}

        {/* Step 3: Thumbnail (conditional) */}
        {showThumbnail && (
          <>
            <section>
              <ThumbnailUpload
                value={thumbnailUrl || undefined}
                onChange={(url) => {
                  setThumbnailUrl(url);
                  setValue("thumbnail", url || "");
                }}
              />
            </section>
          </>
        )}

        {/* Step 4: URL */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0">
              <LinkIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <Typography variant="h3" font="serif">
              Destination URL
            </Typography>
          </div>

          <URLField
            register={register}
            errors={errors}
            label="URL"
            description={
              watchedStyle === "embed"
                ? "Enter a YouTube or Spotify URL"
                : "Where should this link go?"
            }
            placeholder={
              watchedStyle === "embed"
                ? "https://youtube.com/watch?v=... or https://open.spotify.com/..."
                : "https://example.com"
            }
          />
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
                Saving...
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
                Publishing...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Publish Link
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Preview Section */}
      <ProductPreviewWrapper>
        {watchedStyle === "classic" && (
          <LinkClassicPreview
            name={watchedName}
            thumbnail={thumbnailUrl}
            url={watchedUrl}
            designConfig={designConfig}
          />
        )}
        {watchedStyle === "callout" && (
          <LinkCalloutPreview
            name={watchedName}
            subtitle={watchedSubtitle}
            buttonText={watchedButtonText}
            thumbnail={thumbnailUrl}
            url={watchedUrl}
            designConfig={designConfig}
          />
        )}
        {watchedStyle === "embed" && (
          <LinkEmbedPreview url={watchedUrl} designConfig={designConfig} />
        )}
      </ProductPreviewWrapper>
    </div>
  );
}
