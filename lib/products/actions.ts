"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCachedData, cacheKeys } from "@/lib/cache/redis";
import { invalidateProductCache } from "@/lib/cache/invalidation";
import {
  leadMagnetSchema,
  type LeadMagnetInput,
  linkSchema,
  type LinkSchema,
  digitalProductSchema,
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


async function generateUniqueSlug(
  name: string,
  storeId: string
): Promise<string> {
  const supabase = await createServerSupabaseClient();

  let slug = generateSlug(name);

  if (!isValidSlug(slug)) {
    slug = getFallbackSlug();
  }

  let counter = 0;
  let uniqueSlug = slug;

  while (counter < 100) {
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

  return `${slug}-${Date.now()}`;
}

/**
 * Create a lead magnet product
 */
export async function createLeadMagnetProduct(
  productData: Omit<LeadMagnetInput, 'status'> & { status?: "draft" | "published" }
): Promise<ActionResponse> {
  try {
    const authResult = await getAuthUserWithStore();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }
    const { store } = authResult;

    const validatedData = leadMagnetSchema.parse(productData);
    const supabase = await createServerSupabaseClient();

    const slug = await generateUniqueSlug(validatedData.name, store.id);

    const typeConfig = {
      subtitle: validatedData.subtitle,
      buttonText: validatedData.buttonText,
      customerFields: validatedData.customerFields,
      freebieType: validatedData.freebieType,
      freebieLink: validatedData.freebieLink,
      freebieFile: validatedData.freebieFile,
      successMessage: validatedData.successMessage,
    };

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

    await invalidateProductCache(store.id, store.slug);

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
    const authResult = await getAuthUserWithStore();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }
    const { user } = authResult;

    const supabase = await createServerSupabaseClient();

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
    const authResult = await getAuthUserWithStore();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }
    const { store } = authResult;

    const validatedData = linkSchema.parse(productData);
    const supabase = await createServerSupabaseClient();

    const slugBase = validatedData.name || `${validatedData.style}-link`;
    const slug = await generateUniqueSlug(slugBase, store.id);

    const typeConfig = {
      style: validatedData.style,
      name: validatedData.name,
      subtitle: validatedData.subtitle,
      buttonText: validatedData.buttonText,
      url: validatedData.url,
    };

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

    await invalidateProductCache(store.id, store.slug);

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

    const products = await getCachedData(
      cacheKeys.storeProducts(store.id),
      async () => {
        const supabase = await createServerSupabaseClient();
        const {data, error} = await supabase
          .from("products")
          .select("*")
          .eq("store_id", store.id)
          .order("position", {ascending: true})

        if(error){
          console.error("Fetch products error:", error);
          throw new Error("Failed to fetch products from database")
        }

        return data
      },
      60 // 1 minute TTL
    )

    return {
      success: true,
      data: products
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

    await invalidateProductCache(store.id, store.slug);

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
    const authResult = await getAuthUserWithStore();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }
    const { store } = authResult;

    const validatedData = digitalProductSchema.parse(productData);
    const supabase = await createServerSupabaseClient();

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

    await invalidateProductCache(store.id, store.slug);

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

    // Invalidate caches
    await invalidateProductCache(store.id, store.slug);

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

/**
 * Create a section header to organize products
 */
export async function createSection(title: string): Promise<ActionResponse> {
  try {
    const authResult = await getAuthUserWithStore();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }
    const { store } = authResult;

    if (!title || title.trim().length === 0) {
      return {
        success: false,
        error: "Section title is required",
      };
    }

    if (title.length > 100) {
      return {
        success: false,
        error: "Section title must be less than 100 characters",
      };
    }

    const supabase = await createServerSupabaseClient();

    // Get the next position
    const { data: items } = await supabase
      .from("products")
      .select("position")
      .eq("store_id", store.id)
      .order("position", { ascending: false })
      .limit(1);

    const nextPosition = items && items.length > 0 ? (items[0].position ?? 0) + 1 : 0;

    // Insert section
    const { data: section, error: insertError } = await supabase
      .from("products")
      .insert({
        store_id: store.id,
        item_type: "section",
        name: title.trim(),
        slug: `section-${Date.now()}`, // Sections don't need meaningful slugs
        status: "published", // Sections are always visible
        position: nextPosition,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert section error:", insertError);
      return {
        success: false,
        error: "Failed to create section. Please try again.",
      };
    }

    revalidatePath("/store");
    revalidatePath("/store/products");

    return {
      success: true,
      data: section,
    };
  } catch (error) {
    console.error("Create section error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Update a section title
 */
export async function updateSection(
  sectionId: string,
  title: string
): Promise<ActionResponse<null>> {
  try {
    const authResult = await getAuthUserWithStore();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }
    const { store } = authResult;

    if (!title || title.trim().length === 0) {
      return {
        success: false,
        error: "Section title is required",
      };
    }

    if (title.length > 100) {
      return {
        success: false,
        error: "Section title must be less than 100 characters",
      };
    }

    const supabase = await createServerSupabaseClient();

    const { error: updateError } = await supabase
      .from("products")
      .update({
        name: title.trim(),
      })
      .eq("id", sectionId)
      .eq("store_id", store.id)
      .eq("item_type", "section");

    if (updateError) {
      console.error("Update section error:", updateError);
      return {
        success: false,
        error: "Failed to update section. Please try again.",
      };
    }

    revalidatePath("/store");
    revalidatePath("/store/products");

    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error("Update section error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Delete a section
 */
export async function deleteSection(sectionId: string): Promise<ActionResponse<null>> {
  try {
    const authResult = await getAuthUserWithStore();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }
    const { store } = authResult;

    const supabase = await createServerSupabaseClient();

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", sectionId)
      .eq("store_id", store.id)
      .eq("item_type", "section");

    if (deleteError) {
      console.error("Delete section error:", deleteError);
      return {
        success: false,
        error: "Failed to delete section. Please try again.",
      };
    }

    revalidatePath("/store");
    revalidatePath("/store/products");

    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error("Delete section error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Get a product by ID
 */
export async function getProductById(productId: string): Promise<ActionResponse> {
  try {
    const authResult = await getAuthUserWithStore();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }
    const { store } = authResult;

    const supabase = await createServerSupabaseClient();

    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("store_id", store.id)
      .maybeSingle();

    if (error) {
      console.error("Fetch product error:", error);
      return {
        success: false,
        error: "Failed to fetch product. Please try again.",
      };
    }

    if (!product) {
      return {
        success: false,
        error: "Product not found.",
      };
    }

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error("Get product error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

/**
 * Update a link product
 */
export async function updateLinkProduct(
  productId: string,
  productData: LinkSchema
): Promise<ActionResponse> {
  try {
    const authResult = await getAuthUserWithStore();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }
    const { store } = authResult;

    const validatedData = linkSchema.parse(productData);
    const supabase = await createServerSupabaseClient();

    // Fetch existing product to check if name changed
    const { data: existingProduct } = await supabase
      .from("products")
      .select("name, slug")
      .eq("id", productId)
      .eq("store_id", store.id)
      .maybeSingle();

    if (!existingProduct) {
      return {
        success: false,
        error: "Product not found.",
      };
    }

    // Generate new slug only if name changed
    let slug = existingProduct.slug;
    const newName = validatedData.name || `${validatedData.style} Link`;
    if (newName !== existingProduct.name) {
      slug = await generateUniqueSlug(newName, store.id);
    }

    // Build type_config
    const typeConfig = {
      style: validatedData.style,
      name: validatedData.name,
      subtitle: validatedData.subtitle,
      buttonText: validatedData.buttonText,
      url: validatedData.url,
    };

    // Update product
    const { data: product, error: updateError } = await supabase
      .from("products")
      .update({
        name: newName,
        slug,
        thumbnail_url: validatedData.thumbnail || null,
        status: validatedData.status || "draft",
        type_config: typeConfig,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .eq("store_id", store.id)
      .select()
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return {
        success: false,
        error: "Failed to update link. Please try again.",
      };
    }

    // Invalidate caches
    await invalidateProductCache(store.id, store.slug);

    revalidatePath("/store/products");

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error("Update link error:", error);

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
 * Update a lead magnet product
 */
export async function updateLeadMagnetProduct(
  productId: string,
  productData: Omit<LeadMagnetInput, 'status'> & { status?: "draft" | "published" }
): Promise<ActionResponse> {
  try {
    const authResult = await getAuthUserWithStore();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }
    const { store } = authResult;

    const validatedData = leadMagnetSchema.parse(productData);
    const supabase = await createServerSupabaseClient();

    // Fetch existing product to check if name changed
    const { data: existingProduct } = await supabase
      .from("products")
      .select("name, slug")
      .eq("id", productId)
      .eq("store_id", store.id)
      .maybeSingle();

    if (!existingProduct) {
      return {
        success: false,
        error: "Product not found.",
      };
    }

    let slug = existingProduct.slug;
    if (validatedData.name !== existingProduct.name) {
      slug = await generateUniqueSlug(validatedData.name, store.id);
    }

    const typeConfig = {
      subtitle: validatedData.subtitle,
      buttonText: validatedData.buttonText,
      customerFields: validatedData.customerFields,
      freebieType: validatedData.freebieType,
      freebieLink: validatedData.freebieLink,
      freebieFile: validatedData.freebieFile,
      successMessage: validatedData.successMessage,
    };

    const { data: product, error: updateError } = await supabase
      .from("products")
      .update({
        name: validatedData.name,
        slug,
        thumbnail_url: validatedData.thumbnail || null,
        status: validatedData.status || "draft",
        type_config: typeConfig,
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .eq("store_id", store.id)
      .select()
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return {
        success: false,
        error: "Failed to update lead magnet. Please try again.",
      };
    }

    await invalidateProductCache(store.id, store.slug);

    revalidatePath("/store/products");

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error("Update lead magnet error:", error);

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
 * Update a digital product
 */
export async function updateDigitalProduct(
  productId: string,
  productData: Omit<DigitalProductInput, 'status'> & { status?: "draft" | "published"; reviews?: unknown[] }
): Promise<ActionResponse> {
  try {
    const authResult = await getAuthUserWithStore();
    if (!authResult.success) {
      return { success: false, error: authResult.error };
    }
    const { store } = authResult;

    const validatedData = digitalProductSchema.parse(productData);
    const supabase = await createServerSupabaseClient();

    const { data: existingProduct } = await supabase
      .from("products")
      .select("name, slug")
      .eq("id", productId)
      .eq("store_id", store.id)
      .maybeSingle();

    if (!existingProduct) {
      return {
        success: false,
        error: "Product not found.",
      };
    }

    let slug = existingProduct.slug;
    if (validatedData.cardTitle !== existingProduct.name) {
      slug = await generateUniqueSlug(validatedData.cardTitle, store.id);
    }

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

    const { data: product, error: updateError } = await supabase
      .from("products")
      .update({
        name: validatedData.cardTitle,
        slug,
        thumbnail_url: validatedData.cardThumbnail || null,
        status: validatedData.status || "draft",
        type_config: typeConfig as unknown as Database["public"]["Tables"]["products"]["Insert"]["type_config"],
        updated_at: new Date().toISOString(),
      })
      .eq("id", productId)
      .eq("store_id", store.id)
      .select()
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return {
        success: false,
        error: "Failed to update digital product. Please try again.",
      };
    }

    // Invalidate caches
    await invalidateProductCache(store.id, store.slug);

    revalidatePath("/store/products");

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error("Update digital product error:", error);

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