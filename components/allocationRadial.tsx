"use client";

import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

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
} from "@/components/ui/chart";

interface PortfolioWeighting {
  name: string;
  currentValue: number;
}

// Dynamic chart config that will be populated based on portfolio data
const chartConfig = {} as ChartConfig;

export function ChartRadialStacked({
  Weightings,
}: {
  Weightings: PortfolioWeighting[];
}) {
  // Transform the portfolio weightings into the required format
  const transformData = () => {
    if (!Weightings || Weightings.length === 0) return [{}];

    const result: Record<string, any> = { name: "portfolios" };

    // Reset chartConfig to avoid duplications on re-renders
    Object.keys(chartConfig).forEach((key) => {
      delete chartConfig[key];
    });

    Weightings.forEach((portfolio, index) => {
      // Use portfolio name as key and value as value
      result[portfolio.name] = portfolio.currentValue || 1;

      // Also update the chart config with colors that cycle through available chart variables
      chartConfig[portfolio.name] = {
        label: portfolio.name,
        color: `var(--chart-${(index % 8) + 1})`,
      };
    });
    console.log("Transformed Data:", result);

    return [result];
  };

  const chartData = transformData();

  const totalPortfolios = Weightings.length;

  if (totalPortfolios === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center">
          <CardTitle>Portfolio Weighting</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 items-center pb-0 ">
          <div className="mx-auto flex h-[150px] w-full max-w-[150px] items-center justify-center rounded-full bg-muted">
            <p className="text-center text-sm text-muted-foreground">
              No portfolio data available
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center">
        <CardTitle>Net Worth Composition</CardTitle>
        <CardDescription>
          Portfolio distribution across total assets
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0 -mb-25 -mt-5">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <RadialBarChart
            data={chartData}
            endAngle={180}
            innerRadius={80}
            outerRadius={130}
          >
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {totalPortfolios}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-muted-foreground"
                        >
                          Portoflios
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
            {Weightings.map((portfolio, index) => (
              <RadialBar
                key={portfolio.name}
                name={portfolio.name}
                dataKey={portfolio.name}
                stackId="a"
                data={chartData}
                cornerRadius={5}
                fill={`var(--chart-${(index % 8) + 1})`}
                className="stroke-transparent stroke-2"
              />
            ))}
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
