"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isFeatureEnabled } from "@/lib/featureFlags";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendUp,
  TrendDown,
  Shield,
  Pulse,
  Crosshair,
  ChartBar,
  Warning,
  Lightning,
  CaretDown,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

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

/* ─── Accordion Section ─────────────────────────────────────────── */
function AccordionSection({
  title,
  icon: Icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: any;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-zinc-950/40 overflow-hidden">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors group"
      >
        <div className="flex items-center gap-2.5">
          <Icon
            className={`h-4 w-4 transition-colors ${isOpen ? "text-white" : "text-zinc-500 group-hover:text-zinc-400"}`}
          />
          <span
            className={`text-sm font-semibold tracking-tight transition-colors ${isOpen ? "text-white" : "text-zinc-400 group-hover:text-zinc-300"}`}
          >
            {title}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <CaretDown
            className={`h-4 w-4 transition-colors ${isOpen ? "text-zinc-400" : "text-zinc-600 group-hover:text-zinc-500"}`}
          />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function V2Analytics({ portfolioId }: V2AnalyticsProps) {
  if (!isFeatureEnabled("portfolioAnalytics")) return null;

  const t = useTranslations("analytics");
  const tc = useTranslations("common");

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
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/[0.06] bg-zinc-950/40 overflow-hidden"
          >
            <div className="flex items-center gap-2.5 px-5 py-4">
              <div className="w-4 h-4 rounded bg-white/[0.04] animate-pulse" />
              <div className="h-4 bg-white/[0.04] rounded w-32 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const risk =
    analytics.riskMetrics.volatility < 0.15
      ? t("riskLow")
      : analytics.riskMetrics.volatility < 0.25
        ? t("riskMedium")
        : t("riskHigh");

  return (
    <div className="flex flex-col gap-4">
      {/* ─── Performance Metrics (open by default) ─── */}
      <AccordionSection
        title={t("performanceMetrics")}
        icon={TrendUp}
        defaultOpen={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatBlock
            icon={TrendUp}
            label={t("totalReturn")}
            value={fmt(analytics.performanceMetrics.totalReturn)}
            sub={t("sinceInception")}
          />
          <StatBlock
            icon={ChartBar}
            label={t("annualized")}
            value={fmt(analytics.performanceMetrics.annualizedReturn)}
            sub={t("compoundAnnualGrowth")}
          />
          <StatBlock
            icon={Pulse}
            label={t("ytdReturn")}
            value={fmt(analytics.performanceMetrics.ytdReturn)}
            sub={t("yearToDate")}
          />
          <StatBlock
            icon={Lightning}
            label={t("alpha")}
            value={fmt(analytics.performanceMetrics.alpha)}
            sub={t("excessReturnVsMarket")}
            accent={analytics.performanceMetrics.alpha > 0 ? "green" : "red"}
          />
        </div>
      </AccordionSection>

      {/* ─── Rolling Returns ─── */}
      <AccordionSection title={t("rollingReturns")} icon={ChartBar}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatBlock
            icon={TrendUp}
            label={t("rolling1Year")}
            value={fmt(analytics.performanceMetrics.rollingReturns["1Y"])}
            sub={t("trailing12Months")}
          />
          <StatBlock
            icon={TrendUp}
            label={t("rolling3Years")}
            value={fmt(analytics.performanceMetrics.rollingReturns["3Y"])}
            sub={t("annualized3Year")}
          />
          <StatBlock
            icon={TrendUp}
            label={t("rolling5Years")}
            value={fmt(analytics.performanceMetrics.rollingReturns["5Y"])}
            sub={t("annualized5Year")}
          />
        </div>
      </AccordionSection>

      {/* ─── Best & Worst Periods ─── */}
      <AccordionSection title={t("bestWorstPeriods")} icon={Crosshair}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatBlock
            icon={TrendUp}
            label={t("bestMonth")}
            value={`+${fmt(analytics.performanceMetrics.bestWorstPeriods.bestMonth.return)}`}
            sub={`${fmtDate(analytics.performanceMetrics.bestWorstPeriods.bestMonth.startDate)}`}
            accent="green"
          />
          <StatBlock
            icon={TrendDown}
            label={t("worstMonth")}
            value={fmt(
              analytics.performanceMetrics.bestWorstPeriods.worstMonth.return,
            )}
            sub={`${fmtDate(analytics.performanceMetrics.bestWorstPeriods.worstMonth.startDate)}`}
            accent="red"
          />
          <StatBlock
            icon={TrendUp}
            label={t("bestYear")}
            value={`+${fmt(analytics.performanceMetrics.bestWorstPeriods.bestYear.return)}`}
            sub={`${fmtDate(analytics.performanceMetrics.bestWorstPeriods.bestYear.startDate)}`}
            accent="green"
          />
          <StatBlock
            icon={TrendDown}
            label={t("worstYear")}
            value={fmt(
              analytics.performanceMetrics.bestWorstPeriods.worstYear.return,
            )}
            sub={`${fmtDate(analytics.performanceMetrics.bestWorstPeriods.worstYear.startDate)}`}
            accent="red"
          />
        </div>
      </AccordionSection>

      {/* ─── Risk Analysis ─── */}
      <AccordionSection title={t("riskAnalysis")} icon={Shield}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-white/[0.06] bg-zinc-950/60 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-3.5 w-3.5 text-zinc-500" />
              <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider">
                {t("volatility")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-white tracking-tight">
                {fmt(analytics.riskMetrics.volatility)}
              </p>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${risk === t("riskLow") ? "bg-emerald-500/10 text-emerald-500" : risk === t("riskMedium") ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"}`}
              >
                {risk}
              </span>
            </div>
            <p className="text-[11px] text-zinc-600 mt-1">
              {t("annualizedVolatility")}
            </p>
          </div>
          <StatBlock
            icon={TrendDown}
            label={t("maxDrawdown")}
            value={`-${fmt(analytics.riskMetrics.maxDrawdown)}`}
            sub={t("largestPeakToTrough")}
            accent="red"
          />
          <StatBlock
            icon={Pulse}
            label={t("sharpeRatio")}
            value={analytics.riskMetrics.sharpeRatio.toFixed(2)}
            sub={t("riskAdjustedReturn")}
          />
          <StatBlock
            icon={Warning}
            label={t("dailyVar95")}
            value={`-${fmt(analytics.riskMetrics.valueAtRisk.daily)}`}
            sub={t("expectedDailyLoss")}
            accent="amber"
          />
        </div>
      </AccordionSection>

      {/* ─── Benchmark Comparison (hidden when SPY data hasn't been seeded yet) ─── */}
      {analytics.metadata?.hasBenchmarkData && (
        <AccordionSection title={t("benchmarkComparison")} icon={Pulse}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatBlock
              icon={Pulse}
              label={t("beta")}
              value={analytics.riskMetrics.beta.toFixed(2)}
              sub={t("marketSensitivity")}
            />
            <StatBlock
              icon={Crosshair}
              label={t("correlation")}
              value={analytics.benchmarkComparisons.correlation.toFixed(3)}
              sub={t("priceCorrelationToSpy")}
            />
            <StatBlock
              icon={Crosshair}
              label={t("infoRatio")}
              value={analytics.benchmarkComparisons.informationRatio.toFixed(3)}
              sub={t("alphaPerTrackingError")}
            />
            <StatBlock
              icon={TrendUp}
              label={t("outperformance")}
              value={`${analytics.benchmarkComparisons.cumulativeOutperformance > 0 ? "+" : ""}${fmt(analytics.benchmarkComparisons.cumulativeOutperformance)}`}
              sub={t("cumulativeExcessReturn")}
              accent={
                analytics.benchmarkComparisons.cumulativeOutperformance > 0
                  ? "green"
                  : "red"
              }
            />
          </div>
        </AccordionSection>
      )}
    </div>
  );
}
