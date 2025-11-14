import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function getCachedAnalytics<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttl = 300
): Promise<T> {
  const cached = await redis.get<T>(cacheKey)
  if (cached) return cached

  const data = await fetchFn()
  await redis.setex(cacheKey, ttl, data)
  return data
}

export function getAnalyticsCacheKey(storeId: string, dateRange: string, metric?: string): string {
  return metric
    ? `analytics:${storeId}:${dateRange}:${metric}`
    : `analytics:${storeId}:${dateRange}`
}

export async function invalidateAnalyticsCache(storeId: string, pattern?: string): Promise<void> {
  const keys = await redis.keys(`analytics:${storeId}${pattern ? `:${pattern}*` : ':*'}`)
  if (keys.length > 0) {
    await redis.del(...keys)
  }
}
