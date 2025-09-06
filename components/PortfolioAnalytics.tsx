"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { isFeatureEnabled } from "@/lib/featureFlags";
import {
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Shield,
  AlertTriangle,
} from "lucide-react";

interface PortfolioAnalyticsProps {
  portfolioId: string;
}

export function PortfolioAnalytics({ portfolioId }: PortfolioAnalyticsProps) {
  // Check if feature is enabled
  if (!isFeatureEnabled('portfolioAnalytics')) {
    return null;
  }

  const analytics = useQuery(api.portfolios.getPortfolioAnalytics, {
    portfolioId: portfolioId,
  });

  if (!analytics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
    );
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const getRiskLevel = (volatility: number) => {
    if (volatility < 0.15) return { level: "Low", color: "bg-green-500" };
    if (volatility < 0.25) return { level: "Medium", color: "bg-yellow-500" };
    return { level: "High", color: "bg-red-500" };
  };

  const riskLevel = getRiskLevel(analytics.riskMetrics.volatility);

  return (
    <div className="space-y-6 mb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">Portfolio Analytics</h2>
        <Badge variant="outline" className="text-xs">
          Data as of {new Date(analytics.metadata.calculatedAt).toLocaleDateString()}
        </Badge>
      </div>

      {/* Performance Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
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
              <BarChart3 className="h-4 w-4 text-primary" />
              Annualized Return
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(analytics.performanceMetrics.annualizedReturn)}
            </div>
            <p className="text-xs text-muted-foreground">
              Compound annual growth
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              YTD Return
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(analytics.performanceMetrics.ytdReturn)}
            </div>
            <p className="text-xs text-muted-foreground">
              Year to date
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(analytics.performanceMetrics.winRate / 100)}
            </div>
            <p className="text-xs text-muted-foreground">
              Positive periods
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Metrics Row */}
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
              <TrendingDown className="h-4 w-4 text-red-500" />
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
              <Activity className="h-4 w-4 text-primary" />
              Beta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.riskMetrics.beta.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Relative to market (SPY)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              VaR (95%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              -{formatPercentage(analytics.riskMetrics.valueAtRisk.daily)}
            </div>
            <p className="text-xs text-muted-foreground">
              Daily value at risk
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Benchmark Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Benchmark Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium">Alpha</p>
              <p className="text-2xl font-bold">
                {formatPercentage(analytics.performanceMetrics.alpha)}
              </p>
              <p className="text-xs text-muted-foreground">
                Excess return vs market
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Sharpe Ratio</p>
              <p className="text-2xl font-bold">
                {analytics.riskMetrics.sharpeRatio.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                Risk-adjusted return
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Correlation</p>
              <p className="text-2xl font-bold">
                {analytics.benchmarkComparisons.correlation.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                To benchmark
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asset Allocation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Asset Allocation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.assetAllocation.byType.map((allocation, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ 
                      backgroundColor: `hsl(${(index * 360) / analytics.assetAllocation.byType.length}, 70%, 50%)` 
                    }}
                  />
                  <span className="text-sm font-medium capitalize">{allocation.type}</span>
                </div>
                <span className="text-sm font-bold">
                  {allocation.percentage.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}