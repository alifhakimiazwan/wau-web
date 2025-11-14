/**
 * useImageUpload Hook
 *
 * Provides reusable image upload/delete logic with compression and validation
 */

import { useState, useRef } from "react";
import { toast } from "sonner";
import axios from "axios";
import { compressImage } from "@/lib/image/actions";
import { IMAGE_UPLOAD } from "@/components/profile/constants";

interface UseImageUploadParams {
  type: "avatar" | "banner";
  currentImageUrl?: string;
  onUploadComplete: (url: string) => void;
}

export function useImageUpload({
  type,
  currentImageUrl,
  onUploadComplete,
}: UseImageUploadParams) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (!IMAGE_UPLOAD.acceptedFormats.includes(file.type)) {
      toast.error("Please select a JPG, PNG, or WebP image");
      return false;
    }

    if (file.size > IMAGE_UPLOAD.maxSize) {
      toast.error("Image must be less than 10MB");
      return false;
    }

    return true;
  };

  const uploadImage = async (file: File): Promise<boolean> => {
    if (!validateFile(file)) return false;

    setIsUploading(true);

    try {
      const dimensions = IMAGE_UPLOAD.dimensions[type];
      const compressedFile = await compressImage(file, {
        maxWidth: dimensions.width,
        maxHeight: dimensions.height,
        quality: IMAGE_UPLOAD.quality,
      });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(compressedFile);

      // Upload via API route
      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("type", type);
      formData.append("oldImageUrl", currentImageUrl || "");

      const { data: result } = await axios.post("/api/profile", formData);

      if (!result.success) {
        throw new Error(result.error || "Upload failed");
      }

      // Update with server URL
      setPreviewUrl(result.url);
      onUploadComplete(result.url);

      toast.success(
        `${type === "avatar" ? "Profile picture" : "Banner"} uploaded!`
      );

      return true;
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload image");

      // Revert preview on error
      setPreviewUrl(currentImageUrl || null);
      return false;
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await uploadImage(file);
  };

  const handleDrop = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    await uploadImage(file);
  };

  const removeImage = async (): Promise<boolean> => {
    if (!currentImageUrl) return false;

    setIsUploading(true);
    try {
      const { data: result } = await axios.delete("/api/profile", {
        params: { imageUrl: currentImageUrl },
      });

      if (!result.success) {
        throw new Error(result.error || "Delete failed");
      }

      setPreviewUrl(null);
      onUploadComplete("");

      toast.success(
        `${type === "avatar" ? "Profile picture" : "Banner"} removed`
      );

      return true;
    } catch (error) {
      console.error("Remove error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to remove image");
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return {
    isUploading,
    previewUrl,
    fileInputRef,
    handleFileSelect,
    handleDrop,
    removeImage,
    triggerFileSelect,
  };
}
