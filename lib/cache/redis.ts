import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})
const locks = new Map<string, Promise<any>>()
interface CacheStats {
  hits: number          
  misses: number        
  errors: number     
  hitRate: string      
}

const stats: CacheStats = {
  hits: 0,
  misses: 0,
  errors: 0,
  hitRate: '0%'
}

export function getCacheStats(): CacheStats {
  const total = stats.hits + stats.misses
  const hitRate = total > 0 ? ((stats.hits / total) * 100).toFixed(1) : '0'

  return {
    ...stats,
    hitRate: `${hitRate}%`
  }
}
export function resetCacheStats(): void {
  stats.hits = 0
  stats.misses = 0
  stats.errors = 0
  stats.hitRate = '0%'
}

/**
 * Get cached data with full protection (stampede, errors, metrics)
 *
 * This is a GENERIC caching function - use it for ANY data:
 * - Analytics data
 * - Storefront data
 * - Product lists
 * - User profiles
 * - Anything that benefits from caching!
 *
 * @param cacheKey - Unique cache identifier (use cacheKeys helper below)
 * @param fetchFn - Function to fetch fresh data from database if cache misses
 * @param ttl - Time to live in seconds (default 300 = 5 minutes)
 *
 * Features:
 * ✅ Cache stampede protection (only 1 DB query for 100 concurrent requests)
 * ✅ Error handling (falls back to DB if Redis fails)
 * ✅ Metrics tracking (hit rate, errors)
 *
 * How it works:
 * 1. Check Redis cache → If found, return immediately
 * 2. Check if another request is already fetching → If yes, wait for it
 * 3. If no one is fetching → Fetch yourself and save Promise in locks
 * 4. Clean up lock when done
 */
export async function getCachedData<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttl = 300
): Promise<T> {
  // STEP 1: Try cache first (with error handling)
  try {
    const cached = await redis.get<T>(cacheKey)
    // Redis can return null, undefined, or the actual value
    if (cached !== null && cached !== undefined) {
      stats.hits++  // 📊 Track cache hit
      console.log(`✅ Cache HIT: ${cacheKey} [Hit rate: ${getCacheStats().hitRate}]`)
      return cached
    }
  } catch (error) {
    // Redis failed (network issue, Upstash down, etc.)
    stats.errors++  // 📊 Track error
    // Log the error but DON'T crash - continue to database
    console.error(`❌ Redis GET error for ${cacheKey}:`, error)
    // Fall through to database fetch below
  }

  stats.misses++  // 📊 Track cache miss
  console.log(`❌ Cache MISS: ${cacheKey} [Hit rate: ${getCacheStats().hitRate}]`)

  // STEP 2: Check if someone else is already fetching this data
  const existingLock = locks.get(cacheKey)

  if (existingLock) {
    // Another request is already fetching - wait for their result!
    console.log(`⏳ Waiting for existing fetch: ${cacheKey}`)
    return existingLock as Promise<T>
  }

  // STEP 3: No one is fetching - we'll do it!
  console.log(`🔒 Acquiring lock: ${cacheKey}`)

  // Create the fetch promise
  const fetchPromise = fetchFn()
    .then(async (data) => {
      // Successfully fetched data from database
      // Now try to cache it (but don't fail if caching fails)
      try {
        await redis.setex(cacheKey, ttl, data)
        console.log(`💾 Cached: ${cacheKey} (TTL: ${ttl}s)`)
      } catch (cacheError) {
        // Caching failed, but we have the data
        // Log error but DON'T throw - return data anyway
        console.error(`❌ Redis SET error for ${cacheKey}:`, cacheError)
      }

      // STEP 4: Release the lock (very important!)
      locks.delete(cacheKey)
      console.log(`🔓 Released lock: ${cacheKey}`)

      return data
    })
    .catch((error) => {
      // Database fetch failed - release lock and throw
      // (This is a real error - we have no data to return)
      locks.delete(cacheKey)
      console.log(`🔓 Released lock (error): ${cacheKey}`)
      throw error
    })

  // Save promise in locks map so other requests can wait for it
  locks.set(cacheKey, fetchPromise)

  return fetchPromise
}

/**
 * Consistent cache key naming
 *
 * Why use this?
 * - Prevents typos (cacheKeys.storefront vs "storefrontt")
 * - Easy to find all cache keys in one place
 * - Consistent naming pattern across app
 *
 * Pattern: {namespace}:{entity}:{id}:{attribute?}
 *
 * Examples:
 * - storefront:my-shop
 * - products:store-uuid-123
 * - analytics:store-uuid:last7days
 * - product:product-uuid
 */
export const cacheKeys = {
  // Storefront (public pages)
  storefront: (slug: string) => `storefront:${slug}`,

  storeProducts: (storeId: string) => `products:${storeId}`,
  product: (productId: string) => `product:${productId}`,

  analytics: (storeId: string, range: string, metric?: string) =>
    metric
      ? `analytics:${storeId}:${range}:${metric}`
      : `analytics:${storeId}:${range}`,

  // User/Store data (for future use)
  userStore: (userId: string) => `user:${userId}:store`,
  storeProfile: (storeId: string) => `store:${storeId}:profile`,
}


export async function invalidateAnalyticsCache(storeId: string, pattern?: string): Promise<void> {
  const searchPattern = `analytics:${storeId}${pattern ? `:${pattern}*` : ':*'}`
  let cursor = 0
  let totalDeleted = 0

  do {
   
    const result = await redis.scan(cursor, {
      match: searchPattern,
      count: 100 
    })

    cursor = typeof result[0] === 'string' ? parseInt(result[0]) : result[0]
    const keys = result[1]

    if (keys.length > 0) {
      await redis.del(...keys)
      totalDeleted += keys.length
    }
  } while (cursor !== 0) 

  if (totalDeleted > 0) {
    console.log(`🗑️  Invalidated ${totalDeleted} analytics cache keys`)
  }
}
