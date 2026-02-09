"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isFeatureEnabled } from "@/lib/featureFlags";
import {
  TrendUp,
  TrendDown,
  Shield,
  Pulse,
  Crosshair,
  ChartBar,
  Warning,
  Lightning,
} from "@phosphor-icons/react";

interface V2AnalyticsProps {
  portfolioId: string;
}

function StatBlock({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: any;
  label: string;
  value: string;
  sub: string;
  accent?: "green" | "red" | "amber" | "default";
}) {
  const accentColor =
    accent === "green"
      ? "text-emerald-500"
      : accent === "red"
        ? "text-red-500"
        : accent === "amber"
          ? "text-amber-500"
          : "text-white";

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-950/60 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-3.5 w-3.5 text-zinc-500" />
        <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p className={`text-2xl font-bold tracking-tight ${accentColor}`}>
        {value}
      </p>
      <p className="text-[11px] text-zinc-600 mt-1">{sub}</p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-white mb-4">{children}</h3>;
}

export function V2Analytics({ portfolioId }: V2AnalyticsProps) {
  if (!isFeatureEnabled("portfolioAnalytics")) return null;

  const analytics = useQuery(api.portfolios.getPortfolioAnalytics, {
    portfolioId,
  });

  const fmt = (v: number) => (!v ? "0.00%" : `${(v * 100).toFixed(2)}%`);
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (!analytics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/[0.06] bg-zinc-950/60 p-5 animate-pulse"
          >
            <div className="h-3 bg-white/[0.04] rounded w-20 mb-3" />
            <div className="h-6 bg-white/[0.04] rounded w-24 mb-2" />
            <div className="h-2 bg-white/[0.04] rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  const risk =
    analytics.riskMetrics.volatility < 0.15
      ? "Low"
      : analytics.riskMetrics.volatility < 0.25
        ? "Medium"
        : "High";

  return (
    <div className="flex flex-col gap-10">
      {/* Performance */}
      <div>
        <SectionTitle>Performance Metrics</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatBlock
            icon={TrendUp}
            label="Total Return"
            value={fmt(analytics.performanceMetrics.totalReturn)}
            sub="Since inception"
          />
          <StatBlock
            icon={ChartBar}
            label="Annualized"
            value={fmt(analytics.performanceMetrics.annualizedReturn)}
            sub="Compound annual growth"
          />
          <StatBlock
            icon={Pulse}
            label="YTD Return"
            value={fmt(analytics.performanceMetrics.ytdReturn)}
            sub="Year to date"
          />
          <StatBlock
            icon={Lightning}
            label="Alpha"
            value={fmt(analytics.performanceMetrics.alpha)}
            sub="Excess return vs market"
            accent={analytics.performanceMetrics.alpha > 0 ? "green" : "red"}
          />
        </div>
      </div>

      {/* Rolling Returns */}
      <div>
        <SectionTitle>Rolling Returns</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatBlock
            icon={TrendUp}
            label="1 Year"
            value={fmt(analytics.performanceMetrics.rollingReturns["1Y"])}
            sub="Trailing 12 months"
          />
          <StatBlock
            icon={TrendUp}
            label="3 Years"
            value={fmt(analytics.performanceMetrics.rollingReturns["3Y"])}
            sub="Annualized 3-year"
          />
          <StatBlock
            icon={TrendUp}
            label="5 Years"
            value={fmt(analytics.performanceMetrics.rollingReturns["5Y"])}
            sub="Annualized 5-year"
          />
        </div>
      </div>

      {/* Best / Worst */}
      <div>
        <SectionTitle>Best & Worst Periods</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatBlock
            icon={TrendUp}
            label="Best Month"
            value={`+${fmt(analytics.performanceMetrics.bestWorstPeriods.bestMonth.return)}`}
            sub={`${fmtDate(analytics.performanceMetrics.bestWorstPeriods.bestMonth.startDate)}`}
            accent="green"
          />
          <StatBlock
            icon={TrendDown}
            label="Worst Month"
            value={fmt(
              analytics.performanceMetrics.bestWorstPeriods.worstMonth.return,
            )}
            sub={`${fmtDate(analytics.performanceMetrics.bestWorstPeriods.worstMonth.startDate)}`}
            accent="red"
          />
          <StatBlock
            icon={TrendUp}
            label="Best Year"
            value={`+${fmt(analytics.performanceMetrics.bestWorstPeriods.bestYear.return)}`}
            sub={`${fmtDate(analytics.performanceMetrics.bestWorstPeriods.bestYear.startDate)}`}
            accent="green"
          />
          <StatBlock
            icon={TrendDown}
            label="Worst Year"
            value={fmt(
              analytics.performanceMetrics.bestWorstPeriods.worstYear.return,
            )}
            sub={`${fmtDate(analytics.performanceMetrics.bestWorstPeriods.worstYear.startDate)}`}
            accent="red"
          />
        </div>
      </div>

      {/* Risk */}
      <div>
        <SectionTitle>Risk Analysis</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-white/[0.06] bg-zinc-950/60 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-3.5 w-3.5 text-zinc-500" />
              <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">
                Volatility
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-white tracking-tight">
                {fmt(analytics.riskMetrics.volatility)}
              </p>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${risk === "Low" ? "bg-emerald-500/10 text-emerald-500" : risk === "Medium" ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"}`}
              >
                {risk}
              </span>
            </div>
            <p className="text-[11px] text-zinc-600 mt-1">
              Annualized volatility
            </p>
          </div>
          <StatBlock
            icon={TrendDown}
            label="Max Drawdown"
            value={`-${fmt(analytics.riskMetrics.maxDrawdown)}`}
            sub="Largest peak-to-trough"
            accent="red"
          />
          <StatBlock
            icon={Pulse}
            label="Sharpe Ratio"
            value={analytics.riskMetrics.sharpeRatio.toFixed(2)}
            sub="Risk-adjusted return"
          />
          <StatBlock
            icon={Warning}
            label="Daily VaR (95%)"
            value={`-${fmt(analytics.riskMetrics.valueAtRisk.daily)}`}
            sub="Expected daily loss"
            accent="amber"
          />
        </div>
      </div>

      {/* Benchmark Comparison */}
      <div>
        <SectionTitle>Benchmark Comparison (vs SPY)</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatBlock
            icon={Pulse}
            label="Beta"
            value={analytics.riskMetrics.beta.toFixed(2)}
            sub="Market sensitivity"
          />
          <StatBlock
            icon={Crosshair}
            label="Correlation"
            value={analytics.benchmarkComparisons.correlation.toFixed(3)}
            sub="Price correlation to SPY"
          />
          <StatBlock
            icon={Crosshair}
            label="Info Ratio"
            value={analytics.benchmarkComparisons.informationRatio.toFixed(3)}
            sub="Alpha per tracking error"
          />
          <StatBlock
            icon={TrendUp}
            label="Outperformance"
            value={`${analytics.benchmarkComparisons.cumulativeOutperformance > 0 ? "+" : ""}${fmt(analytics.benchmarkComparisons.cumulativeOutperformance)}`}
            sub="Cumulative excess return"
            accent={
              analytics.benchmarkComparisons.cumulativeOutperformance > 0
                ? "green"
                : "red"
            }
          />
        </div>
      </div>

      {/* Allocation */}
      <div>
        <SectionTitle>Asset Allocation</SectionTitle>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-950/60 p-5">
          <div className="flex flex-col gap-3">
            {analytics.assetAllocation.byType.map((alloc: any, i: number) => {
              const hue = (i * 360) / analytics.assetAllocation.byType.length;
              return (
                <div key={i} className="flex items-center gap-4">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: `hsl(${hue}, 65%, 55%)` }}
                  />
                  <span className="text-sm text-zinc-300 capitalize flex-1">
                    {alloc.type}
                  </span>
                  <div className="flex-[2] h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${alloc.percentage}%`,
                        backgroundColor: `hsl(${hue}, 65%, 55%)`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-white w-14 text-right">
                    {alloc.percentage.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
