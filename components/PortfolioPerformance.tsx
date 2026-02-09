"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Funnel, CaretDown } from "@phosphor-icons/react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "An area chart with gradient fill";

interface ChartDataPoint {
  date: string;
  value: number;
}

const chartConfig = {
  portfolio: {
    label: "Portfolio",
    color: "#8d745d",
  },
} satisfies ChartConfig;

export function PorfolioPerformanceChart({
  data,
}: {
  data?: ChartDataPoint[];
}) {
  const isLoading = !data;
  const hasNoData = data && data.length === 0;

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "numeric",
    }).format(date);
  }

  const chartData = data
    ? data.map((dataPoint) => ({
        date: formatDate(dataPoint.date),
        portfolio: dataPoint.value,
      }))
    : [];

  // Always display exactly 6 ticks (or all if fewer than 6 points)
  const getLimitedLabels = (data: any[]) => {
    if (data.length <= 6) return data.map((item) => item.date);

    // Always show exactly 6 points
    const result: string[] = [];

    // First point
    result.push(data[0].date);

    // 4 evenly spaced middle points
    const step = Math.floor(data.length / 5);
    for (let i = 1; i <= 4; i++) {
      const index = Math.min(i * step, data.length - 1);
      result.push(data[index].date);
    }

    // Last point
    result.push(data[data.length - 1].date);

    return result;
  };

  // Get limited labels for X-axis - ensure uniqueness to avoid React key errors
  let limitedLabels = getLimitedLabels(chartData);

  // Ensure uniqueness by adding index to duplicates
  const uniqueLabels = new Map();
  limitedLabels = limitedLabels.map((label, idx) => {
    if (uniqueLabels.has(label)) {
      const count = uniqueLabels.get(label) + 1;
      uniqueLabels.set(label, count);
      return `${label} (${count})`;
    } else {
      uniqueLabels.set(label, 0);
      return label;
    }
  });

  return (
    <>
      {isLoading ? (
        <div className="aspect-auto h-[250px] w-full flex flex-col space-y-2">
          <Skeleton className="h-[250px] w-full" />
        </div>
      ) : hasNoData || chartData.length === 0 ? (
        <div className="aspect-auto h-[250px] w-full flex items-center justify-center">
          <p className="text-muted-foreground">No performance data available</p>
        </div>
      ) : (
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ left: -20, bottom: 0 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              ticks={limitedLabels}
              tickFormatter={(value) => {
                // Strip any uniqueness suffixes we added for React keys
                return value.replace(/ \(\d+\)$/, "");
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickCount={5}
              tickFormatter={(value) => {
                // Format numbers as K (thousands) or M (millions)
                if (value >= 1000000000) {
                  return `${(value / 1000000000).toFixed(1)}B`;
                } else if (value >= 1000000) {
                  return `${(value / 1000000).toFixed(1)}M`;
                } else if (value >= 1000) {
                  return `${(value / 1000).toFixed(0)}K`;
                } else {
                  return `${value}`;
                }
              }}
            />
            <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillPortfolio" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8d745d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8d745d" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <Area
              dataKey="portfolio"
              type="natural"
              fill="url(#fillPortfolio)"
              fillOpacity={0.4}
              stroke="#8d745d"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      )}
    </>
  );
}
