'use client'

import { useState } from 'react'
import { AnalyticsChart } from './analytics-chart'
import { TrafficSourcesChart } from './traffic-sources-chart'
import { TopProductsChart } from './top-products-chart'
import { fetchAnalyticsData } from '@/lib/analytics/actions'
import type {
  TimeSeriesData,
  ComparisonMetrics,
  TrafficSource,
  TopProduct,
} from '@/lib/analytics/types'

interface AnalyticsDashboardProps {
  storeId: string
  initialTimeSeriesData: TimeSeriesData[]
  initialComparisonMetrics: ComparisonMetrics
  initialTrafficSources: TrafficSource[]
  initialTopProducts: TopProduct[]
}

export function AnalyticsDashboard({
  storeId,
  initialTimeSeriesData,
  initialComparisonMetrics,
  initialTrafficSources,
  initialTopProducts,
}: AnalyticsDashboardProps) {
  const [trafficSources, setTrafficSources] = useState(initialTrafficSources)
  const [topProducts, setTopProducts] = useState(initialTopProducts)

  const handleDataUpdate = async (data: {
    trafficSources: TrafficSource[]
    topProducts: TopProduct[]
  }) => {
    setTrafficSources(data.trafficSources)
    setTopProducts(data.topProducts)
  }

  return (
    <>
      <AnalyticsChart
        initialData={initialTimeSeriesData}
        comparisonMetrics={initialComparisonMetrics}
        storeId={storeId}
        onDataUpdate={handleDataUpdate}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrafficSourcesChart data={trafficSources} />
        <TopProductsChart data={topProducts} />
      </div>
    </>
  )
}
