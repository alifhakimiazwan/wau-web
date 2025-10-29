"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  leadMagnetSchema,
  type LeadMagnetSchema,
  type LeadMagnetInput,
  linkSchema,
  type LinkSchema,
  type LinkInput,
  digitalProductSchema,
  type DigitalProductSchema,
  type DigitalProductInput
} from "./schemas";
import { generateSlug, isValidSlug, getFallbackSlug } from "@/lib/utils/slug";
import { ZodError } from "zod";
import type { Database } from "@/types/database.types";
import { getAuthUserWithStore } from "@/lib/guards/auth-helpers";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface ActionResponse<T = Product> {
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
  productData: Omit<LeadMagnetInput, 'status'> & { status?: "draft" | "published" }
): Promise<ActionResponse> {
  try {
    // Check auth + store
    const authResult = await getAuthUserWithStore();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }
    const { store } = authResult;

    const validatedData = leadMagnetSchema.parse(productData);
    const supabase = await createServerSupabaseClient();

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
        error: error.issues[0].message,
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
    // Check auth + store
    const authResult = await getAuthUserWithStore();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }
    const { user } = authResult;

    const supabase = await createServerSupabaseClient();

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

/**
 * Create a link product
 */
export async function createLinkProduct(
  productData: LinkSchema
): Promise<ActionResponse> {
  try {
    // Check auth + store
    const authResult = await getAuthUserWithStore();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }
    const { store } = authResult;

    const validatedData = linkSchema.parse(productData);
    const supabase = await createServerSupabaseClient();

    // Generate unique slug - use title if available, otherwise use style + timestamp
    const slugBase = validatedData.name || `${validatedData.style}-link`;
    const slug = await generateUniqueSlug(slugBase, store.id);

    // Build type_config
    const typeConfig = {
      style: validatedData.style,
      name: validatedData.name,
      subtitle: validatedData.subtitle,
      buttonText: validatedData.buttonText,
      url: validatedData.url,
    };

    // Insert product
    const { data: product, error: insertError } = await supabase
      .from("products")
      .insert({
        store_id: store.id,
        type: "link",
        name: validatedData.name || `${validatedData.style} Link`,
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
        error: "Failed to create link. Please try again.",
      };
    }

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error("Create link error:", error);

    if (error instanceof ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }

    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}


export async function getStoreProducts(): Promise<ActionResponse <Product[]>>{
  try {
    const authResult = await getAuthUserWithStore();

    if(!authResult.success){
      return { success: false, error: authResult.error}
    }

    const { store } = authResult;

    const supabase = await createServerSupabaseClient();

    const {data: products, error} = await supabase.from("products").select("*").eq("store_id", store.id).order("position", {ascending: true})

    if(error){
      console.error("Fetch products, error", error);
      return {
        success: false,
        error: "Failed to fetch products. Please try again."
      }
    }

    return {
      success: true, data: products
    }


  } catch (error) {
    console.error("Get products error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again."
    }
  }
}

export async function updateProductPositions(productsIds: string[]): Promise<ActionResponse<null>>{
  try {
    const authResult = await getAuthUserWithStore();
    if(!authResult.success){
      return {success: false, error: authResult.error}
    }

    const {store} = authResult;
    const supabase = await createServerSupabaseClient();
    const updates = productsIds.map((id, index) => supabase.from("products").update({position: index}).eq("id", id).eq("store_id", store.id))
    const results = await Promise.all(updates);

    const hasError = results.some((result) => result.error);
    if (hasError){
      console.error("Update positions error:", results);
      return{
        success: false,
        error: "Failed to update product order. Please try again."
      }
    }
    return {
      success: true,
      data: null
    }
  } catch (error) {
    console.error("Update positions error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again."
    }
  }
}

/**
 * Create a digital product
 */
export async function createDigitalProduct(
  productData: Omit<DigitalProductInput, 'status'> & { status?: "draft" | "published"; reviews?: unknown[] }
): Promise<ActionResponse> {
  try {
    // Check auth + store
    const authResult = await getAuthUserWithStore();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }
    const { store } = authResult;

    const validatedData = digitalProductSchema.parse(productData);
    const supabase = await createServerSupabaseClient();

    // Generate unique slug
    const slug = await generateUniqueSlug(validatedData.cardTitle, store.id);

    // Build type_config
    const typeConfig = {
      style: validatedData.style,
      cardTitle: validatedData.cardTitle,
      cardSubtitle: validatedData.cardSubtitle,
      cardButtonText: validatedData.cardButtonText,
      cardThumbnail: validatedData.cardThumbnail,
      description: validatedData.description,
      bottomTitle: validatedData.bottomTitle,
      checkoutButtonText: validatedData.checkoutButtonText,
      checkoutImage: validatedData.checkoutImage,
      price: validatedData.price,
      discountedPrice: validatedData.discountedPrice,
      hasDiscount: validatedData.hasDiscount,
      customerFields: validatedData.customerFields,
      productType: validatedData.productType,
      productLink: validatedData.productLink,
      productFile: validatedData.productFile,
      reviews: productData.reviews || [],
    };

    // Insert product
    const { data: product, error: insertError } = await supabase
      .from("products")
      .insert({
        store_id: store.id,
        type: "digital_product",
        name: validatedData.cardTitle,
        slug,
        thumbnail_url: validatedData.cardThumbnail || null,
        status: validatedData.status || "draft",
        type_config: typeConfig as unknown as Database["public"]["Tables"]["products"]["Insert"]["type_config"],
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return {
        success: false,
        error: "Failed to create digital product. Please try again.",
      };
    }

    // Revalidate products list
    revalidatePath("/store/products");

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error("Create digital product error:", error);

    if (error instanceof ZodError) {
      return {
        success: false,
        error: error.issues[0].message,
      };
    }

    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function deleteProduct(productId: string): Promise<ActionResponse<null>>{
  try {
    const authResult = await getAuthUserWithStore();

    if (!authResult.success){
      return{
        success: false,
        error: authResult.error
      }
    }

    const {store} = authResult;
    const supabase = await createServerSupabaseClient();

    const { error: deleteError} = await supabase.from("products").delete().eq("id", productId).eq("store_id", store.id);

    if(deleteError){
      console.error("Delete error:", deleteError);
      return {
        success: false,
        error: "Failed to delete product. Please try again"
      }
    }
    revalidatePath("/store");
    revalidatePath("/store/products");

    return {
      success: true,
      data: null
    }

  } catch (error) {
    console.error("Delete product error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again."
    }
  }
}