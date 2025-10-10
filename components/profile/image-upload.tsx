"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { IconPencil, IconUpload, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { compressImage } from "@/lib/image/image";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onUploadCompleteAction: (url: string) => void;
  type: "avatar" | "banner";
  storeName?: string;
  storeSlug: string;
}

export function ImageUpload({
  currentImageUrl,
  onUploadCompleteAction,
  type,
  storeName,
  storeSlug,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = () => {
    if (storeName) {
      return storeName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return storeSlug[0].toUpperCase();
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // ✅ Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a JPG, PNG, or WebP image");
      return;
    }

    // ✅ Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    setIsUploading(true);

    try {
      // ✅ Compress and resize image
      const targetSize = type === "avatar" ? 400 : 1200;
      const compressedFile = await compressImage(file, {
        maxWidth: targetSize,
        maxHeight: type === "avatar" ? 400 : 400,
        quality: 0.8,
      });

      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);

      // ✅ Upload via API route (server-side)
      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("type", type);
      formData.append("oldImageUrl", currentImageUrl || "");

      const response = await fetch("/api/profile/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Upload failed");
      }

      // Update with server URL
      setPreviewUrl(result.url);
      onUploadCompleteAction(result.url);

      toast.success(
        `${type === "avatar" ? "Profile picture" : "Banner"} uploaded!`
      );
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");

      // Revert preview on error
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    if (!currentImageUrl) return;

    setIsUploading(true);
    try {
      const response = await fetch("/api/profile/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: currentImageUrl, type }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Delete failed");
      }

      setPreviewUrl(null);
      onUploadCompleteAction("");

      toast.success(
        `${type === "avatar" ? "Profile picture" : "Banner"} removed`
      );
    } catch (error: any) {
      console.error("Remove error:", error);
      toast.error(error.message || "Failed to remove image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

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
              {getInitials()}
            </AvatarFallback>
          </Avatar>

          <Button
            type="button"
            size="icon"
            variant="default"
            className="absolute bottom-3 right-2 h-7 w-7 rounded-full shadow-lg cursor-pointer hover:-bg-conic-30"
            onClick={handleButtonClick}
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
            accept="image/jpeg,image/jpg,image/png,image/webp"
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
            onClick={handleRemove}
            disabled={isUploading}
          >
            <IconTrash className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  const handleDrop = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    // Create a synthetic event to reuse handleFileSelect
    const syntheticEvent = {
      target: {
        files: [file],
      },
    } as React.ChangeEvent<HTMLInputElement>;

    await handleFileSelect(syntheticEvent);
  };

  const [bannerFiles, setBannerFiles] = useState<File[] | undefined>(undefined);

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
              onClick={handleRemove}
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
          maxSize={1024 * 1024 * 10}
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
