'use client'

import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts'
import { EmptyState } from './empty-state'
import { trafficSourcesChartConfig } from '@/lib/analytics/chart-configs'
import type { TrafficSource } from '@/lib/analytics/types'

interface TrafficSourcesChartProps {
  data: TrafficSource[]
}

export const TrafficSourcesChart = memo(function TrafficSourcesChart({ data }: TrafficSourcesChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Where Users Came From</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            message="No traffic sources yet"
            description="Start promoting your storefront with UTM parameters to see where your visitors come from."
          />
        </CardContent>
      </Card>
    )
  }

  const topSources = data.slice(0, 10)

  const chartData = topSources.map((source) => ({
    source: source.source || 'Direct',
    visits: source.visits,
    percentage: source.percentage.toFixed(1),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Where Users Came From</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={trafficSourcesChartConfig} className="h-[300px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              right: 16,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="source"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              hide
            />
            <XAxis dataKey="visits" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="visits"
              layout="vertical"
              fill="var(--color-visits)"
              radius={4}
            >
              <LabelList
                dataKey="source"
                position="insideLeft"
                offset={8}
                className="fill-background"
                fontSize={12}
              />
              <LabelList
                dataKey="visits"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
})
