"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Trash,
  PencilSimple,
  CurrencyDollar,
  TrendUp,
  ChartLineUp,
  CalendarBlank,
  Crosshair,
  Target,
  ArrowRight,
  Warning,
  CheckCircle,
  DotsThree,
  Shield,
  Lightning,
  Pulse,
  ChartBar,
  X,
} from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResponsiveDialog } from "@/components/responsive-dialog";

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES & CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════ */

type GoalType =
  | "portfolio_value"
  | "annualized_return"
  | "ytd_return"
  | "custom";

type GoalUnit = "currency" | "percentage";

interface GoalRow {
  _id: Id<"portfolioGoals">;
  _creationTime: number;
  portfolioId: Id<"portfolios">;
  name: string;
  type: GoalType;
  targetValue: number;
  currentValue?: number;
  unit: GoalUnit;
  metricKey?: string;
  icon?: string;
  color?: string;
  deadline?: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

interface AnalyticsData {
  performanceMetrics: {
    totalReturn: number;
    annualizedReturn: number;
    ytdReturn: number;
    alpha: number;
    rollingReturns: { "1Y": number; "3Y": number; "5Y": number };
    bestWorstPeriods: any;
  };
  riskMetrics: {
    volatility: number;
    maxDrawdown: number;
    sharpeRatio: number;
    valueAtRisk: { daily: number };
    beta: number;
  };
  benchmarkComparisons: {
    correlation: number;
    informationRatio: number;
    cumulativeOutperformance: number;
  };
  assetAllocation: any;
  metadata: any;
}

/* ─── Preset goal type metadata ─────────────────────────────────────────── */

const PRESET_META: Record<
  "portfolio_value" | "annualized_return" | "ytd_return",
  {
    label: string;
    shortLabel: string;
    description: string;
    unit: GoalUnit;
    icon: string;
    accent: string;
    accentRgb: string;
    PhosphorIcon: typeof CurrencyDollar;
  }
> = {
  portfolio_value: {
    label: "Portfolio Value",
    shortLabel: "Value",
    description: "Track total portfolio dollar amount",
    unit: "currency",
    icon: "💰",
    accent: "#10b981",
    accentRgb: "16,185,129",
    PhosphorIcon: CurrencyDollar,
  },
  annualized_return: {
    label: "Annualized Return",
    shortLabel: "Ann. Return",
    description: "Compound annual growth rate",
    unit: "percentage",
    icon: "📈",
    accent: "#3b82f6",
    accentRgb: "59,130,246",
    PhosphorIcon: TrendUp,
  },
  ytd_return: {
    label: "YTD Return",
    shortLabel: "YTD",
    description: "Year-to-date performance",
    unit: "percentage",
    icon: "📊",
    accent: "#a855f7",
    accentRgb: "168,85,247",
    PhosphorIcon: ChartLineUp,
  },
};

const PRESET_TYPES = Object.keys(PRESET_META) as (keyof typeof PRESET_META)[];

/* ─── Analytics metrics for custom goals ────────────────────────────────── */

interface MetricOption {
  key: string;
  label: string;
  category: string;
  unit: GoalUnit;
  icon: string;
  accent: string;
  accentRgb: string;
  PhosphorIcon: typeof CurrencyDollar;
  getValue: (analytics: AnalyticsData) => number;
  formatHint: string;
}

const ANALYTICS_METRICS: MetricOption[] = [
  // Performance
  {
    key: "totalReturn",
    label: "Total Return",
    category: "Performance",
    unit: "percentage",
    icon: "📈",
    accent: "#10b981",
    accentRgb: "16,185,129",
    PhosphorIcon: TrendUp,
    getValue: (a) => (a.performanceMetrics.totalReturn || 0) * 100,
    formatHint: "Since inception",
  },
  {
    key: "alpha",
    label: "Alpha",
    category: "Performance",
    unit: "percentage",
    icon: "⚡",
    accent: "#f59e0b",
    accentRgb: "245,158,11",
    PhosphorIcon: Lightning,
    getValue: (a) => (a.performanceMetrics.alpha || 0) * 100,
    formatHint: "Excess return vs market",
  },
  {
    key: "rolling1Y",
    label: "Rolling 1Y Return",
    category: "Performance",
    unit: "percentage",
    icon: "📊",
    accent: "#06b6d4",
    accentRgb: "6,182,212",
    PhosphorIcon: ChartBar,
    getValue: (a) => (a.performanceMetrics.rollingReturns["1Y"] || 0) * 100,
    formatHint: "Trailing 12 months",
  },
  {
    key: "rolling3Y",
    label: "Rolling 3Y Return",
    category: "Performance",
    unit: "percentage",
    icon: "📊",
    accent: "#8b5cf6",
    accentRgb: "139,92,246",
    PhosphorIcon: ChartBar,
    getValue: (a) => (a.performanceMetrics.rollingReturns["3Y"] || 0) * 100,
    formatHint: "Annualized 3-year",
  },
  {
    key: "rolling5Y",
    label: "Rolling 5Y Return",
    category: "Performance",
    unit: "percentage",
    icon: "📊",
    accent: "#ec4899",
    accentRgb: "236,72,153",
    PhosphorIcon: ChartBar,
    getValue: (a) => (a.performanceMetrics.rollingReturns["5Y"] || 0) * 100,
    formatHint: "Annualized 5-year",
  },
  // Risk
  {
    key: "volatility",
    label: "Volatility",
    category: "Risk",
    unit: "percentage",
    icon: "🛡️",
    accent: "#ef4444",
    accentRgb: "239,68,68",
    PhosphorIcon: Shield,
    getValue: (a) => (a.riskMetrics.volatility || 0) * 100,
    formatHint: "Annualized volatility",
  },
  {
    key: "maxDrawdown",
    label: "Max Drawdown",
    category: "Risk",
    unit: "percentage",
    icon: "📉",
    accent: "#f97316",
    accentRgb: "249,115,22",
    PhosphorIcon: TrendUp,
    getValue: (a) => Math.abs(a.riskMetrics.maxDrawdown || 0) * 100,
    formatHint: "Largest peak-to-trough",
  },
  {
    key: "sharpeRatio",
    label: "Sharpe Ratio",
    category: "Risk",
    unit: "currency", // actually a ratio, but we use "currency" to avoid % display
    icon: "📐",
    accent: "#14b8a6",
    accentRgb: "20,184,166",
    PhosphorIcon: Pulse,
    getValue: (a) => a.riskMetrics.sharpeRatio || 0,
    formatHint: "Risk-adjusted return",
  },
  {
    key: "dailyVaR",
    label: "Daily VaR (95%)",
    category: "Risk",
    unit: "percentage",
    icon: "⚠️",
    accent: "#eab308",
    accentRgb: "234,179,8",
    PhosphorIcon: Warning,
    getValue: (a) => Math.abs(a.riskMetrics.valueAtRisk?.daily || 0) * 100,
    formatHint: "Expected daily loss",
  },
  // Benchmark
  {
    key: "beta",
    label: "Beta",
    category: "Benchmark",
    unit: "currency", // ratio display
    icon: "📏",
    accent: "#6366f1",
    accentRgb: "99,102,241",
    PhosphorIcon: Pulse,
    getValue: (a) => a.riskMetrics.beta || 0,
    formatHint: "Market sensitivity",
  },
  {
    key: "correlation",
    label: "Correlation",
    category: "Benchmark",
    unit: "currency", // ratio display
    icon: "🔗",
    accent: "#0ea5e9",
    accentRgb: "14,165,233",
    PhosphorIcon: Crosshair,
    getValue: (a) => a.benchmarkComparisons.correlation || 0,
    formatHint: "Price correlation to SPY",
  },
  {
    key: "outperformance",
    label: "Outperformance",
    category: "Benchmark",
    unit: "percentage",
    icon: "🏆",
    accent: "#d4af37",
    accentRgb: "212,175,55",
    PhosphorIcon: TrendUp,
    getValue: (a) =>
      (a.benchmarkComparisons.cumulativeOutperformance || 0) * 100,
    formatHint: "Cumulative excess return",
  },
];

function getMetricByKey(key: string): MetricOption | undefined {
  return ANALYTICS_METRICS.find((m) => m.key === key);
}

/* ─── Shared type meta helper (works for both presets and custom) ─────── */

function getGoalMeta(goal: GoalRow) {
  if (goal.type === "custom" && goal.metricKey) {
    const metric = getMetricByKey(goal.metricKey);
    if (metric) {
      return {
        label: metric.label,
        accent: goal.color || metric.accent,
        accentRgb: goal.color
          ? hexToRgb(goal.color) || metric.accentRgb
          : metric.accentRgb,
        defaultIcon: metric.icon,
        PhosphorIcon: metric.PhosphorIcon,
        unit: metric.unit,
      };
    }
  }
  if (goal.type !== "custom") {
    const preset = PRESET_META[goal.type as keyof typeof PRESET_META];
    if (preset) {
      return {
        label: preset.label,
        accent: goal.color || preset.accent,
        accentRgb: goal.color
          ? hexToRgb(goal.color) || preset.accentRgb
          : preset.accentRgb,
        defaultIcon: preset.icon,
        PhosphorIcon: preset.PhosphorIcon,
        unit: preset.unit,
      };
    }
  }
  // Fallback for custom without metricKey
  return {
    label: "Custom Goal",
    accent: goal.color || "#f59e0b",
    accentRgb: goal.color ? hexToRgb(goal.color) || "245,158,11" : "245,158,11",
    defaultIcon: "🎯",
    PhosphorIcon: Crosshair,
    unit: goal.unit,
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   GOAL PROGRESS BAR — allocation-bar DNA
   ═══════════════════════════════════════════════════════════════════════════ */

function GoalProgressBar({
  percentage,
  accent,
  compact = false,
}: {
  percentage: number;
  accent: string;
  compact?: boolean;
}) {
  const clampedPct = Math.min(Math.max(percentage, 0), 120);
  const displayPct = Math.min(clampedPct, 100);
  const exceeded = clampedPct > 100;

  const statusText = exceeded
    ? "EXCEEDED"
    : clampedPct >= 100
      ? "COMPLETE"
      : clampedPct >= 75
        ? "ON TRACK"
        : clampedPct >= 25
          ? "IN PROGRESS"
          : "GETTING STARTED";

  const statusColor = exceeded
    ? "#10b981"
    : clampedPct >= 75
      ? accent
      : "rgba(255,255,255,0.35)";

  return (
    <div className={compact ? "" : "py-1"}>
      {/* Percentage + status row */}
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-lg font-bold text-white tabular-nums"
          style={compact ? { fontSize: "14px" } : undefined}
        >
          {Math.round(clampedPct)}%
        </span>
        <span
          className="text-[10px] font-medium uppercase tracking-[0.12em]"
          style={{ color: statusColor }}
        >
          {statusText}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className={`${compact ? "h-1.5" : "h-2.5"} rounded-full overflow-hidden bg-white/[0.04]`}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${accent}99 0%, ${accent} 100%)`,
            boxShadow: displayPct > 5 ? `0 0 8px ${accent}40` : "none",
          }}
          initial={{ width: "0%" }}
          animate={{ width: `${displayPct}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PRESET GOAL CARD — horizontal, always-present
   ═══════════════════════════════════════════════════════════════════════════ */

function PresetGoalCard({
  type,
  goal,
  currentValue,
  portfolioId,
  onEdit,
  onDelete,
  index,
}: {
  type: keyof typeof PRESET_META;
  goal: GoalRow | undefined;
  currentValue: number;
  portfolioId: string;
  onEdit: (goal: GoalRow) => void;
  onDelete: (goalId: Id<"portfolioGoals">) => void;
  index: number;
}) {
  const meta = PRESET_META[type];
  const Icon = meta.PhosphorIcon;
  const accent = goal?.color || meta.accent;
  const hasTarget = goal && goal.targetValue > 0;
  const percentage = hasTarget ? (currentValue / goal.targetValue) * 100 : 0;

  const createGoal = useMutation(api.portfolioGoals.createGoal);
  const [settingTarget, setSettingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (settingTarget && inputRef.current) {
      inputRef.current.focus();
    }
  }, [settingTarget]);

  const handleSetTarget = async () => {
    const val = parseFloat(targetInput);
    if (!val || val <= 0) return;
    try {
      await createGoal({
        portfolioId: portfolioId as Id<"portfolios">,
        name: meta.label,
        type,
        targetValue: val,
        currentValue: undefined,
        unit: meta.unit,
        icon: meta.icon,
      });
      toast.success(`${meta.label} target set`);
      setSettingTarget(false);
      setTargetInput("");
    } catch {
      toast.error("Failed to set target");
    }
  };

  const formatVal = (v: number) => {
    if (meta.unit === "percentage") return `${v.toFixed(2)}%`;
    return `$${v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 30,
        delay: index * 0.08,
      }}
      className="relative rounded-xl border border-white/[0.06] bg-zinc-950/60 overflow-hidden"
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${accent}50 30%, ${accent}50 70%, transparent 100%)`,
        }}
      />

      {/* Preset badge */}
      <div className="absolute top-3 right-3">
        <span
          className="text-[9px] font-semibold uppercase tracking-[0.15em] px-1.5 py-0.5 rounded-md"
          style={{ background: `${accent}12`, color: accent }}
        >
          Preset
        </span>
      </div>

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${accent}15` }}
          >
            <Icon className="h-4 w-4" style={{ color: accent }} weight="bold" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white leading-tight">
              {meta.label}
            </h4>
            <p className="text-[10px] text-zinc-600 mt-0.5">
              {meta.description}
            </p>
          </div>
        </div>

        {hasTarget ? (
          <>
            {/* Progress bar */}
            <div className="mb-3">
              <GoalProgressBar percentage={percentage} accent={accent} />
            </div>

            {/* Current → Target */}
            <div className="flex items-center justify-between px-1">
              <div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">
                  Current
                </p>
                <p className="text-sm font-semibold text-white tabular-nums">
                  {formatVal(currentValue)}
                </p>
              </div>
              <ArrowRight className="h-3 w-3 text-zinc-700" />
              <div className="text-right">
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">
                  Target
                </p>
                <button
                  onClick={() => goal && onEdit(goal)}
                  className="text-sm font-semibold tabular-nums hover:underline underline-offset-2 transition-colors cursor-pointer"
                  style={{ color: accent }}
                >
                  {formatVal(goal.targetValue)}
                </button>
              </div>
            </div>

            {/* Edit / Remove actions */}
            <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-white/[0.04]">
              <button
                onClick={() => goal && onEdit(goal)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <PencilSimple className="h-3 w-3" />
                Edit Target
              </button>
              <div className="w-px h-3 bg-white/[0.06]" />
              <button
                onClick={() => goal && onDelete(goal._id)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/[0.04] transition-colors"
              >
                <Trash className="h-3 w-3" />
                Remove
              </button>
            </div>
          </>
        ) : (
          /* No target set — show current value + CTA */
          <div className="flex flex-col items-center py-4">
            <p className="text-2xl font-bold text-white tabular-nums mb-1">
              {formatVal(currentValue)}
            </p>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-4">
              Current
            </p>

            {settingTarget ? (
              <div className="flex items-center gap-2 w-full">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                    {meta.unit === "currency" ? "$" : "%"}
                  </span>
                  <Input
                    ref={inputRef}
                    type="number"
                    value={targetInput}
                    onChange={(e) => setTargetInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSetTarget();
                      if (e.key === "Escape") setSettingTarget(false);
                    }}
                    placeholder="Target"
                    className="bg-zinc-900 border-white/[0.06] text-white h-9 text-sm pl-8"
                  />
                </div>
                <button
                  onClick={handleSetTarget}
                  className="px-3 py-2 text-xs font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors shrink-0"
                >
                  Set
                </button>
                <button
                  onClick={() => setSettingTarget(false)}
                  className="p-2 text-zinc-600 hover:text-white transition-colors shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSettingTarget(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg border border-white/[0.08] text-zinc-400 hover:text-white hover:border-white/[0.15] transition-all"
              >
                <Target className="h-3 w-3" />
                Set Target
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CUSTOM GOAL CARD — with mobile-friendly actions
   ═══════════════════════════════════════════════════════════════════════════ */

function GoalCard({
  goal,
  analytics,
  portfolioValue,
  annualizedReturn,
  ytdReturn,
  onEdit,
  onDelete,
  index,
}: {
  goal: GoalRow;
  analytics: AnalyticsData | null | undefined;
  portfolioValue: number;
  annualizedReturn: number;
  ytdReturn: number;
  onEdit: (goal: GoalRow) => void;
  onDelete: (goalId: Id<"portfolioGoals">) => void;
  index: number;
}) {
  const meta = getGoalMeta(goal);
  const accent = meta.accent;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Resolve current value from analytics or goal data
  const currentValue = useMemo(() => {
    if (goal.currentValue !== undefined && goal.currentValue !== null) {
      return goal.currentValue;
    }
    // For preset types (shouldn't be here in custom section, but just in case)
    if (goal.type === "portfolio_value") return portfolioValue;
    if (goal.type === "annualized_return") return annualizedReturn;
    if (goal.type === "ytd_return") return ytdReturn;
    // For custom goals with metricKey
    if (goal.type === "custom" && goal.metricKey && analytics) {
      const metric = getMetricByKey(goal.metricKey);
      if (metric) return metric.getValue(analytics);
    }
    return 0;
  }, [goal, portfolioValue, annualizedReturn, ytdReturn, analytics]);

  const percentage =
    goal.targetValue > 0 ? (currentValue / goal.targetValue) * 100 : 0;

  const formatValue = (val: number, unit: GoalUnit) => {
    if (unit === "percentage") return `${val.toFixed(2)}%`;
    return `$${val.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  const deadlineStr = goal.deadline
    ? new Date(goal.deadline).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={{
        type: "spring",
        stiffness: 350,
        damping: 30,
        delay: index * 0.06,
      }}
      className="group relative rounded-xl border border-white/[0.06] bg-zinc-950/60 overflow-hidden"
    >
      {/* Subtle top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${accent}40 30%, ${accent}40 70%, transparent 100%)`,
        }}
      />

      {/* Card content */}
      <div className="p-5 pb-4">
        {/* Header: icon + name + actions */}
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
              style={{ background: `${accent}15` }}
            >
              {goal.icon || meta.defaultIcon}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white leading-tight">
                {goal.name}
              </h4>
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider mt-0.5">
                {meta.label}
              </p>
            </div>
          </div>

          {/* Desktop: hover-reveal edit/delete. Mobile: always-visible kebab menu */}
          <div className="relative" ref={menuRef}>
            {/* Desktop actions — hidden on mobile */}
            <div className="hidden md:flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <button
                onClick={() => onEdit(goal)}
                className="p-1.5 rounded-md text-zinc-600 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <PencilSimple className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDelete(goal._id)}
                className="p-1.5 rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-500/[0.06] transition-colors"
              >
                <Trash className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Mobile kebab menu — hidden on desktop */}
            <div className="md:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                <DotsThree className="h-4 w-4" weight="bold" />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-9 z-20 w-36 rounded-xl border border-white/[0.08] bg-zinc-900 shadow-xl shadow-black/40 overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit(goal);
                      }}
                      className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-white/[0.04] transition-colors"
                    >
                      <PencilSimple className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <div className="border-t border-white/[0.06]" />
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(goal._id);
                      }}
                      className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/[0.04] transition-colors"
                    >
                      <Trash className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <GoalProgressBar percentage={percentage} accent={accent} />
        </div>

        {/* Current / Target */}
        <div className="flex items-center justify-between px-1">
          <div>
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">
              Current
            </p>
            <p className="text-sm font-semibold text-white tabular-nums">
              {formatValue(currentValue, goal.unit)}
            </p>
          </div>
          <ArrowRight className="h-3 w-3 text-zinc-700" />
          <div className="text-right">
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">
              Target
            </p>
            <p
              className="text-sm font-semibold tabular-nums"
              style={{ color: accent }}
            >
              {formatValue(goal.targetValue, goal.unit)}
            </p>
          </div>
        </div>

        {/* Deadline & notes footer */}
        {(deadlineStr || goal.notes) && (
          <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center gap-3">
            {deadlineStr && (
              <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                <CalendarBlank className="h-2.5 w-2.5" />
                {deadlineStr}
              </span>
            )}
            {goal.notes && (
              <span className="text-[10px] text-zinc-600 italic truncate flex-1">
                {goal.notes}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ADD CUSTOM GOAL DIALOG — analytics metric picker
   ═══════════════════════════════════════════════════════════════════════════ */

interface GoalFormState {
  name: string;
  type: GoalType;
  metricKey: string;
  targetValue: string;
  currentValue: string;
  unit: GoalUnit;
  icon: string;
  color: string;
  deadline: string;
  notes: string;
}

const emptyForm: GoalFormState = {
  name: "",
  type: "custom",
  metricKey: "",
  targetValue: "",
  currentValue: "",
  unit: "percentage",
  icon: "",
  color: "",
  deadline: "",
  notes: "",
};

function goalToForm(goal: GoalRow): GoalFormState {
  return {
    name: goal.name,
    type: goal.type,
    metricKey: goal.metricKey || "",
    targetValue: String(goal.targetValue),
    currentValue:
      goal.currentValue !== undefined ? String(goal.currentValue) : "",
    unit: goal.unit,
    icon: goal.icon || "",
    color: goal.color || "",
    deadline: goal.deadline
      ? new Date(goal.deadline).toISOString().split("T")[0]
      : "",
    notes: goal.notes || "",
  };
}

function AddGoalDialog({
  portfolioId,
  analytics,
  open,
  onOpenChange,
}: {
  portfolioId: string;
  analytics: AnalyticsData | null | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<GoalFormState>({ ...emptyForm });
  const createGoal = useMutation(api.portfolioGoals.createGoal);

  const steps = ["Choose Metric", "Details", "Confirm"];

  useEffect(() => {
    if (!open) {
      setStep(0);
      setForm({ ...emptyForm });
    }
  }, [open]);

  const handleMetricSelect = (metric: MetricOption) => {
    const liveValue = analytics ? metric.getValue(analytics) : 0;
    setForm((f) => ({
      ...f,
      type: "custom",
      metricKey: metric.key,
      unit: metric.unit,
      icon: metric.icon,
      name: f.name || metric.label + " Target",
      color: metric.accent,
      currentValue: String(liveValue.toFixed(2)),
    }));
    setTimeout(() => setStep(1), 180);
  };

  const canContinueToConfirm =
    form.name.trim().length > 0 &&
    parseFloat(form.targetValue) > 0 &&
    form.metricKey.length > 0;

  const handleCreate = async () => {
    try {
      await createGoal({
        portfolioId: portfolioId as Id<"portfolios">,
        name: form.name.trim(),
        type: "custom",
        targetValue: parseFloat(form.targetValue) || 0,
        currentValue: form.currentValue
          ? parseFloat(form.currentValue)
          : undefined,
        unit: form.unit,
        metricKey: form.metricKey || undefined,
        icon: form.icon || undefined,
        color: form.color || undefined,
        deadline: form.deadline ? new Date(form.deadline).getTime() : undefined,
        notes: form.notes.trim() || undefined,
      });
      toast.success("Goal created");
      onOpenChange(false);
    } catch {
      toast.error("Failed to create goal");
    }
  };

  const selectedMetric = form.metricKey
    ? getMetricByKey(form.metricKey)
    : undefined;

  let footer: React.ReactNode;
  if (step === 0) {
    footer = (
      <p className="text-xs text-zinc-600 text-center">
        Select a metric to track
      </p>
    );
  } else {
    footer = (
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors"
        >
          Back
        </button>
        {step < 2 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canContinueToConfirm}
            className="px-5 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleCreate}
            disabled={!canContinueToConfirm}
            className="px-5 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Create Goal
          </button>
        )}
      </div>
    );
  }

  // Group metrics by category
  const categories = useMemo(() => {
    const cats: Record<string, MetricOption[]> = {};
    for (const m of ANALYTICS_METRICS) {
      if (!cats[m.category]) cats[m.category] = [];
      cats[m.category].push(m);
    }
    return cats;
  }, []);

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Custom Goal"
      steps={steps}
      currentStep={step}
      footer={footer}
      maxWidth="520px"
    >
      {step === 0 && (
        /* ─── Step 1: Metric selector ─────────────────────── */
        <div className="flex flex-col gap-5">
          {Object.entries(categories).map(([category, metrics]) => (
            <div key={category}>
              <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em] mb-2.5">
                {category}
              </p>
              <div className="flex flex-col gap-1.5">
                {metrics.map((metric) => {
                  const selected = form.metricKey === metric.key;
                  const liveValue = analytics
                    ? metric.getValue(analytics)
                    : null;
                  return (
                    <button
                      key={metric.key}
                      onClick={() => handleMetricSelect(metric)}
                      className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all duration-150 text-left ${
                        selected
                          ? "border-white/[0.15] bg-white/[0.03]"
                          : "border-white/[0.06] bg-transparent hover:border-white/[0.1] hover:bg-white/[0.02]"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${metric.accent}15` }}
                      >
                        <metric.PhosphorIcon
                          className="h-3.5 w-3.5"
                          style={{ color: metric.accent }}
                          weight="bold"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">
                          {metric.label}
                        </p>
                        <p className="text-[11px] text-zinc-600 mt-0.5">
                          {metric.formatHint}
                        </p>
                      </div>
                      {liveValue !== null && (
                        <span className="text-xs font-medium text-zinc-500 tabular-nums shrink-0">
                          {metric.unit === "percentage"
                            ? `${liveValue.toFixed(2)}%`
                            : liveValue.toFixed(2)}
                        </span>
                      )}
                      {selected && (
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: metric.accent }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {step === 1 && selectedMetric && (
        /* ─── Step 2: Details ─────────────────────────────── */
        <div className="flex flex-col gap-5">
          {/* Metric badge */}
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
              style={{ background: `${selectedMetric.accent}15` }}
            >
              {form.icon || selectedMetric.icon}
            </div>
            <span
              className="text-xs font-medium"
              style={{ color: selectedMetric.accent }}
            >
              {selectedMetric.label}
            </span>
            <button
              onClick={() => setStep(0)}
              className="text-[10px] text-zinc-600 hover:text-white transition-colors ml-auto"
            >
              Change
            </button>
          </div>

          {/* Live value context */}
          {analytics && (
            <div className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3.5 py-2.5 flex items-center justify-between">
              <span className="text-[11px] text-zinc-500 uppercase tracking-wider">
                Current Value
              </span>
              <span className="text-sm font-semibold text-white tabular-nums">
                {selectedMetric.unit === "percentage"
                  ? `${selectedMetric.getValue(analytics).toFixed(2)}%`
                  : selectedMetric.getValue(analytics).toFixed(2)}
              </span>
            </div>
          )}

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
              Goal Name
            </Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={`e.g. ${selectedMetric.label} Target`}
              className="bg-zinc-900 border-white/[0.06] text-white h-10 text-sm"
            />
          </div>

          {/* Target Value */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
              Target {form.unit === "percentage" ? "Percentage" : "Value"}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                {form.unit === "percentage" ? "%" : ""}
              </span>
              <Input
                type="number"
                value={form.targetValue}
                onChange={(e) =>
                  setForm({ ...form, targetValue: e.target.value })
                }
                placeholder={
                  form.unit === "percentage" ? "e.g. 15" : "e.g. 2.5"
                }
                className={`bg-zinc-900 border-white/[0.06] text-white h-10 text-sm ${form.unit === "percentage" ? "pl-8" : "pl-3"}`}
              />
            </div>
          </div>

          {/* Deadline (optional) */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
              Deadline{" "}
              <span className="text-zinc-700 normal-case tracking-normal">
                (optional)
              </span>
            </Label>
            <Input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="bg-zinc-900 border-white/[0.06] text-white h-10 text-sm"
            />
          </div>

          {/* Notes (optional) */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
              Notes{" "}
              <span className="text-zinc-700 normal-case tracking-normal">
                (optional)
              </span>
            </Label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Strategy notes, reminders..."
              rows={2}
              className="w-full bg-zinc-900 border border-white/[0.06] text-white text-sm rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-white/[0.12] transition-colors placeholder:text-zinc-700"
            />
          </div>
        </div>
      )}

      {step === 2 && selectedMetric && (
        /* ─── Step 3: Confirm ─────────────────────────────── */
        <div className="flex flex-col gap-0">
          <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em] mb-4">
            Review your goal
          </p>

          <ConfirmRow label="Name" value={form.name} />
          <ConfirmRow label="Metric" value={selectedMetric.label} />
          <ConfirmRow
            label="Target"
            value={
              form.unit === "percentage"
                ? `${form.targetValue}%`
                : form.targetValue
            }
          />
          {analytics && (
            <ConfirmRow
              label="Current Value"
              value={
                form.unit === "percentage"
                  ? `${selectedMetric.getValue(analytics).toFixed(2)}%`
                  : selectedMetric.getValue(analytics).toFixed(2)
              }
            />
          )}
          {form.deadline && (
            <ConfirmRow
              label="Deadline"
              value={new Date(form.deadline).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            />
          )}
          {form.notes && (
            <ConfirmRow
              label="Notes"
              value={
                form.notes.length > 80
                  ? form.notes.slice(0, 80) + "..."
                  : form.notes
              }
            />
          )}

          {/* Preview bar */}
          <div className="mt-4">
            <GoalProgressBar
              percentage={
                analytics && parseFloat(form.targetValue) > 0
                  ? (selectedMetric.getValue(analytics) /
                      parseFloat(form.targetValue)) *
                    100
                  : 0
              }
              accent={selectedMetric.accent}
              compact
            />
          </div>
        </div>
      )}
    </ResponsiveDialog>
  );
}

/* ─── Edit Goal Dialog ──────────────────────────────────────────────────── */

function EditGoalDialog({
  goal,
  open,
  onOpenChange,
}: {
  goal: GoalRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<GoalFormState>({ ...emptyForm });
  const updateGoal = useMutation(api.portfolioGoals.updateGoal);

  const steps = ["Details", "Confirm"];

  useEffect(() => {
    if (open && goal) {
      setStep(0);
      setForm(goalToForm(goal));
    }
  }, [open, goal]);

  if (!goal) return null;

  const meta = getGoalMeta(goal);
  const canSave =
    form.name.trim().length > 0 && parseFloat(form.targetValue) > 0;

  const handleSave = async () => {
    try {
      await updateGoal({
        goalId: goal._id,
        name: form.name.trim(),
        targetValue: parseFloat(form.targetValue) || 0,
        currentValue: form.currentValue
          ? parseFloat(form.currentValue)
          : undefined,
        unit: form.unit,
        metricKey: form.metricKey || undefined,
        icon: form.icon || undefined,
        color: form.color || undefined,
        deadline: form.deadline ? new Date(form.deadline).getTime() : undefined,
        notes: form.notes.trim() || undefined,
      });
      toast.success("Goal updated");
      onOpenChange(false);
    } catch {
      toast.error("Failed to update goal");
    }
  };

  const footer = (
    <div className="flex items-center justify-between">
      {step > 0 ? (
        <button
          onClick={() => setStep(0)}
          className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors"
        >
          Back
        </button>
      ) : (
        <button
          onClick={() => onOpenChange(false)}
          className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors"
        >
          Cancel
        </button>
      )}
      {step === 0 ? (
        <button
          onClick={() => setStep(1)}
          disabled={!canSave}
          className="px-5 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Review
        </button>
      ) : (
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="px-5 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Save Changes
        </button>
      )}
    </div>
  );

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Goal"
      steps={steps}
      currentStep={step}
      footer={footer}
      maxWidth="480px"
    >
      {step === 0 && (
        <div className="flex flex-col gap-5">
          {/* Type badge (read-only) */}
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
              style={{ background: `${meta.accent}15` }}
            >
              {form.icon || meta.defaultIcon}
            </div>
            <span
              className="text-xs font-medium"
              style={{ color: meta.accent }}
            >
              {meta.label}
            </span>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
              Goal Name
            </Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-zinc-900 border-white/[0.06] text-white h-10 text-sm"
            />
          </div>

          {/* Target Value */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
              Target {form.unit === "currency" ? "Amount" : "Percentage"}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                {form.unit === "currency" ? "$" : "%"}
              </span>
              <Input
                type="number"
                value={form.targetValue}
                onChange={(e) =>
                  setForm({ ...form, targetValue: e.target.value })
                }
                className="bg-zinc-900 border-white/[0.06] text-white h-10 text-sm pl-8"
              />
            </div>
          </div>

          {/* Current Value */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
              Current Value{" "}
              <span className="text-zinc-700 normal-case tracking-normal">
                (optional — auto-derived if empty)
              </span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                {form.unit === "currency" ? "$" : "%"}
              </span>
              <Input
                type="number"
                value={form.currentValue}
                onChange={(e) =>
                  setForm({ ...form, currentValue: e.target.value })
                }
                placeholder="Auto"
                className="bg-zinc-900 border-white/[0.06] text-white h-10 text-sm pl-8"
              />
            </div>
          </div>

          {/* Deadline */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
              Deadline{" "}
              <span className="text-zinc-700 normal-case tracking-normal">
                (optional)
              </span>
            </Label>
            <Input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="bg-zinc-900 border-white/[0.06] text-white h-10 text-sm"
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
              Notes
            </Label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Strategy notes, reminders..."
              rows={2}
              className="w-full bg-zinc-900 border border-white/[0.06] text-white text-sm rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-white/[0.12] transition-colors placeholder:text-zinc-700"
            />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-0">
          <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em] mb-4">
            Confirm changes
          </p>

          <ConfirmRow label="Name" value={form.name} />
          <ConfirmRow label="Type" value={meta.label} />
          <ConfirmRow
            label="Target"
            value={
              form.unit === "currency"
                ? `$${parseFloat(form.targetValue || "0").toLocaleString()}`
                : `${form.targetValue}%`
            }
          />
          {form.currentValue && (
            <ConfirmRow
              label="Current Value"
              value={
                form.unit === "currency"
                  ? `$${parseFloat(form.currentValue).toLocaleString()}`
                  : `${form.currentValue}%`
              }
            />
          )}
          {form.deadline && (
            <ConfirmRow
              label="Deadline"
              value={new Date(form.deadline).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            />
          )}
          {form.notes && (
            <ConfirmRow
              label="Notes"
              value={
                form.notes.length > 80
                  ? form.notes.slice(0, 80) + "..."
                  : form.notes
              }
            />
          )}
        </div>
      )}
    </ResponsiveDialog>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIRM ROW (shared)
   ═══════════════════════════════════════════════════════════════════════════ */

function ConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-b-0">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-sm text-white font-medium text-right max-w-[60%] truncate">
        {value}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════════════════════ */

function hexToRgb(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN EXPORT — PORTFOLIO GOALS TAB
   ═══════════════════════════════════════════════════════════════════════════ */

export function V2PortfolioGoals({
  portfolioId,
  portfolioValue,
  annualizedReturn,
  ytdReturn,
  analytics,
}: {
  portfolioId: string;
  portfolioValue: number;
  annualizedReturn: number;
  ytdReturn: number;
  analytics: AnalyticsData | null | undefined;
}) {
  const goalsRaw = useQuery(api.portfolioGoals.getGoalsByPortfolio, {
    portfolioId: portfolioId as Id<"portfolios">,
  });
  const goals: GoalRow[] | undefined = goalsRaw as GoalRow[] | undefined;
  const deleteGoal = useMutation(api.portfolioGoals.deleteGoal);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalRow | null>(null);

  const handleEdit = (goal: GoalRow) => {
    setEditingGoal(goal);
    setEditOpen(true);
  };

  const handleDelete = async (goalId: Id<"portfolioGoals">) => {
    const confirmed = window.confirm(
      "Delete this goal? This action cannot be undone.",
    );
    if (!confirmed) return;

    try {
      await deleteGoal({ goalId });
      toast.success("Goal deleted");
    } catch {
      toast.error("Failed to delete goal");
    }
  };

  // Split goals into preset and custom
  const presetGoals = useMemo(() => {
    if (!goals) return {};
    const map: Record<string, GoalRow> = {};
    for (const g of goals) {
      if (g.type !== "custom") {
        map[g.type] = g;
      }
    }
    return map;
  }, [goals]);

  const customGoals = useMemo(() => {
    if (!goals) return [];
    return goals.filter((g) => g.type === "custom");
  }, [goals]);

  const hasCustomGoals = customGoals.length > 0;

  // Compute live values for presets
  const presetValues: Record<string, number> = {
    portfolio_value: portfolioValue,
    annualized_return: annualizedReturn,
    ytd_return: ytdReturn,
  };

  // All goals for summary bar
  const allGoals = goals || [];
  const hasAnyGoals = allGoals.some((g) => g.targetValue > 0);

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight">
            Goals
          </h2>
          <p className="text-zinc-600 text-xs mt-1">
            Track your portfolio milestones
          </p>
        </div>
      </div>

      {/* ─── Summary bar ─────────────────────────────────────────── */}
      {hasAnyGoals && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8 rounded-xl border border-white/[0.06] bg-zinc-950/40 px-5 py-4 flex items-center gap-6 flex-wrap"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs text-zinc-500">
              <span className="text-white font-semibold tabular-nums">
                {
                  allGoals.filter((g) => {
                    if (g.targetValue <= 0) return false;
                    const cv =
                      g.currentValue ??
                      presetValues[g.type] ??
                      (g.type === "custom" && g.metricKey && analytics
                        ? (getMetricByKey(g.metricKey)?.getValue(analytics) ??
                          0)
                        : 0);
                    return cv >= g.targetValue;
                  }).length
                }
              </span>{" "}
              / {allGoals.filter((g) => g.targetValue > 0).length} completed
            </span>
          </div>
          <div className="w-px h-3 bg-white/[0.06]" />
          <div className="flex items-center gap-2">
            <Warning className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs text-zinc-500">
              <span className="text-white font-semibold tabular-nums">
                {
                  allGoals.filter((g) => {
                    if (g.targetValue <= 0) return false;
                    const cv =
                      g.currentValue ??
                      presetValues[g.type] ??
                      (g.type === "custom" && g.metricKey && analytics
                        ? (getMetricByKey(g.metricKey)?.getValue(analytics) ??
                          0)
                        : 0);
                    return cv < g.targetValue && cv / g.targetValue >= 0.75;
                  }).length
                }
              </span>{" "}
              near target
            </span>
          </div>
          {allGoals.some((g) => g.deadline) && (
            <>
              <div className="w-px h-3 bg-white/[0.06]" />
              <div className="flex items-center gap-2">
                <CalendarBlank className="h-3.5 w-3.5 text-zinc-500" />
                <span className="text-xs text-zinc-500">
                  Next deadline:{" "}
                  <span className="text-white font-medium">
                    {(() => {
                      const upcoming = allGoals
                        .filter((g) => g.deadline && g.deadline > Date.now())
                        .sort((a, b) => (a.deadline || 0) - (b.deadline || 0));
                      if (upcoming.length === 0) return "None";
                      return new Date(upcoming[0].deadline!).toLocaleDateString(
                        "en-US",
                        { month: "short", year: "numeric" },
                      );
                    })()}
                  </span>
                </span>
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* ─── Preset Goals Section ────────────────────────────────── */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold text-white">Preset Goals</h3>
          <span className="text-[10px] text-zinc-600 bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded-full">
            Year in Review
          </span>
        </div>
        <p className="text-xs text-zinc-600 mb-5">
          Always-on benchmarks — set targets to track your portfolio&apos;s key
          metrics through the year.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRESET_TYPES.map((type, i) => (
            <PresetGoalCard
              key={type}
              type={type}
              goal={presetGoals[type]}
              currentValue={presetValues[type]}
              portfolioId={portfolioId}
              onEdit={handleEdit}
              onDelete={handleDelete}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* ─── Custom Goals Section ────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Custom Goals</h3>
            <p className="text-xs text-zinc-600 mt-0.5">
              Pick any portfolio analytic to track
            </p>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" weight="bold" />
            Add Goal
          </button>
        </div>

        {hasCustomGoals ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {customGoals.map((goal, i) => (
                <GoalCard
                  key={goal._id}
                  goal={goal as GoalRow}
                  analytics={analytics}
                  portfolioValue={portfolioValue}
                  annualizedReturn={annualizedReturn}
                  ytdReturn={ytdReturn}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  index={i}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : goals === undefined ? (
          /* Loading state */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-white/[0.06] bg-zinc-950/60 h-64 animate-pulse"
              />
            ))}
          </div>
        ) : (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-xl border border-dashed border-white/[0.08] bg-zinc-950/30 py-12 flex flex-col items-center justify-center text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
              <Crosshair className="h-5 w-5 text-zinc-600" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">
              No custom goals yet
            </h3>
            <p className="text-xs text-zinc-600 max-w-xs mb-5">
              Choose from portfolio analytics — total return, alpha, Sharpe
              ratio, and more — to set and track custom targets.
            </p>
            <button
              onClick={() => setAddOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" weight="bold" />
              Create Custom Goal
            </button>
          </motion.div>
        )}
      </div>

      {/* Dialogs */}
      <AddGoalDialog
        portfolioId={portfolioId}
        analytics={analytics}
        open={addOpen}
        onOpenChange={setAddOpen}
      />
      <EditGoalDialog
        goal={editingGoal}
        open={editOpen}
        onOpenChange={(o) => {
          setEditOpen(o);
          if (!o) setEditingGoal(null);
        }}
      />
    </div>
  );
}
