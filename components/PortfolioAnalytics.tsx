"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { isFeatureEnabled } from "@/lib/featureFlags";
import { useState } from "react";
import {
  TrendUp,
  TrendDown,
  Crosshair,
  ChartBar,
  ChartPie,
  Pulse,
  Shield,
  Warning,
  CaretDown,
  CaretUp,
  Calendar,
  Lightning,
  ChartLineUp,
  ArrowCounterClockwise,
  Timer,
  Hash,
} from "@phosphor-icons/react";

interface PortfolioAnalyticsProps {
  portfolioId: string;
}

export function PortfolioAnalytics({ portfolioId }: PortfolioAnalyticsProps) {
  // Check if feature is enabled
  if (!isFeatureEnabled("portfolioAnalytics")) {
    return null;
  }

  const [isExpanded, setIsExpanded] = useState(false);

  const analytics = useQuery(api.portfolios.getPortfolioAnalytics, {
    portfolioId: portfolioId,
  });

  if (!analytics) {
    return (
      <div className="space-y-6 mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">
            Portfolio Analytics
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2"
          >
            {isExpanded ? (
              <>
                <CaretUp className="h-4 w-4" />
                <span>Collapse</span>
              </>
            ) : (
              <>
                <CaretDown className="h-4 w-4" />
                <span>Expand</span>
              </>
            )}
          </Button>
        </div>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  const formatPercentage = (value: number) => {
    if (!value) return "0.00%";
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatNumber = (value: number, decimals: number = 2) => {
    if (!value) return "0";
    return value.toFixed(decimals);
  };

  const getRiskLevel = (volatility: number) => {
    if (volatility < 0.15) return { level: "Low", color: "bg-green-500" };
    if (volatility < 0.25) return { level: "Medium", color: "bg-yellow-500" };
    return { level: "High", color: "bg-red-500" };
  };

  const riskLevel = getRiskLevel(analytics.riskMetrics.volatility);

  return (
    <div className="space-y-0 mb-6">
      <div
        className={`flex items-center justify-between pt-6 ${isExpanded ? "sticky top-0 bg-background z-10 pb-6 border-b" : ""}`}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold text-foreground">
            Portfolio Analytics
          </h2>
          <Badge variant="outline" className="text-xs">
            Data as of{" "}
            {new Date(analytics.metadata.calculatedAt).toLocaleDateString()}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          {isExpanded ? (
            <>
              <CaretUp className="h-4 w-4" />
              <span>Collapse</span>
            </>
          ) : (
            <>
              <CaretDown className="h-4 w-4" />
              <span>Expand</span>
            </>
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-8 pt-4">
          {/* Performance Metrics Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendUp className="h-5 w-5 text-primary" />
              Performance Metrics
            </h3>

            {/* Main Performance Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendUp className="h-4 w-4 text-primary" />
                    Total Return
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatPercentage(analytics.performanceMetrics.totalReturn)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Since inception
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <ChartBar className="h-4 w-4 text-primary" />
                    Annualized Return
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatPercentage(
                      analytics.performanceMetrics.annualizedReturn,
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Compound annual growth
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Timer className="h-4 w-4 text-primary" />
                    Time-Weighted Return
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatPercentage(
                      analytics.performanceMetrics.timeWeightedReturn,
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cash flow adjusted
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Pulse className="h-4 w-4 text-primary" />
                    YTD Return
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatPercentage(analytics.performanceMetrics.ytdReturn)}
                  </div>
                  <p className="text-xs text-muted-foreground">Year to date</p>
                </CardContent>
              </Card>
            </div>

            {/* Rolling Returns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowCounterClockwise className="h-5 w-5 text-primary" />
                  Rolling Returns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium">1 Year</p>
                    <p className="text-2xl font-bold">
                      {formatPercentage(
                        analytics.performanceMetrics.rollingReturns["1Y"],
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Trailing 12 months
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">3 Years</p>
                    <p className="text-2xl font-bold">
                      {formatPercentage(
                        analytics.performanceMetrics.rollingReturns["3Y"],
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Annualized 3-year
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">5 Years</p>
                    <p className="text-2xl font-bold">
                      {formatPercentage(
                        analytics.performanceMetrics.rollingReturns["5Y"],
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Annualized 5-year
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Best/Worst Periods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Best & Worst Periods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendUp className="h-4 w-4 text-green-500" />
                      <p className="text-sm font-medium">Best Month</p>
                    </div>
                    <p className="text-xl font-bold text-green-600">
                      +
                      {formatPercentage(
                        analytics.performanceMetrics.bestWorstPeriods.bestMonth
                          .return,
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(
                        analytics.performanceMetrics.bestWorstPeriods.bestMonth
                          .startDate,
                      )}{" "}
                      -{" "}
                      {formatDate(
                        analytics.performanceMetrics.bestWorstPeriods.bestMonth
                          .endDate,
                      )}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendDown className="h-4 w-4 text-red-500" />
                      <p className="text-sm font-medium">Worst Month</p>
                    </div>
                    <p className="text-xl font-bold text-red-600">
                      {formatPercentage(
                        analytics.performanceMetrics.bestWorstPeriods.worstMonth
                          .return,
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(
                        analytics.performanceMetrics.bestWorstPeriods.worstMonth
                          .startDate,
                      )}{" "}
                      -{" "}
                      {formatDate(
                        analytics.performanceMetrics.bestWorstPeriods.worstMonth
                          .endDate,
                      )}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendUp className="h-4 w-4 text-green-500" />
                      <p className="text-sm font-medium">Best Year</p>
                    </div>
                    <p className="text-xl font-bold text-green-600">
                      +
                      {formatPercentage(
                        analytics.performanceMetrics.bestWorstPeriods.bestYear
                          .return,
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(
                        analytics.performanceMetrics.bestWorstPeriods.bestYear
                          .startDate,
                      )}{" "}
                      -{" "}
                      {formatDate(
                        analytics.performanceMetrics.bestWorstPeriods.bestYear
                          .endDate,
                      )}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <TrendDown className="h-4 w-4 text-red-500" />
                      <p className="text-sm font-medium">Worst Year</p>
                    </div>
                    <p className="text-xl font-bold text-red-600">
                      {formatPercentage(
                        analytics.performanceMetrics.bestWorstPeriods.worstYear
                          .return,
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(
                        analytics.performanceMetrics.bestWorstPeriods.worstYear
                          .startDate,
                      )}{" "}
                      -{" "}
                      {formatDate(
                        analytics.performanceMetrics.bestWorstPeriods.worstYear
                          .endDate,
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Risk Analysis Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Risk Analysis
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Volatility
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold">
                      {formatPercentage(analytics.riskMetrics.volatility)}
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-xs text-white ${riskLevel.color}`}
                    >
                      {riskLevel.level}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Annualized volatility
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendDown className="h-4 w-4 text-red-500" />
                    Max Drawdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    -{formatPercentage(analytics.riskMetrics.maxDrawdown)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Largest peak-to-trough decline
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendDown className="h-4 w-4 text-orange-500" />
                    Downside Deviation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatPercentage(analytics.riskMetrics.downsideDeviation)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Negative volatility only
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Pulse className="h-4 w-4 text-primary" />
                    Sharpe Ratio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics.riskMetrics.sharpeRatio.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Risk-adjusted return
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Value at Risk */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Warning className="h-5 w-5 text-orange-500" />
                  Value at Risk (95% Confidence)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Daily VaR</p>
                    <p className="text-2xl font-bold text-orange-600">
                      -
                      {formatPercentage(
                        analytics.riskMetrics.valueAtRisk.daily,
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Expected daily loss (95% confidence)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Monthly VaR</p>
                    <p className="text-2xl font-bold text-orange-600">
                      -
                      {formatPercentage(
                        analytics.riskMetrics.valueAtRisk.monthly,
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Expected monthly loss (95% confidence)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Benchmark Comparison Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ChartBar className="h-5 w-5 text-primary" />
              Benchmark Comparison (vs SPY)
            </h3>

            {/* Alpha, Beta, Correlation */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Lightning className="h-4 w-4 text-primary" />
                    Alpha
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatPercentage(analytics.performanceMetrics.alpha)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Excess return vs market
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Pulse className="h-4 w-4 text-primary" />
                    Beta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics.riskMetrics.beta.toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Market sensitivity
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <ChartLineUp className="h-4 w-4 text-primary" />
                    Correlation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics.benchmarkComparisons.correlation.toFixed(3)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Price correlation to SPY
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Crosshair className="h-4 w-4 text-primary" />
                    Information Ratio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics.benchmarkComparisons.informationRatio.toFixed(3)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Alpha per unit of tracking error
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Tracking & Outperformance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tracking Error
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatPercentage(
                      analytics.benchmarkComparisons.trackingError,
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Standard deviation of excess returns
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Cumulative Outperformance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics.benchmarkComparisons.cumulativeOutperformance > 0
                      ? "+"
                      : ""}
                    {formatPercentage(
                      analytics.benchmarkComparisons.cumulativeOutperformance,
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total excess return vs SPY
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Market Capture */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pulse className="h-5 w-5 text-primary" />
                  Market Capture Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <TrendUp className="h-4 w-4 text-green-500" />
                      Up Market Capture
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPercentage(
                        analytics.benchmarkComparisons.marketCapture.upCapture /
                          100,
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Performance in rising markets
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2">
                      <TrendDown className="h-4 w-4 text-red-500" />
                      Down Market Capture
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {formatPercentage(
                        analytics.benchmarkComparisons.marketCapture
                          .downCapture / 100,
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Performance in falling markets
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Yearly Comparison Table
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Annual Performance vs Benchmark
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Year</th>
                        <th className="text-right py-2">Portfolio Return</th>
                        <th className="text-right py-2">Benchmark Return</th>
                        <th className="text-right py-2">Outperformance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.benchmarkComparisons.yearlyComparison.map((year: any, index: number) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 font-medium">{year.year}</td>
                          <td className="text-right py-2">
                            <span className={year.portfolioReturn >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatPercentage(year.portfolioReturn)}
                            </span>
                          </td>
                          <td className="text-right py-2">
                            <span className={year.benchmarkReturn >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatPercentage(year.benchmarkReturn)}
                            </span>
                          </td>
                          <td className="text-right py-2">
                            <span className={year.outperformance >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {year.outperformance >= 0 ? '+' : ''}{formatPercentage(year.outperformance)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            */}
          </div>

          <Separator />

          {/* Asset Allocation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ChartPie className="h-5 w-5 text-primary" />
              Asset Allocation
            </h3>

            <Card>
              <CardContent>
                <div className="space-y-3">
                  {analytics.assetAllocation.byType.map(
                    (allocation: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: `hsl(${(index * 360) / analytics.assetAllocation.byType.length}, 70%, 50%)`,
                            }}
                          />
                          <span className="text-sm font-medium capitalize">
                            {allocation.type}
                          </span>
                        </div>
                        <span className="text-sm font-bold">
                          {allocation.percentage.toFixed(1)}%
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Data Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Hash className="h-5 w-5 text-primary" />
              Analysis Metadata
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Data Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics.metadata.dataPoints.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Historical observations
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Date Range
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-bold">
                    {formatDate(analytics.metadata.dateRange.start)}
                  </div>
                  <div className="text-sm font-bold">
                    to {formatDate(analytics.metadata.dateRange.end)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Analysis period
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Asset Count
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics.metadata.assetCount}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Holdings in portfolio
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Last Updated
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-bold">
                    {formatDate(analytics.metadata.calculatedAt)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Analysis timestamp
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
