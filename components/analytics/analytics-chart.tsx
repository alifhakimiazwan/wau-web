"use client";

import { useState, useMemo, useCallback, memo, useTransition } from "react";
import { fetchAnalyticsData } from "@/lib/analytics/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, CartesianGrid } from "recharts";
import { DateRangeSelector } from "./date-range-selector";
import { EmptyState } from "./empty-state";
import { lineChartConfig } from "@/lib/analytics/chart-configs";
import { formatCurrency, formatNumber } from "@/lib/analytics/formatters";
import {
  formatDateForChart,
  calculateDaysDifference,
} from "@/lib/analytics/date-utils";
import {
  Eye,
  DollarSign,
  UserPlus,
  ArrowUp,
  ArrowDown,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  TimeSeriesData,
  ComparisonMetrics,
  MetricType,
  TrafficSource,
  TopProduct,
} from "@/lib/analytics/types";

interface AnalyticsChartProps {
  initialData: TimeSeriesData[];
  comparisonMetrics: ComparisonMetrics;
  storeId: string;
  onDataUpdate?: (data: {
    trafficSources: TrafficSource[];
    topProducts: TopProduct[];
  }) => void;
}

interface ClickableMetricCardProps {
  label: string;
  value: string | number;
  percentageChange?: number;
  isIncrease?: boolean;
  icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
}

const ClickableMetricCard = memo(function ClickableMetricCard({
  label,
  value,
  percentageChange,
  isIncrease,
  icon: Icon,
  isActive,
  onClick,
}: ClickableMetricCardProps) {
  const hasChange = percentageChange !== undefined && percentageChange !== 0;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md gap-2",
        isActive && "bg-primary text-primary-foreground"
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 ">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon
          className={cn(
            "h-4 w-4",
            isActive ? "text-primary-foreground" : "text-muted-foreground"
          )}
        />
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">{value}</div>
        {hasChange && (
          <div
            className={cn(
              "inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-md text-xs font-medium",
              isActive
                ? "bg-primary-foreground/10 text-primary-foreground"
                : isIncrease
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            )}
          >
            {isIncrease ? (
              <>
                <ArrowUp className="h-3 w-3" />
                <span>+{Math.abs(percentageChange).toFixed(1)}%</span>
              </>
            ) : (
              <>
                <ArrowDown className="h-3 w-3" />
                <span>{Math.abs(percentageChange).toFixed(1)}%</span>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

export function AnalyticsChart({
  initialData,
  comparisonMetrics: initialComparisonMetrics,
  storeId,
  onDataUpdate,
}: AnalyticsChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("views");
  const [timeSeriesData, setTimeSeriesData] =
    useState<TimeSeriesData[]>(initialData);
  const [comparisonMetrics, setComparisonMetrics] = useState<ComparisonMetrics>(initialComparisonMetrics);
  const [isPending, startTransition] = useTransition();

  // Track current date range for metric changes
  const [currentDateRange, setCurrentDateRange] = useState(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 13); // Default 14 days
    return { startDate, endDate };
  });

  // Handle metric changes (e.g., switching between views, revenue, leads)
  const handleMetricChange = useCallback(
    (metric: MetricType) => {
      if (metric === selectedMetric) return; // Don't refetch if already selected

      setSelectedMetric(metric);

      startTransition(async () => {
        try {
          const data = await fetchAnalyticsData(
            storeId,
            currentDateRange.startDate,
            currentDateRange.endDate,
            metric
          );

          setTimeSeriesData(data.timeSeriesData);
          setComparisonMetrics(data.comparisonMetrics);

          if (onDataUpdate) {
            onDataUpdate({
              trafficSources: data.trafficSources,
              topProducts: data.topProducts,
            });
          }
        } catch (error) {
          console.error("Error fetching analytics data for metric:", error);
        }
      });
    },
    [selectedMetric, currentDateRange, storeId, onDataUpdate]
  );

  // Handle date range changes
  const handleDateRangeChange = useCallback(
    (startDate: Date, endDate: Date) => {
      setCurrentDateRange({ startDate, endDate });

      startTransition(async () => {
        try {
          const data = await fetchAnalyticsData(
            storeId,
            startDate,
            endDate,
            selectedMetric
          );

          setTimeSeriesData(data.timeSeriesData);
          setComparisonMetrics(data.comparisonMetrics);

          if (onDataUpdate) {
            onDataUpdate({
              trafficSources: data.trafficSources,
              topProducts: data.topProducts,
            });
          }
        } catch (error) {
          console.error("Error fetching analytics data:", error);
        }
      });
    },
    [storeId, selectedMetric, onDataUpdate]
  );

  const formatTooltipValue = (value: number) => {
    if (selectedMetric === "revenue") {
      return formatCurrency(value);
    }
    return formatNumber(value);
  };

  const rangeDays = useMemo(() =>
    timeSeriesData.length > 0
      ? calculateDaysDifference(
          new Date(timeSeriesData[0].date),
          new Date(timeSeriesData[timeSeriesData.length - 1].date)
        )
      : 14,
    [timeSeriesData]
  );

  const chartData = useMemo(() =>
    timeSeriesData.map((item) => ({
      date: formatDateForChart(new Date(item.date), rangeDays),
      value: item.value,
    })),
    [timeSeriesData, rangeDays]
  );

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case "views":
        return "Store Visits";
      case "revenue":
        return "Total Revenue";
      case "leads":
        return "Leads";
      default:
        return "Metric";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center gap-4">
        {isPending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading...
          </div>
        )}

        <DateRangeSelector
          onRangeChange={handleDateRangeChange}
          defaultRange="last14days"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ClickableMetricCard
          label="Store Visits"
          value={formatNumber(comparisonMetrics.visits.current)}
          percentageChange={comparisonMetrics.visits.percentageChange}
          isIncrease={comparisonMetrics.visits.isIncrease}
          icon={Eye}
          isActive={selectedMetric === "views"}
          onClick={() => handleMetricChange("views")}
        />
        <ClickableMetricCard
          label="Total Revenue"
          value={formatCurrency(comparisonMetrics.revenue.current)}
          percentageChange={comparisonMetrics.revenue.percentageChange}
          isIncrease={comparisonMetrics.revenue.isIncrease}
          icon={DollarSign}
          isActive={selectedMetric === "revenue"}
          onClick={() => handleMetricChange("revenue")}
        />
        <ClickableMetricCard
          label="Leads"
          value={formatNumber(comparisonMetrics.leads.current)}
          percentageChange={comparisonMetrics.leads.percentageChange}
          isIncrease={comparisonMetrics.leads.isIncrease}
          icon={UserPlus}
          isActive={selectedMetric === "leads"}
          onClick={() => handleMetricChange("leads")}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{getMetricLabel()} Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <EmptyState
              message="No data for this period"
              description="There's no analytics data available for the selected date range."
            />
          ) : (
            <ChartContainer
              config={lineChartConfig}
              className="h-[300px] w-full"
            >
              <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <defs>
                  <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-value)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-value)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value) => formatTooltipValue(value as number)}
                    />
                  }
                />
                <Area
                  dataKey="value"
                  type="natural"
                  fill="url(#fillValue)"
                  fillOpacity={0.4}
                  stroke="var(--color-value)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
