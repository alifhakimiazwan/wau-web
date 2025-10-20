"use client";

import { useCallback } from "react";
import Image from "next/image";
import { Magnet, TrashIcon, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FieldDescription } from "@/components/ui/field";
import { useThumbnailUpload } from "@/lib/products/hooks/useThumbnailUpload";

interface ThumbnailUploadProps {
  value?: string;
  onChange: (url: string | null) => void;
  fallbackIcon?: React.ComponentType<{ className?: string }>;
}

export function ThumbnailUpload({
  value,
  onChange,
  fallbackIcon: FallbackIcon = Magnet,
}: ThumbnailUploadProps) {
  const { isUploading, thumbnailUrl, error, uploadThumbnail, removeThumbnail } =
    useThumbnailUpload({
      onUploadComplete: onChange,
    });

  // Sync with external value
  const displayUrl = thumbnailUrl || value;

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        await uploadThumbnail(files[0]);
      }
    },
    [uploadThumbnail]
  );

  const handleRemove = useCallback(() => {
    removeThumbnail();
    onChange(null);
  }, [removeThumbnail, onChange]);

  return (
    <Field>
      <div className="mt-2">
        {!displayUrl ? (
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center gap-4">
              {isUploading ? (
                <Loader2 className="w-12 h-12 text-muted-foreground animate-spin" />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
                  <FallbackIcon className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              <div className="text-center">
                <p className="text-sm font-medium mb-1">
                  {isUploading ? "Uploading..." : "Default icon will be used"}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  {isUploading
                    ? "Please wait"
                    : "or upload a custom thumbnail (Max 5MB)"}
                </p>
                {!isUploading && (
                  <>
                    <input
                      type="file"
                      onChange={handleFileInput}
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      className="hidden"
                      id="thumbnail-upload"
                      disabled={isUploading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document.getElementById("thumbnail-upload")?.click()
                      }
                      disabled={isUploading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted">
                <Image
                  src={displayUrl}
                  alt="Thumbnail"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 items-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemove}
                >
                  <TrashIcon className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          </Card>
        )}
        {error && (
          <FieldDescription className="text-destructive mt-2">
            {error}
          </FieldDescription>
        )}
      </div>
    </Field>
  );
}
