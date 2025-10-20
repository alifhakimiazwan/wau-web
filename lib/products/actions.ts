"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { leadMagnetSchema, type LeadMagnetSchema } from "./schema";
import { generateSlug, isValidSlug, getFallbackSlug } from "@/lib/utils/slug";
import { ZodError } from "zod";

interface ActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Generate a unique slug for a product within a store
 */
async function generateUniqueSlug(
  name: string,
  storeId: string
): Promise<string> {
  const supabase = await createServerSupabaseClient();

  let slug = generateSlug(name);

  // If slug generation failed, use fallback
  if (!isValidSlug(slug)) {
    slug = getFallbackSlug();
  }

  // Check for duplicates and append counter if needed
  let counter = 0;
  let uniqueSlug = slug;

  while (counter < 100) {
    // Limit attempts
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("store_id", storeId)
      .eq("slug", uniqueSlug)
      .maybeSingle();

    if (!existing) {
      return uniqueSlug;
    }

    counter++;
    uniqueSlug = `${slug}-${counter}`;
  }

  // If we've tried 100 times, use timestamp
  return `${slug}-${Date.now()}`;
}

/**
 * Create a lead magnet product
 */
export async function createLeadMagnetProduct(
  productData: LeadMagnetSchema
): Promise<ActionResponse> {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Validate data
    const validatedData = leadMagnetSchema.parse(productData);

    // Get user's store
    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (storeError || !store) {
      return {
        success: false,
        error: "Store not found. Please complete onboarding first.",
      };
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(validatedData.name, store.id);

    // Build type_config
    const typeConfig = {
      subtitle: validatedData.subtitle,
      buttonText: validatedData.buttonText,
      customerFields: validatedData.customerFields,
      freebieType: validatedData.freebieType,
      freebieLink: validatedData.freebieLink,
      freebieFile: validatedData.freebieFile,
      successMessage: validatedData.successMessage,
    };

    // Insert product
    const { data: product, error: insertError } = await supabase
      .from("products")
      .insert({
        store_id: store.id,
        type: "lead_magnet",
        name: validatedData.name,
        slug,
        thumbnail_url: validatedData.thumbnail || null,
        status: validatedData.status || "draft",
        type_config: typeConfig,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return {
        success: false,
        error: "Failed to create lead magnet. Please try again.",
      };
    }

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error("Create lead magnet error:", error);

    if (error instanceof ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Upload a file for products (thumbnails or freebie files)
 */
export async function uploadProductFile(
  file: File,
  type: "product_thumbnail" | "lead_magnet_file"
): Promise<ActionResponse<{ url: string; path: string; filename: string; size: number }>> {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Verify user has a store
    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (storeError || !store) {
      return {
        success: false,
        error: "Store not found. Please complete onboarding first.",
      };
    }

    // Validate file type and size
    const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024; // 5MB
    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const ALLOWED_FILE_TYPES = [
      "application/pdf",
      "application/zip",
      "application/x-zip-compressed",
    ];

    if (type === "product_thumbnail") {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return {
          success: false,
          error: "Invalid file type. Only JPEG, PNG, and WebP images are allowed",
        };
      }

      if (file.size > MAX_THUMBNAIL_SIZE) {
        return {
          success: false,
          error: "File too large. Maximum size is 5MB",
        };
      }
    } else if (type === "lead_magnet_file") {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return {
          success: false,
          error: "Invalid file type. Only PDF and ZIP files are allowed",
        };
      }

      if (file.size > MAX_FILE_SIZE) {
        return {
          success: false,
          error: "File too large. Maximum size is 50MB",
        };
      }
    }

    // Generate file path
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const folderPath =
      type === "product_thumbnail" ? "products/thumbnails" : "products/files";
    const filePath = `${folderPath}/${user.id}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("user-uploads")
      .upload(filePath, file, {
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return {
        success: false,
        error: "Failed to upload file. Please try again.",
      };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("user-uploads").getPublicUrl(filePath);

    return {
      success: true,
      data: {
        url: publicUrl,
        path: filePath,
        filename: file.name,
        size: file.size,
      },
    };
  } catch (error) {
    console.error("File upload error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during upload. Please try again.",
    };
  }
}
