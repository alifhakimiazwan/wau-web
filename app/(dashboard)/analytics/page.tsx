import { requireStore } from "@/lib/guards/onboarding-guard";
import { getDateRange, getPreviousPeriod } from "@/lib/analytics/date-utils";
import {
  getTimeSeriesData,
  getComparisonMetrics,
  getTopProductsByClicks,
  getTrafficSources,
} from "@/lib/analytics/queries";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import { getCachedData, cacheKeys } from "@/lib/cache/redis";

export default async function AnalyticsPage() {
  const { store } = await requireStore();

  const { startDate, endDate } = getDateRange("last14days");
  const { startDate: previousStartDate, endDate: previousEndDate } =
    getPreviousPeriod(startDate, endDate);

  // Use date-based cache key for consistency with client-side updates
  const dateRange = `${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}`;
  const cacheKey = cacheKeys.analytics(store.id, dateRange);
  const [timeSeriesData, comparisonMetrics, topProducts, trafficSourcesResult] =
    await getCachedData(
      cacheKey,
      async () => {
        return await Promise.all([
          getTimeSeriesData(store.id, startDate, endDate, "views"),
          getComparisonMetrics(
            store.id,
            startDate,
            endDate,
            previousStartDate,
            previousEndDate
          ),
          getTopProductsByClicks(store.id, startDate, endDate, 10),
          getTrafficSources(store.id, {
            from: startDate.toISOString(),
            to: endDate.toISOString(),
          }),
        ]);
      },
      300
    );

  const trafficSources =
    trafficSourcesResult.success && trafficSourcesResult.data
      ? trafficSourcesResult.data.map((source) => ({
          source: source.source,
          visits: source.views,
          percentage: 0,
          utmSource: source.source,
          utmMedium: source.medium,
        }))
      : [];

  const totalVisits = trafficSources.reduce(
    (sum, source) => sum + source.visits,
    0
  );
  trafficSources.forEach((source) => {
    source.percentage =
      totalVisits > 0 ? (source.visits / totalVisits) * 100 : 0;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <AnalyticsDashboard
        storeId={store.id}
        initialTimeSeriesData={timeSeriesData}
        initialComparisonMetrics={comparisonMetrics}
        initialTrafficSources={trafficSources}
        initialTopProducts={topProducts}
      />
    </div>
  );
}
