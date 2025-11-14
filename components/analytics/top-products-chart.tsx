'use client'

import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, LabelList } from 'recharts'
import { EmptyState } from './empty-state'
import { topProductsChartConfig, colorPalette } from '@/lib/analytics/chart-configs'
import type { TopProduct } from '@/lib/analytics/types'

interface TopProductsChartProps {
  data: TopProduct[]
}

export const TopProductsChart = memo(function TopProductsChart({ data }: TopProductsChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            message="No product clicks yet"
            description="Create products and promote them to see which ones perform best."
          />
        </CardContent>
      </Card>
    )
  }

  const topProducts = data.slice(0, 10)

  const chartData = topProducts.map((product) => ({
    name: product.productName.length > 20
      ? product.productName.substring(0, 20) + '...'
      : product.productName,
    clicks: product.clicks,
    ctr: product.ctr,
    type: product.productType,
  }))

  const getBarColor = (type: string) => {
    switch (type) {
      case 'link':
        return colorPalette[0]
      case 'lead_magnet':
        return colorPalette[1]
      case 'digital_product':
        return colorPalette[2]
      default:
        return colorPalette[0]
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={topProductsChartConfig} className="h-[300px] w-full">
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
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              hide
            />
            <XAxis dataKey="clicks" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="clicks"
              layout="vertical"
              radius={4}
            >
              <LabelList
                dataKey="name"
                position="insideLeft"
                offset={8}
                className="fill-background"
                fontSize={12}
              />
              <LabelList
                dataKey="clicks"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.type)} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
})
