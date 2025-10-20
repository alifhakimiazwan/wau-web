"use client";

import { useState, useCallback } from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/radix/tabs";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import { Link as LinkIcon, Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";

interface FreebieSelectorProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch: any;
  setValue: any;
}

export function FreebieSelector({
  register,
  errors,
  watch,
  setValue,
}: FreebieSelectorProps) {
  const freebieType = watch("freebieType") || "link";
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
        setValue("freebieFile", {
          url: data.url,
          filename: file.name,
          size: file.size,
        });
        setValue("freebieType", "file"); // Ensure freebieType is set to "file"
        // Clear link fields to avoid validation conflicts
        setValue("freebieLink", undefined);
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
    setValue("freebieFile", undefined);
    setValue("freebieType", "link"); // Reset to link type when file is removed
  }, [setValue]);

  const handleTabChange = useCallback(
    (value: string) => {
      setValue("freebieType", value);
      // Clear the opposite field when switching tabs
      if (value === "link") {
        setUploadedFile(null);
        setValue("freebieFile", undefined);
      } else if (value === "file") {
        setValue("freebieLink", undefined);
      }
    },
    [setValue]
  );

  return (
    <div className="space-y-4">
      <Field>
        <Tabs
          value={freebieType}
          onValueChange={handleTabChange}
          className="mt-2"
        >
          <TabsList className="w-full gap-2">
            <TabsTrigger value="link" className="flex-1">
              <LinkIcon className="w-4 h-4" />
              External Link
            </TabsTrigger>
            <TabsTrigger value="file" className="flex-1">
              <Upload className="w-4 h-4" />
              Upload File
            </TabsTrigger>
          </TabsList>

          <TabsContents>
            <TabsContent value="link" className="mt-4">
              <Card className="p-4 space-y-4">
                <Field>
                  <FieldLabel htmlFor="freebieLink.title">
                    Link Title
                  </FieldLabel>
                  <Input
                    id="freebieLink.title"
                    placeholder="e.g., Download Template"
                    {...register("freebieLink.title")}
                  />
                  {errors.freebieLink?.title && (
                    <FieldDescription className="text-destructive">
                      {errors.freebieLink.title.message as string}
                    </FieldDescription>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="freebieLink.url">Link URL</FieldLabel>
                  <Input
                    id="freebieLink.url"
                    type="url"
                    placeholder="https://example.com/download"
                    {...register("freebieLink.url")}
                  />
                  {errors.freebieLink?.url && (
                    <FieldDescription className="text-destructive">
                      {errors.freebieLink.url.message as string}
                    </FieldDescription>
                  )}
                </Field>
              </Card>
            </TabsContent>

            <TabsContent value="file" className="mt-4">
              <Card className="p-4">
                {!uploadedFile ? (
                  <div className="h-auto">
                    <Dropzone
                      onDrop={handleFileUpload}
                      maxSize={50 * 1024 * 1024} // 50MB
                      disabled={isUploading}
                      accept={{
                        "application/pdf": [".pdf"],
                        "application/zip": [".zip"],
                        "application/x-zip-compressed": [".zip"],
                      }}
                    >
                      <DropzoneEmptyState>
                        <div className="flex flex-col items-center justify-center">
                          {isUploading ? (
                            <Loader2 className="w-12 h-12 text-muted-foreground mb-4 animate-spin" />
                          ) : (
                            <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                          )}
                          <p className="text-sm font-medium mb-2">
                            {isUploading
                              ? "Uploading..."
                              : "Drag and drop your file here, or click to browse"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Supports PDF, ZIP (Max 50MB)
                          </p>
                        </div>
                      </DropzoneEmptyState>
                      <DropzoneContent />
                    </Dropzone>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                    <FileText className="w-8 h-8 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
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
                )}
                {errors.freebieFile && (
                  <FieldDescription className="text-destructive mt-2">
                    {errors.freebieFile.message as string}
                  </FieldDescription>
                )}
              </Card>
            </TabsContent>
          </TabsContents>
        </Tabs>
      </Field>
    </div>
  );
}
