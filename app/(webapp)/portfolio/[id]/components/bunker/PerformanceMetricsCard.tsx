"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BarChart3, PieChart } from "lucide-react";

interface PerformanceMetricsCardProps {
  title?: string;
}

export function PerformanceMetricsCard({
  title = "Advanced Metrics",
}: PerformanceMetricsCardProps) {
  const [expanded, setExpanded] = useState(false);

  const riskMetrics = [
    { label: "Beta", value: "0.85" },
    { label: "Sharpe Ratio", value: "1.23" },
    { label: "Volatility (1Y)", value: "12.4%" },
    { label: "Max Drawdown", value: "-18.6%" },
  ];

  const performanceMetrics = [
    { label: "YTD Return", value: "+8.2%", positive: true },
    { label: "1 Year", value: "+12.7%", positive: true },
    { label: "3 Year (Ann.)", value: "+9.4%", positive: true },
    { label: "Since Inception", value: "+34.5%", positive: true },
  ];

  const benchmarkMetrics = [
    { label: "vs. S&P 500 (1Y)", value: "+2.3%", positive: true },
    { label: "vs. Sector ETF", value: "-1.8%", positive: false },
    { label: "Tracking Error", value: "4.2%" },
    { label: "Information Ratio", value: "0.76" },
  ];

  const factorMetrics = [
    { label: "Value Exposure", value: "Medium" },
    { label: "Growth Exposure", value: "High" },
    { label: "Quality Factor", value: "Medium" },
    { label: "Momentum", value: "Low" },
  ];

  return (
    <>
      <Card className="p-6 h-full relative">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium text-foreground">{title}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4 flex-1">
            View detailed performance metrics and risk analysis for your
            portfolio.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(true)}
            className="mt-2 opacity-70 hover:opacity-100 transition-opacity self-start flex items-center"
          >
            Expand
          </Button>
        </div>
      </Card>

      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:min-w-2xl md:min-w-3xl lg:min-w-5xl">
          <DialogHeader>
            <DialogTitle>Portfolio Analytics</DialogTitle>
          </DialogHeader>

          <div className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="w-full">
                <div className="p-6">
                  <h3 className="text-sm font-medium flex items-center gap-2 mb-4">
                    <PieChart className="h-4 w-4" />
                    Risk Metrics
                  </h3>
                  <dl className="space-y-4">
                    {riskMetrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="flex justify-between border-b border-border pb-2"
                      >
                        <dt className="text-sm text-muted-foreground">
                          {metric.label}
                        </dt>
                        <dd className="text-sm font-medium">{metric.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </Card>

              <Card className="w-full">
                <div className="p-6">
                  <h3 className="text-sm font-medium flex items-center gap-2 mb-4">
                    <BarChart3 className="h-4 w-4" />
                    Performance
                  </h3>
                  <dl className="space-y-4">
                    {performanceMetrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="flex justify-between border-b border-border pb-2"
                      >
                        <dt className="text-sm text-muted-foreground">
                          {metric.label}
                        </dt>
                        <dd
                          className={`text-sm font-medium ${
                            metric.positive ? "text-primary" : "text-secondary"
                          }`}
                        >
                          {metric.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </Card>

              <Card className="w-full">
                <div className="p-6">
                  <h3 className="text-sm font-medium flex items-center gap-2 mb-4">
                    <BarChart3 className="h-4 w-4" />
                    Benchmark Comparison
                  </h3>
                  <dl className="space-y-4">
                    {benchmarkMetrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="flex justify-between border-b border-border pb-2"
                      >
                        <dt className="text-sm text-muted-foreground">
                          {metric.label}
                        </dt>
                        <dd
                          className={`text-sm font-medium ${
                            metric.positive === undefined
                              ? ""
                              : metric.positive
                                ? "text-primary"
                                : "text-secondary"
                          }`}
                        >
                          {metric.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </Card>
              <Card className="w-full">
                <div className="p-6">
                  <h3 className="text-sm font-medium flex items-center gap-2 mb-4">
                    <PieChart className="h-4 w-4" />
                    Factor Analysis
                  </h3>
                  <dl className="space-y-4">
                    {factorMetrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="flex justify-between border-b border-border pb-2"
                      >
                        <dt className="text-sm text-muted-foreground">
                          {metric.label}
                        </dt>
                        <dd className="text-sm font-medium">{metric.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </Card>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground italic">
              <span className="font-semibold">Note:</span> Performance metrics
              are calculated based on portfolio transactions and market data.
              Past performance is not indicative of future results.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
