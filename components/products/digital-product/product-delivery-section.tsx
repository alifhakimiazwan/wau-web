"use client";

import { useState, useCallback } from "react";
import {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
} from "react-hook-form";
import { FloatingInput } from "@/components/ui/floating-input";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/radix/tabs";
import { Field, FieldDescription } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import { Link as LinkIcon, Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dropzone,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import type { DigitalProductInput } from "@/lib/products/schemas";

interface ProductDeliverySectionProps {
  register: UseFormRegister<DigitalProductInput>;
  errors: FieldErrors<DigitalProductInput>;
  watch: UseFormWatch<DigitalProductInput>;
  setValue: UseFormSetValue<DigitalProductInput>;
}

export function ProductDeliverySection({
  register,
  errors,
  watch,
  setValue,
}: ProductDeliverySectionProps) {
  const productType = watch("productType") || "link";
  const existingFile = watch("productFile");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Check if we have either a new file or existing file data
  const hasFile = uploadedFile || existingFile;

  const handleFileUpload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      const file = files[0];
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "lead_magnet_file");

      try {
        const response = await fetch("/api/products/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Upload failed");
        }

        setUploadedFile(file);
        setValue("productFile", {
          url: data.url,
          filename: file.name,
          size: file.size,
        });
        setValue("productType", "file");
        setValue("productLink", undefined);
        toast.success("File uploaded successfully");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to upload file"
        );
      } finally {
        setIsUploading(false);
      }
    },
    [setValue]
  );

  const removeFile = useCallback(() => {
    setUploadedFile(null);
    setValue("productFile", undefined);
    setValue("productType", "link");
  }, [setValue]);

  const handleTabChange = useCallback(
    (value: string) => {
      const type = value as "link" | "file";
      setValue("productType", type);
      if (type === "link") {
        setUploadedFile(null);
        setValue("productFile", undefined);
      } else if (type === "file") {
        setValue("productLink", undefined);
      }
    },
    [setValue]
  );

  return (
    <Field>
      <Tabs value={productType} onValueChange={handleTabChange}>
        <TabsList className="w-full">
          <TabsTrigger value="link" className="flex-1">
            <LinkIcon className="w-4 h-4 mr-2" />
            Link
          </TabsTrigger>
          <TabsTrigger value="file" className="flex-1">
            <Upload className="w-4 h-4 mr-2" />
            File Upload
          </TabsTrigger>
        </TabsList>

        <TabsContents style={{ overflow: "visible" }}>
          {/* Link Tab */}
          <TabsContent value="link" className="space-y-4 mt-4">
            <FloatingInput
              id="productLink.url"
              type="url"
              label="Download URL"
              {...register("productLink.url")}
              error={errors.productLink?.url?.message}
            />

            <FloatingInput
              id="productLink.title"
              type="text"
              label="Link Title"
              {...register("productLink.title")}
              error={errors.productLink?.title?.message}
            />
          </TabsContent>

          {/* File Upload Tab */}
          <TabsContent value="file" className="space-y-4 mt-4">
            <FieldDescription>
              Upload your digital product file (PDF or ZIP, max 50MB)
            </FieldDescription>

            {!hasFile ? (
              <Dropzone
                onDrop={handleFileUpload}
                accept={{
                  "application/pdf": [".pdf"],
                  "application/zip": [".zip"],
                  "application/x-zip-compressed": [".zip"],
                }}
                maxFiles={1}
                maxSize={50 * 1024 * 1024}
                disabled={isUploading}
              >
                <DropzoneEmptyState>
                  <div className="flex flex-col items-center justify-center">
                    {isUploading ? (
                      <>
                        <Loader2 className="w-12 h-12 text-muted-foreground mb-4 animate-spin" />
                        <p className="text-sm font-medium mb-2">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="text-sm font-medium mb-2">
                          Drag and drop your file here, or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Supports PDF, ZIP (Max 50MB)
                        </p>
                      </>
                    )}
                  </div>
                </DropzoneEmptyState>
              </Dropzone>
            ) : (
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-10 h-10 text-primary" />
                    <div>
                      <p className="font-medium text-sm">
                        {uploadedFile?.name || existingFile?.filename || "Unknown file"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {uploadedFile
                          ? `${(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB`
                          : existingFile?.size
                          ? `${(existingFile.size / (1024 * 1024)).toFixed(2)} MB`
                          : "Unknown size"
                        }
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={removeFile}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            )}

            {errors.productFile && (
              <FieldDescription className="text-destructive">
                {errors.productFile.message || "File is required"}
              </FieldDescription>
            )}
          </TabsContent>
        </TabsContents>
      </Tabs>
    </Field>
  );
}
