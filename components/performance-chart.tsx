"use client";

import { Area, AreaChart } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ChartDataPoint {
  date: string;
  value: number;
}

const chartConfig = {
  portfolio: {
    label: "Portfolio Value",
    color: "#8d745d",
  },
} satisfies ChartConfig;

interface V2PerformanceChartProps {
  data?: ChartDataPoint[];
  height?: number;
}

export function V2PerformanceChart({ data, height = 250 }: V2PerformanceChartProps) {
  const isLoading = !data;
  const hasNoData = data && data.length === 0;

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }

  const chartData = data
    ? data.map((dataPoint) => ({
        date: formatDate(dataPoint.date),
        portfolio: dataPoint.value,
      }))
    : [];

  if (isLoading) {
    return (
      <div className="w-full flex flex-col space-y-2" style={{ height: `${height}px` }}>
        <Skeleton className="w-full" style={{ height: `${height}px` }} />
      </div>
    );
  }

  if (hasNoData || chartData.length === 0) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height: `${height}px` }}>
        <p className="text-zinc-600 text-sm">No performance data available</p>
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="w-full" style={{ height: `${height}px` }}>
      <AreaChart
        accessibilityLayer
        data={chartData}
        margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
      >
        <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
        <defs>
          <linearGradient id="fillPortfolioV2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <Area
          dataKey="portfolio"
          type="natural"
          fill="url(#fillPortfolioV2)"
          fillOpacity={0.4}
          stroke="#22c55e"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
