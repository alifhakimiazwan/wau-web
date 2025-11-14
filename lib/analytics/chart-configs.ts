import type { ChartConfig } from '@/components/ui/chart'

export const lineChartConfig: ChartConfig = {
  value: {
    label: 'Value',
    color: 'hsl(var(--chart-1))',
  },
}

export const trafficSourcesChartConfig: ChartConfig = {
  visits: {
    label: 'Visits',
    color: 'hsl(var(--chart-2))',
  },
}

export const topProductsChartConfig: ChartConfig = {
  link: {
    label: 'Link',
    color: 'hsl(var(--chart-1))',
  },
  lead_magnet: {
    label: 'Lead Magnet',
    color: 'hsl(var(--chart-2))',
  },
  digital_product: {
    label: 'Digital Product',
    color: 'hsl(var(--chart-3))',
  },
}

export const colorPalette = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

export const chartTheme = {
  fontSize: 12,
  fontFamily: 'var(--font-sans)',
  margin: { top: 20, right: 30, left: 0, bottom: 0 },
}

export const commonChartProps = {
  margin: chartTheme.margin,
}
