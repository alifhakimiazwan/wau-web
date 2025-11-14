"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { toISODateString } from "./date-utils";
import { calculatePercentageChange } from "./formatters";
import type { TimeSeriesData, ComparisonMetrics, ComparisonMetric, TopProduct as NewTopProduct, MetricType } from "./types";

interface DateRange {
  from: string; // ISO date string
  to: string; // ISO date string
}

interface PurchaseEventData {
  revenue?: number;
  amount?: number;
  currency?: string;
  customerEmail?: string;
  customerName?: string;
}

interface StoreAnalytics {
  totalPageViews: number;
  totalClicks: number;
  uniqueVisitors: number;
  totalLeads: number;
  totalPurchases: number;
  totalRevenue: number;
  topTrafficSource?: string;
  conversionRate: number;
}

interface ProductAnalytics {
  productId: string;
  productName?: string;
  totalViews: number;
  totalClicks: number;
  clickThroughRate: number;
  totalLeads: number;
  totalPurchases: number;
  totalRevenue: number;
  conversionRate: number;
  topTrafficSource?: string;
}

interface TrafficSource {
  source: string;
  medium?: string;
  views: number;
  clicks: number;
  leads: number;
  purchases: number;
  revenue: number;
}

interface TopProduct {
  productId: string;
  productName?: string;
  clicks: number;
  conversions: number;
  revenue: number;
}

interface AnalyticsResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Get comprehensive analytics for a store
 * Requires user to own the store (enforced by RLS)
 */
export async function getStoreAnalytics(
  storeId: string,
  dateRange?: DateRange
): Promise<AnalyticsResponse<StoreAnalytics>> {
  try {
    const supabase = await createServerSupabaseClient();

    // Build date filter
    let query = supabase
      .from("events")
      .select("*")
      .eq("store_id", storeId);

    if (dateRange) {
      query = query
        .gte("created_at", dateRange.from)
        .lte("created_at", dateRange.to);
    }

    const { data: events, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    if (!events) {
      return { success: false, error: "No analytics data found" };
    }

    // Calculate metrics
    const totalPageViews = events.filter(
      (e) => e.event_type === "page_view"
    ).length;
    const totalClicks = events.filter(
      (e) => e.event_type === "product_click"
    ).length;
    const totalLeads = events.filter(
      (e) => e.event_type === "lead_submit"
    ).length;
    const totalPurchases = events.filter(
      (e) => e.event_type === "purchase"
    ).length;

    // Unique visitors (count unique session IDs)
    const uniqueVisitors = new Set(
      events.map((e) => e.session_id).filter(Boolean)
    ).size;

    // Total revenue (sum from purchase events)
    const totalRevenue = events
      .filter((e) => e.event_type === "purchase")
      .reduce((sum, e) => {
        const revenue = (e.event_data as PurchaseEventData | null)?.revenue || 0;
        return sum + revenue;
      }, 0);

    // Top traffic source
    const sourceCount = events
      .filter((e) => e.utm_source)
      .reduce((acc, e) => {
        const source = e.utm_source!;
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topTrafficSource = Object.keys(sourceCount).length
      ? Object.entries(sourceCount).sort(([, a], [, b]) => b - a)[0][0]
      : undefined;

    // Conversion rate (purchases / page views)
    const conversionRate =
      totalPageViews > 0 ? (totalPurchases / totalPageViews) * 100 : 0;

    return {
      success: true,
      data: {
        totalPageViews,
        totalClicks,
        uniqueVisitors,
        totalLeads,
        totalPurchases,
        totalRevenue,
        topTrafficSource,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
      },
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch store analytics",
    };
  }
}

/**
 * Get analytics for a specific product
 * Requires user to own the store (enforced by RLS)
 */
export async function getProductAnalytics(
  productId: string,
  storeId: string,
  dateRange?: DateRange
): Promise<AnalyticsResponse<ProductAnalytics>> {
  try {
    const supabase = await createServerSupabaseClient();

    // Get product details
    const { data: product } = await supabase
      .from("products")
      .select("name")
      .eq("id", productId)
      .single();

    // Build date filter for product events
    let query = supabase
      .from("events")
      .select("*")
      .eq("store_id", storeId)
      .eq("product_id", productId);

    if (dateRange) {
      query = query
        .gte("created_at", dateRange.from)
        .lte("created_at", dateRange.to);
    }

    const { data: events, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    if (!events) {
      return { success: false, error: "No product analytics data found" };
    }

    // Get page views for this store (to calculate CTR)
    let pageViewQuery = supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("store_id", storeId)
      .eq("event_type", "page_view");

    if (dateRange) {
      pageViewQuery = pageViewQuery
        .gte("created_at", dateRange.from)
        .lte("created_at", dateRange.to);
    }

    const { count: totalViews } = await pageViewQuery;

    const totalClicks = events.filter(
      (e) => e.event_type === "product_click"
    ).length;
    const totalLeads = events.filter(
      (e) => e.event_type === "lead_submit"
    ).length;
    const totalPurchases = events.filter(
      (e) => e.event_type === "purchase"
    ).length;

    const totalRevenue = events
      .filter((e) => e.event_type === "purchase")
      .reduce((sum, e) => {
        const revenue = (e.event_data as PurchaseEventData | null)?.revenue || 0;
        return sum + revenue;
      }, 0);

    // Click-through rate (clicks / page views)
    const clickThroughRate =
      totalViews && totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

    // Conversion rate (purchases / clicks)
    const conversionRate =
      totalClicks > 0 ? (totalPurchases / totalClicks) * 100 : 0;

    // Top traffic source for this product
    const sourceCount = events
      .filter((e) => e.utm_source)
      .reduce((acc, e) => {
        const source = e.utm_source!;
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topTrafficSource = Object.keys(sourceCount).length
      ? Object.entries(sourceCount).sort(([, a], [, b]) => b - a)[0][0]
      : undefined;

    return {
      success: true,
      data: {
        productId,
        productName: product?.name,
        totalViews: totalViews || 0,
        totalClicks,
        clickThroughRate: parseFloat(clickThroughRate.toFixed(2)),
        totalLeads,
        totalPurchases,
        totalRevenue,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        topTrafficSource,
      },
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch product analytics",
    };
  }
}

/**
 * Get traffic sources breakdown (UTM parameters)
 * Requires user to own the store (enforced by RLS)
 */
export async function getTrafficSources(
  storeId: string,
  dateRange?: DateRange,
  limit: number = 100
): Promise<AnalyticsResponse<TrafficSource[]>> {
  try {
    const safeLimit = Math.min(limit, 100);
    const supabase = await createServerSupabaseClient();

    // Build date filter
    let query = supabase
      .from("events")
      .select("*")
      .eq("store_id", storeId)
      .not("utm_source", "is", null);

    if (dateRange) {
      query = query
        .gte("created_at", dateRange.from)
        .lte("created_at", dateRange.to);
    }

    const { data: events, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    if (!events || events.length === 0) {
      return { success: true, data: [] };
    }

    // Group by source + medium
    const sourceMap = new Map<string, TrafficSource>();

    events.forEach((event) => {
      const source = event.utm_source!;
      const medium = event.utm_medium || undefined;
      const key = medium ? `${source}:${medium}` : source;

      if (!sourceMap.has(key)) {
        sourceMap.set(key, {
          source,
          medium,
          views: 0,
          clicks: 0,
          leads: 0,
          purchases: 0,
          revenue: 0,
        });
      }

      const sourceData = sourceMap.get(key)!;

      if (event.event_type === "page_view") sourceData.views++;
      if (event.event_type === "product_click") sourceData.clicks++;
      if (event.event_type === "lead_submit") sourceData.leads++;
      if (event.event_type === "purchase") {
        sourceData.purchases++;
        sourceData.revenue += (event.event_data as PurchaseEventData | null)?.revenue || 0;
      }
    });

    // Convert to array and sort by clicks descending
    const trafficSources = Array.from(sourceMap.values())
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, safeLimit);

    return {
      success: true,
      data: trafficSources,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch traffic sources",
    };
  }
}

/**
 * Get top performing products ranked by clicks, conversions, or revenue
 * Requires user to own the store (enforced by RLS)
 */
export async function getTopProducts(
  storeId: string,
  dateRange?: DateRange,
  limit: number = 10
): Promise<AnalyticsResponse<TopProduct[]>> {
  try {
    const supabase = await createServerSupabaseClient();

    // Build date filter for events
    let query = supabase
      .from("events")
      .select("*")
      .eq("store_id", storeId)
      .not("product_id", "is", null);

    if (dateRange) {
      query = query
        .gte("created_at", dateRange.from)
        .lte("created_at", dateRange.to);
    }

    const { data: events, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    if (!events || events.length === 0) {
      return { success: true, data: [] };
    }

    // Group by product
    const productMap = new Map<
      string,
      { clicks: number; conversions: number; revenue: number }
    >();

    events.forEach((event) => {
      const productId = event.product_id!;

      if (!productMap.has(productId)) {
        productMap.set(productId, {
          clicks: 0,
          conversions: 0,
          revenue: 0,
        });
      }

      const productData = productMap.get(productId)!;

      if (event.event_type === "product_click") productData.clicks++;
      if (event.event_type === "purchase") {
        productData.conversions++;
        productData.revenue += (event.event_data as PurchaseEventData | null)?.revenue || 0;
      }
    });

    // Get product names
    const productIds = Array.from(productMap.keys());
    const { data: products } = await supabase
      .from("products")
      .select("id, name")
      .in("id", productIds);

    const productNameMap = new Map(
      products?.map((p) => [p.id, p.name]) || []
    );

    // Convert to array and sort by clicks (default ranking)
    const topProducts = Array.from(productMap.entries())
      .map(([productId, data]) => ({
        productId,
        productName: productNameMap.get(productId),
        clicks: data.clicks,
        conversions: data.conversions,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, limit);

    return {
      success: true,
      data: topProducts,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch top products",
    };
  }
}

export async function getTimeSeriesData(
  storeId: string,
  startDate: Date,
  endDate: Date,
  metric: MetricType
): Promise<TimeSeriesData[]> {
  try {
    const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 90) {
      throw new Error('Date range cannot exceed 90 days');
    }

    const supabase = await createServerSupabaseClient();

    let query = supabase
      .from("events")
      .select("created_at, event_type, event_data")
      .eq("store_id", storeId)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    if (metric === 'views') {
      query = query.eq("event_type", "page_view");
    } else if (metric === 'leads') {
      query = query.eq("event_type", "lead_submit");
    } else if (metric === 'revenue') {
      query = query.eq("event_type", "purchase");
    }

    const { data: events, error } = await query;

    if (error || !events) {
      return [];
    }

    const dailyData = new Map<string, number>();

    events.forEach((event) => {
      const date = toISODateString(new Date(event.created_at));

      if (metric === 'revenue') {
        const revenue = (event.event_data as PurchaseEventData | null)?.revenue || 0;
        dailyData.set(date, (dailyData.get(date) || 0) + revenue);
      } else {
        dailyData.set(date, (dailyData.get(date) || 0) + 1);
      }
    });

    return Array.from(dailyData.entries())
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('getTimeSeriesData error:', error);
    return [];
  }
}

export async function getComparisonMetrics(
  storeId: string,
  currentStartDate: Date,
  currentEndDate: Date,
  previousStartDate: Date,
  previousEndDate: Date
): Promise<ComparisonMetrics> {
  try {
    const supabase = await createServerSupabaseClient();

    const [currentEvents, previousEvents] = await Promise.all([
      supabase
        .from("events")
        .select("*")
        .eq("store_id", storeId)
        .gte("created_at", currentStartDate.toISOString())
        .lte("created_at", currentEndDate.toISOString()),
      supabase
        .from("events")
        .select("*")
        .eq("store_id", storeId)
        .gte("created_at", previousStartDate.toISOString())
        .lte("created_at", previousEndDate.toISOString()),
    ]);

    const currentData = currentEvents.data || [];
    const previousData = previousEvents.data || [];

    const currentVisits = currentData.filter((e) => e.event_type === "page_view").length;
    const previousVisits = previousData.filter((e) => e.event_type === "page_view").length;

    const currentLeads = currentData.filter((e) => e.event_type === "lead_submit").length;
    const previousLeads = previousData.filter((e) => e.event_type === "lead_submit").length;

    const currentRevenue = currentData
      .filter((e) => e.event_type === "purchase")
      .reduce((sum, e) => sum + ((e.event_data as PurchaseEventData | null)?.revenue || 0), 0);
    const previousRevenue = previousData
      .filter((e) => e.event_type === "purchase")
      .reduce((sum, e) => sum + ((e.event_data as PurchaseEventData | null)?.revenue || 0), 0);

    const currentPurchases = currentData.filter((e) => e.event_type === "purchase").length;
    const previousPurchases = previousData.filter((e) => e.event_type === "purchase").length;

    const currentConversionRate = currentVisits > 0
      ? ((currentLeads + currentPurchases) / currentVisits) * 100
      : 0;
    const previousConversionRate = previousVisits > 0
      ? ((previousLeads + previousPurchases) / previousVisits) * 100
      : 0;

    return {
      visits: {
        current: currentVisits,
        previous: previousVisits,
        percentageChange: calculatePercentageChange(currentVisits, previousVisits),
        isIncrease: currentVisits >= previousVisits,
      },
      revenue: {
        current: currentRevenue,
        previous: previousRevenue,
        percentageChange: calculatePercentageChange(currentRevenue, previousRevenue),
        isIncrease: currentRevenue >= previousRevenue,
      },
      leads: {
        current: currentLeads,
        previous: previousLeads,
        percentageChange: calculatePercentageChange(currentLeads, previousLeads),
        isIncrease: currentLeads >= previousLeads,
      },
      conversionRate: {
        current: currentConversionRate,
        previous: previousConversionRate,
        percentageChange: calculatePercentageChange(currentConversionRate, previousConversionRate),
        isIncrease: currentConversionRate >= previousConversionRate,
      },
    };
  } catch (error) {
    console.error('getComparisonMetrics error:', error);
    return {
      visits: { current: 0, previous: 0, percentageChange: 0, isIncrease: false },
      revenue: { current: 0, previous: 0, percentageChange: 0, isIncrease: false },
      leads: { current: 0, previous: 0, percentageChange: 0, isIncrease: false },
      conversionRate: { current: 0, previous: 0, percentageChange: 0, isIncrease: false },
    };
  }
}

export async function getTopProductsByClicks(
  storeId: string,
  startDate: Date,
  endDate: Date,
  limit: number = 10
): Promise<NewTopProduct[]> {
  try {
    const safeLimit = Math.min(limit, 50);
    const supabase = await createServerSupabaseClient();

    const { data: events, error } = await supabase
      .from("events")
      .select("*")
      .eq("store_id", storeId)
      .not("product_id", "is", null)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    if (error || !events || events.length === 0) {
      return [];
    }

    const productMap = new Map<string, { clicks: number; views: number }>();

    events.forEach((event) => {
      const productId = event.product_id!;

      if (!productMap.has(productId)) {
        productMap.set(productId, { clicks: 0, views: 0 });
      }

      const productData = productMap.get(productId)!;

      if (event.event_type === "product_click") productData.clicks++;
      if (event.event_type === "lead_submit") productData.clicks++;
      if (event.event_type === "page_view") productData.views++;
    });

    const productIds = Array.from(productMap.keys());
    const { data: products } = await supabase
      .from("products")
      .select("id, name, type")
      .in("id", productIds);

    const productInfoMap = new Map(
      products?.map((p) => [p.id, { name: p.name, type: p.type }]) || []
    );

    const topProducts = Array.from(productMap.entries())
      .map(([productId, data]) => {
        const info = productInfoMap.get(productId);
        const ctr = data.views > 0 ? (data.clicks / data.views) * 100 : 0;

        return {
          productId,
          productName: info?.name || 'Unknown Product',
          productType: info?.type as 'link' | 'lead_magnet' | 'digital_product',
          clicks: data.clicks,
          views: data.views,
          ctr: parseFloat(ctr.toFixed(2)),
        };
      })
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, safeLimit);

    return topProducts;
  } catch (error) {
    console.error('getTopProductsByClicks error:', error);
    return [];
  }
}
