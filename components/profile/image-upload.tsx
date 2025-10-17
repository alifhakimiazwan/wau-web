"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { IconPencil, IconUpload, IconTrash } from "@tabler/icons-react";
import { Loader2, X } from "lucide-react";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { getInitials } from "@/lib/profile/actions";
import { ImageUploadProps } from "@/lib/image/types";
import { IMAGE_UPLOAD } from "./constants";
import { useImageUpload } from "./hooks/useImageUpload";

export function ImageUpload({
  currentImageUrl,
  onUploadCompleteAction,
  type,
  storeName,
  storeSlug,
}: ImageUploadProps) {
  const {
    isUploading,
    previewUrl,
    fileInputRef,
    handleFileSelect,
    handleDrop,
    removeImage,
    triggerFileSelect,
  } = useImageUpload({
    type,
    currentImageUrl,
    onUploadComplete: onUploadCompleteAction,
  });

  // Banner files state - must be at top level (React Hooks rule)
  const [bannerFiles, setBannerFiles] = useState<File[] | undefined>(undefined);

  if (type === "avatar") {
    return (
      <div className="flex items-center gap-4">
        <div className="relative w-32 h-32">
          <Avatar className="h-full w-full border-4 border-background">
            <AvatarImage
              src={previewUrl || undefined}
              alt={storeName || storeSlug}
              className="object-cover"
            />
            <AvatarFallback className="text-2xl font-semibold">
              {getInitials(storeName)}
            </AvatarFallback>
          </Avatar>

          <Button
            type="button"
            size="icon"
            variant="default"
            className="absolute bottom-3 right-2 h-7 w-7 rounded-full shadow-lg cursor-pointer hover:-bg-conic-30"
            onClick={triggerFileSelect}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <IconPencil className="h-4 w-4" />
            )}
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept={IMAGE_UPLOAD.acceptedFormats.join(",")}
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
        </div>

        {previewUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={removeImage}
            disabled={isUploading}
          >
            <IconTrash className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  // Banner upload with custom Dropzone
  return (
    <div className="space-y-2">
      {previewUrl ? (
        <div className="relative w-full h-40 rounded-lg overflow-hidden border-2 border-muted">
          <img
            src={previewUrl}
            alt="Banner"
            className="w-full h-full object-cover"
          />
          {!isUploading && (
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-white animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <Dropzone
          maxSize={IMAGE_UPLOAD.maxSize}
          onDrop={handleDrop}
          onError={(error) => toast.error(error.message)}
          src={bannerFiles}
          accept={{
            "image/jpeg": [".jpg", ".jpeg"],
            "image/png": [".png"],
            "image/webp": [".webp"],
          }}
          maxFiles={1}
          disabled={isUploading}
          className="h-40 rounded-lg"
        >
          <DropzoneEmptyState>
            <div className="flex flex-col items-center justify-center">
              {isUploading ? (
                <>
                  <Loader2 className="h-8 w-8 mb-2 animate-spin" />
                  <p className="text-sm">Uploading...</p>
                </>
              ) : (
                <>
                  <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <IconUpload size={16} />
                  </div>
                  <p className="my-2 font-medium text-sm">Upload banner</p>
                  <p className="text-muted-foreground text-xs">
                    Drag and drop or click to upload
                  </p>
                  <p className="text-muted-foreground text-xs">
                    1200x400px recommended
                  </p>
                </>
              )}
            </div>
          </DropzoneEmptyState>
          <DropzoneContent />
        </Dropzone>
      )}
    </div>
  );
}
