"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "An area chart with gradient fill";

const chartData = [
  // 2020 data (representing AAPL stock performance)
  { date: "Jan 2020", portfolio: 7500, benchmark: 7200 },
  { date: "Mar 2020", portfolio: 6100, benchmark: 5800 }, // COVID drop
  { date: "Jun 2020", portfolio: 8900, benchmark: 7400 },
  { date: "Sep 2020", portfolio: 9200, benchmark: 8200 },
  { date: "Dec 2020", portfolio: 10100, benchmark: 9000 },
  // 2021 data
  { date: "Mar 2021", portfolio: 10800, benchmark: 9500 },
  { date: "Jun 2021", portfolio: 11700, benchmark: 10300 },
  { date: "Sep 2021", portfolio: 11500, benchmark: 10400 },
  { date: "Dec 2021", portfolio: 12600, benchmark: 10900 },
  // 2022 data
  { date: "Mar 2022", portfolio: 11900, benchmark: 10200 },
  { date: "Jun 2022", portfolio: 10800, benchmark: 9400 }, // Market downturn
  { date: "Sep 2022", portfolio: 10200, benchmark: 9000 },
  { date: "Dec 2022", portfolio: 9800, benchmark: 8800 },
  // 2023 data
  { date: "Mar 2023", portfolio: 10600, benchmark: 9400 },
  { date: "Jun 2023", portfolio: 11400, benchmark: 10100 },
  { date: "Sep 2023", portfolio: 10900, benchmark: 10000 },
  { date: "Dec 2023", portfolio: 12200, benchmark: 10700 },
  // 2024 data
  { date: "Mar 2024", portfolio: 12800, benchmark: 11200 },
  { date: "Jun 2024", portfolio: 13400, benchmark: 11600 },
  { date: "Sep 2024", portfolio: 14200, benchmark: 11900 }, // Current
];

const chartConfig = {
  portfolio: {
    label: "Portfolio",
    color: "#8d745d",
  },
  benchmark: {
    label: "S&P 500",
    color: "#C3A871",
  },
} satisfies ChartConfig;

export function PorfolioPerformanceChart() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Historical Performance</CardTitle>
        <CardDescription>
          Portfolio performance vs S&P 500 benchmark
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickCount={6}
            />
            <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillPortfolio" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8d745d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8d745d" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillBenchmark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C3A871" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#C3A871" stopOpacity={0.1} />
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
            <Area
              dataKey="benchmark"
              type="natural"
              fill="url(#fillBenchmark)"
              fillOpacity={0.4}
              stroke="#C3A871"
              stackId="a"
            />
            <ChartLegend
              content={
                <ChartLegendContent />
              }
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
