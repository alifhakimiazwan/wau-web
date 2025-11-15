import { redis, cacheKeys } from './redis'
import { revalidatePath, revalidateTag } from 'next/cache'

/**
 * Invalidate ALL caches related to a store
 *
 * Use this when ANYTHING about the store changes:
 * - Store profile (name, bio, avatar)
 * - Products (create, update, delete, reorder)
 * - Theme/design
 * - Social links
 * - Customization
 *
 * What it does:
 * 1. Deletes storefront cache (Redis)
 * 2. Deletes product list cache (Redis)
 * 3. Revalidates Next.js cache
 *
 * @param storeId - Store UUID
 * @param slug - Store slug (for storefront cache key)
 */
export async function invalidateStoreCache(storeId: string, slug: string): Promise<void> {
  console.log(`🗑️  Invalidating all cache for store: ${slug}`)

  try {
    await Promise.all([
      redis.del(cacheKeys.storefront(slug)),      // Public storefront
      redis.del(cacheKeys.storeProducts(storeId)), // Product list

      revalidatePath(`/${slug}`),                  // Public store page
      revalidatePath('/store/products'),           // Dashboard product page
      revalidateTag(`storefront-${slug}`),         // Tagged cache (if used)
    ])

    console.log(`✅ Cache invalidated for store: ${slug}`)
  } catch (error) {
    // Don't throw - log error but continue
    // Worst case: Stale cache for up to 10 min
    console.error(`❌ Cache invalidation failed for ${slug}:`, error)
  }
}

/**
 * Invalidate only product-related caches
 *
 * Use this when ONLY products change (not store profile):
 * - Create product
 * - Update product
 * - Delete product
 * - Reorder products
 *
 *
 * @param storeId - Store UUID
 * @param slug - Store slug
 */
export async function invalidateProductCache(storeId: string, slug: string): Promise<void> {
  console.log(`🗑️  Invalidating product cache for: ${slug}`)

  try {
    await Promise.all([
      redis.del(cacheKeys.storefront(slug)),       // Has product list
      redis.del(cacheKeys.storeProducts(storeId)), // Product list cache
      revalidatePath('/store/products'),            // Dashboard
      revalidatePath(`/${slug}`),                   // Public page
    ])

    console.log(`✅ Product cache invalidated for: ${slug}`)
  } catch (error) {
    console.error(`❌ Product cache invalidation failed for ${slug}:`, error)
  }
}

/**
 * Invalidate single product cache
 *
 * Use this when updating individual product details:
 * - Update product name, price, description
 * - Upload new product image
 *
 * @param productId - Product UUID
 * @param storeId - Store UUID (to also invalidate store caches)
 * @param slug - Store slug
 */
export async function invalidateSingleProduct(
  productId: string,
  storeId: string,
  slug: string
): Promise<void> {
  try {
    await Promise.all([
      redis.del(cacheKeys.product(productId)),     // Single product cache
      redis.del(cacheKeys.storefront(slug)),       // Storefront shows products
      redis.del(cacheKeys.storeProducts(storeId)), // Product list
      revalidatePath(`/${slug}`),
    ])

    console.log(`✅ Product ${productId} cache invalidated`)
  } catch (error) {
    console.error(`❌ Product cache invalidation failed:`, error)
  }
}

/**
 * NOTE: Analytics cache invalidation already exists in lib/cache/redis.ts
 *
 * Analytics rarely needs manual invalidation because:
 * - 5-minute TTL is acceptable for analytics data
 * - Fresh data every 5 minutes is good enough
 * - No need to invalidate on every event
 *
 * If you need to invalidate analytics cache, import from redis.ts:
 * import { invalidateAnalyticsCache } from '@/lib/cache/redis'
 */
