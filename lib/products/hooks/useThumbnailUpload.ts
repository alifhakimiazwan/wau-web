"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

interface UseThumbnailUploadOptions {
  maxSizeMB?: number;
  acceptedTypes?: string[];
  onUploadComplete?: (url: string) => void;
}

export function useThumbnailUpload({
  maxSizeMB = 5,
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"],
  onUploadComplete,
}: UseThumbnailUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadThumbnail = useCallback(
    async (file: File) => {
      // Validate file type
      if (!acceptedTypes.includes(file.type)) {
        const errorMsg = "Please upload a valid image file (JPEG, PNG, or WebP)";
        setError(errorMsg);
        toast.error(errorMsg);
        return null;
      }

      // Validate file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        const errorMsg = `File size must be less than ${maxSizeMB}MB`;
        setError(errorMsg);
        toast.error(errorMsg);
        return null;
      }

      setIsUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "product_thumbnail");

      try {
        const response = await fetch("/api/products/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Upload failed");
        }

        const url = data.url;
        setThumbnailUrl(url);
        onUploadComplete?.(url);
        toast.success("Thumbnail uploaded successfully");
        return url;
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Failed to upload thumbnail";
        setError(errorMsg);
        toast.error(errorMsg);
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [maxSizeMB, acceptedTypes, onUploadComplete]
  );

  const removeThumbnail = useCallback(() => {
    setThumbnailUrl(null);
    setError(null);
  }, []);

  const setPreviewUrl = useCallback((url: string) => {
    setThumbnailUrl(url);
  }, []);

  return {
    isUploading,
    thumbnailUrl,
    error,
    uploadThumbnail,
    removeThumbnail,
    setPreviewUrl,
  };
}
