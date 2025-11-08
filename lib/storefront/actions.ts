"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import type { Database } from "@/types/database.types"

// Type definitions from database
type Store = Database["public"]["Tables"]["stores"]["Row"]
type Product = Database["public"]["Tables"]["products"]["Row"]
type SocialLink = Database["public"]["Tables"]["social_links"]["Row"]
type StoreCustomization =
  Database["public"]["Tables"]["store_customization"]["Row"]

// Return type for public store query
export interface PublicStoreData {
  store: Store
  products: Product[]
  socialLinks: SocialLink[]
  customization: StoreCustomization | null
}

/**
 * Fetch public store data by slug
 * No auth required - this is for public customer-facing pages
 *
 * @param slug - The store's unique slug
 * @returns PublicStoreData or null if store not found
 */
export async function getPublicStore(
  slug: string
): Promise<PublicStoreData | null> {
  try {
    const supabase = await createServerSupabaseClient()

    // Fetch store by slug
    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()

    if (storeError || !store) {
      return null
    }

    // Fetch products (published products + all sections), ordered by position
    const { data: products } = await supabase
      .from("products")
      .select("*")
      .eq("store_id", store.id)
      .order("position", { ascending: true })

    // Fetch social links, ordered by position
    const { data: socialLinks } = await supabase
      .from("social_links")
      .select("*")
      .eq("store_id", store.id)
      .order("position", { ascending: true })

    // Fetch customization
    const { data: customization } = await supabase
      .from("store_customization")
      .select("*")
      .eq("store_id", store.id)
      .maybeSingle()

    // Return data with graceful degradation
    return {
      store,
      products: products || [],
      socialLinks: socialLinks || [],
      customization: customization || null,
    }
  } catch (error) {
    console.error("Get public store error:", error)
    return null
  }
}
