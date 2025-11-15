"use server"

import { createServerSupabaseClient } from "@/lib/supabase/server"
import { getCachedData, cacheKeys } from "@/lib/cache/redis"
import type { Database } from "@/types/database.types"

// Type definitions from database
type Store = Database["public"]["Tables"]["stores"]["Row"]
type Product = Database["public"]["Tables"]["products"]["Row"]
type SocialLink = Database["public"]["Tables"]["social_links"]["Row"]
type StoreCustomization =
  Database["public"]["Tables"]["store_customization"]["Row"]

export interface PublicStoreData {
  store: Store
  products: Product[]
  socialLinks: SocialLink[]
  customization: StoreCustomization | null
}

/**
 * Internal: Fetch store data from database (no caching)
 * This is wrapped by getPublicStore with Redis caching
 */
async function fetchPublicStoreFromDB(slug: string): Promise<PublicStoreData | null> {
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

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", store.id)
    .order("position", { ascending: true })

  const { data: socialLinks } = await supabase
    .from("social_links")
    .select("*")
    .eq("store_id", store.id)
    .order("position", { ascending: true })

  const { data: customization } = await supabase
    .from("store_customization")
    .select("*")
    .eq("store_id", store.id)
    .maybeSingle()

  return {
    store,
    products: products || [],
    socialLinks: socialLinks || [],
    customization: customization || null,
  }
}

/**
 * Fetch public store data by slug (WITH REDIS CACHING)
 * No auth required - this is for public customer-facing pages
 *
 *
 * @param slug - The store's unique slug
 * @returns PublicStoreData or null if store not found
 */
export async function getPublicStore(
  slug: string
): Promise<PublicStoreData | null> {
  try {
    return await getCachedData(
      cacheKeys.storefront(slug), 
      () => fetchPublicStoreFromDB(slug), 
      600 
    )
  } catch (error) {
    console.error("Get public store error:", error)
    return null
  }
}
