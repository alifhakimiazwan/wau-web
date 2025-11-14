// Analytics TypeScript Types

export interface TimeSeriesData {
  date: string // ISO date string (YYYY-MM-DD)
  value: number
}

export interface ComparisonMetric {
  current: number
  previous: number
  percentageChange: number
  isIncrease: boolean
}

export interface ComparisonMetrics {
  visits: ComparisonMetric
  revenue: ComparisonMetric
  leads: ComparisonMetric
  conversionRate: ComparisonMetric
}

export interface TrafficSource {
  source: string // e.g., "facebook", "google", "direct"
  visits: number
  percentage: number
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

export interface TopProduct {
  productId: string
  productName: string
  productType: 'link' | 'lead_magnet' | 'digital_product'
  clicks: number
  views: number
  ctr: number // Click-through rate as percentage
}

export type MetricType = 'views' | 'revenue' | 'leads'

export type DateRangePreset = 'last7days' | 'last14days' | 'custom'

export interface DateRange {
  startDate: Date
  endDate: Date
}

export interface AnalyticsData {
  timeSeriesData: TimeSeriesData[]
  comparisonMetrics: ComparisonMetrics
  topProducts: TopProduct[]
  trafficSources: TrafficSource[]
}
