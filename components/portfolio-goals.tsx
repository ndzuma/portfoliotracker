"use client";

import { useState, useEffect, useMemo } from "react";
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
} from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResponsiveDialog } from "@/components/responsive-dialog";

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES & CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════ */

type GoalType =
  | "portfolio_value"
  | "annual_return"
  | "yearly_return"
  | "monthly_contribution"
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
  icon?: string;
  color?: string;
  deadline?: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

const GOAL_TYPE_META: Record<
  GoalType,
  {
    label: string;
    description: string;
    defaultUnit: GoalUnit;
    defaultIcon: string;
    accent: string;
    accentRgb: string;
    PhosphorIcon: typeof CurrencyDollar;
  }
> = {
  portfolio_value: {
    label: "Portfolio Value",
    description: "Target a specific portfolio dollar amount",
    defaultUnit: "currency",
    defaultIcon: "💰",
    accent: "#10b981",
    accentRgb: "16,185,129",
    PhosphorIcon: CurrencyDollar,
  },
  annual_return: {
    label: "Annual Return",
    description: "Target a percentage return this year",
    defaultUnit: "percentage",
    defaultIcon: "📈",
    accent: "#3b82f6",
    accentRgb: "59,130,246",
    PhosphorIcon: TrendUp,
  },
  yearly_return: {
    label: "Yearly Return",
    description: "Target a yearly percentage return",
    defaultUnit: "percentage",
    defaultIcon: "📊",
    accent: "#a855f7",
    accentRgb: "168,85,247",
    PhosphorIcon: ChartLineUp,
  },
  monthly_contribution: {
    label: "Monthly Contribution",
    description: "Set a recurring monthly savings goal",
    defaultUnit: "currency",
    defaultIcon: "🗓️",
    accent: "#d4af37",
    accentRgb: "212,175,55",
    PhosphorIcon: CalendarBlank,
  },
  custom: {
    label: "Custom Goal",
    description: "Define your own goal with a custom target",
    defaultUnit: "currency",
    defaultIcon: "🎯",
    accent: "#f59e0b",
    accentRgb: "245,158,11",
    PhosphorIcon: Crosshair,
  },
};

const GOAL_TYPES = Object.keys(GOAL_TYPE_META) as GoalType[];

/* ═══════════════════════════════════════════════════════════════════════════
   SVG HALF-RADIAL GAUGE
   ═══════════════════════════════════════════════════════════════════════════ */

function HalfRadialGauge({
  percentage,
  accent,
  accentRgb,
  size = 160,
}: {
  percentage: number;
  accent: string;
  accentRgb: string;
  size?: number;
}) {
  const clampedPct = Math.min(Math.max(percentage, 0), 120);
  const displayPct = Math.min(clampedPct, 100);

  // Geometry — semicircle from π (left) to 0 (right)
  const cx = size / 2;
  const cy = size * 0.75;
  const r = size * 0.42;
  const strokeWidth = size * 0.065;

  // Arc helper: angle 0 = right, π = left (standard math)
  const polarToCartesian = (angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy - r * Math.sin(rad),
    };
  };

  // Background arc: from 180° to 0°
  const bgStart = polarToCartesian(180);
  const bgEnd = polarToCartesian(0);
  const bgPath = `M ${bgStart.x} ${bgStart.y} A ${r} ${r} 0 0 1 ${bgEnd.x} ${bgEnd.y}`;

  // Progress arc: from 180° to (180 - displayPct*1.8)°
  const progressAngle = 180 - displayPct * 1.8;
  const pStart = polarToCartesian(180);
  const pEnd = polarToCartesian(Math.max(progressAngle, 0));
  const largeArc = displayPct > 50 ? 1 : 0;
  const progressPath =
    displayPct > 0.5
      ? `M ${pStart.x} ${pStart.y} A ${r} ${r} 0 ${largeArc} 1 ${pEnd.x} ${pEnd.y}`
      : "";

  // Tick marks
  const ticks = [0, 25, 50, 75, 100];
  const tickMarks = ticks.map((t) => {
    const angle = 180 - t * 1.8;
    const inner = {
      x: cx + (r - strokeWidth * 1.8) * Math.cos((angle * Math.PI) / 180),
      y: cy - (r - strokeWidth * 1.8) * Math.sin((angle * Math.PI) / 180),
    };
    const outer = {
      x: cx + (r + strokeWidth * 0.6) * Math.cos((angle * Math.PI) / 180),
      y: cy - (r + strokeWidth * 0.6) * Math.sin((angle * Math.PI) / 180),
    };
    return { t, inner, outer };
  });

  const exceeded = clampedPct > 100;

  return (
    <svg
      viewBox={`0 0 ${size} ${size * 0.8}`}
      className="w-full"
      style={{ maxWidth: size }}
    >
      <defs>
        <filter
          id={`glow-${accentRgb}`}
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient
          id={`grad-${accentRgb}`}
          gradientUnits="userSpaceOnUse"
          x1={bgStart.x}
          y1={bgStart.y}
          x2={bgEnd.x}
          y2={bgEnd.y}
        >
          <stop offset="0%" stopColor={accent} stopOpacity="0.6" />
          <stop offset="100%" stopColor={accent} stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Tick marks */}
      {tickMarks.map(({ t, inner, outer }) => (
        <line
          key={t}
          x1={inner.x}
          y1={inner.y}
          x2={outer.x}
          y2={outer.y}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1}
        />
      ))}

      {/* Background track */}
      <path
        d={bgPath}
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />

      {/* Progress arc */}
      {progressPath && (
        <motion.path
          d={progressPath}
          fill="none"
          stroke={`url(#grad-${accentRgb})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          filter={`url(#glow-${accentRgb})`}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 1.2, ease: "easeOut", delay: 0.2 },
            opacity: { duration: 0.3 },
          }}
        />
      )}

      {/* Center percentage */}
      <text
        x={cx}
        y={cy - r * 0.25}
        textAnchor="middle"
        dominantBaseline="middle"
        className="tabular-nums"
        style={{
          fontSize: size * 0.17,
          fontWeight: 700,
          fill: "white",
          fontFamily: "inherit",
        }}
      >
        {Math.round(clampedPct)}%
      </text>

      {/* Status label */}
      <text
        x={cx}
        y={cy - r * 0.25 + size * 0.1}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontSize: size * 0.058,
          fontWeight: 500,
          fill: exceeded
            ? "#10b981"
            : clampedPct >= 75
              ? accent
              : "rgba(255,255,255,0.35)",
          fontFamily: "inherit",
          textTransform: "uppercase" as const,
          letterSpacing: "0.12em",
        }}
      >
        {exceeded
          ? "EXCEEDED"
          : clampedPct >= 100
            ? "COMPLETE"
            : clampedPct >= 75
              ? "ON TRACK"
              : clampedPct >= 25
                ? "IN PROGRESS"
                : "GETTING STARTED"}
      </text>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   GOAL CARD
   ═══════════════════════════════════════════════════════════════════════════ */

function GoalCard({
  goal,
  portfolioValue,
  annualReturn,
  onEdit,
  onDelete,
  index,
}: {
  goal: GoalRow;
  portfolioValue: number;
  annualReturn: number;
  onEdit: (goal: GoalRow) => void;
  onDelete: (goalId: Id<"portfolioGoals">) => void;
  index: number;
}) {
  const meta = GOAL_TYPE_META[goal.type] || GOAL_TYPE_META.custom;
  const accent = goal.color || meta.accent;
  const accentRgb = goal.color
    ? hexToRgb(goal.color) || meta.accentRgb
    : meta.accentRgb;

  // Compute current value based on goal type
  const currentValue = useMemo(() => {
    if (goal.currentValue !== undefined && goal.currentValue !== null) {
      return goal.currentValue;
    }
    switch (goal.type) {
      case "portfolio_value":
        return portfolioValue;
      case "annual_return":
      case "yearly_return":
        return annualReturn;
      default:
        return 0;
    }
  }, [goal, portfolioValue, annualReturn]);

  const percentage =
    goal.targetValue > 0 ? (currentValue / goal.targetValue) * 100 : 0;

  const formatValue = (val: number, unit: GoalUnit) => {
    if (unit === "percentage") return `${val.toFixed(2)}%`;
    return `$${val.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const deadlineStr = goal.deadline
    ? new Date(goal.deadline).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

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

          {/* Actions — visible on hover */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <button
              onClick={() => onEdit(goal)}
              className="p-1.5 rounded-md text-zinc-600 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <PencilSimple className="h-3 w-3" />
            </button>
            <button
              onClick={() => onDelete(goal._id)}
              className="p-1.5 rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-500/[0.06] transition-colors"
            >
              <Trash className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Gauge */}
        <div className="flex justify-center px-2 -mb-2">
          <HalfRadialGauge
            percentage={percentage}
            accent={accent}
            accentRgb={accentRgb}
            size={160}
          />
        </div>

        {/* Current / Target */}
        <div className="flex items-center justify-between px-1 mt-1">
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
   ADD / EDIT GOAL DIALOG
   ═══════════════════════════════════════════════════════════════════════════ */

interface GoalFormState {
  name: string;
  type: GoalType;
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
  type: "portfolio_value",
  targetValue: "",
  currentValue: "",
  unit: "currency",
  icon: "",
  color: "",
  deadline: "",
  notes: "",
};

function goalToForm(goal: GoalRow): GoalFormState {
  return {
    name: goal.name,
    type: goal.type,
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
  open,
  onOpenChange,
}: {
  portfolioId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<GoalFormState>({ ...emptyForm });
  const createGoal = useMutation(api.portfolioGoals.createGoal);

  const steps = ["Type", "Details", "Confirm"];

  useEffect(() => {
    if (!open) {
      setStep(0);
      setForm({ ...emptyForm });
    }
  }, [open]);

  // When type is selected, auto-populate defaults
  const handleTypeSelect = (type: GoalType) => {
    const meta = GOAL_TYPE_META[type];
    setForm((f) => ({
      ...f,
      type,
      unit: meta.defaultUnit,
      icon: meta.defaultIcon,
      name: f.name || meta.label,
    }));
    // Auto-advance to details
    setTimeout(() => setStep(1), 180);
  };

  const canContinueToConfirm =
    form.name.trim().length > 0 && parseFloat(form.targetValue) > 0;

  const handleCreate = async () => {
    try {
      await createGoal({
        portfolioId: portfolioId as Id<"portfolios">,
        name: form.name.trim(),
        type: form.type,
        targetValue: parseFloat(form.targetValue) || 0,
        currentValue: form.currentValue
          ? parseFloat(form.currentValue)
          : undefined,
        unit: form.unit,
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

  const meta = GOAL_TYPE_META[form.type];

  // ─── Footer ────────────────────────────────────────
  let footer: React.ReactNode;
  if (step === 0) {
    footer = (
      <p className="text-xs text-zinc-600 text-center">
        Select a goal type to continue
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

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Goal"
      steps={steps}
      currentStep={step}
      footer={footer}
      maxWidth="480px"
    >
      {step === 0 && (
        /* ─── Step 1: Type selector ───────────────────────── */
        <div className="flex flex-col gap-2">
          <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em] mb-2">
            What do you want to track?
          </p>
          {GOAL_TYPES.map((type) => {
            const m = GOAL_TYPE_META[type];
            const selected = form.type === type;
            return (
              <button
                key={type}
                onClick={() => handleTypeSelect(type)}
                className={`relative flex items-center gap-3.5 p-3.5 rounded-xl border transition-all duration-150 text-left ${
                  selected
                    ? "border-white/[0.15] bg-white/[0.03]"
                    : "border-white/[0.06] bg-transparent hover:border-white/[0.1] hover:bg-white/[0.02]"
                }`}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${m.accent}15` }}
                >
                  <m.PhosphorIcon
                    className="h-4 w-4"
                    style={{ color: m.accent }}
                    weight="bold"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{m.label}</p>
                  <p className="text-[11px] text-zinc-600 mt-0.5">
                    {m.description}
                  </p>
                </div>
                {selected && (
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: m.accent }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {step === 1 && (
        /* ─── Step 2: Details ─────────────────────────────── */
        <div className="flex flex-col gap-5">
          {/* Type badge */}
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
            <button
              onClick={() => setStep(0)}
              className="text-[10px] text-zinc-600 hover:text-white transition-colors ml-auto"
            >
              Change
            </button>
          </div>

          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
              Goal Name
            </Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Retirement Fund Target"
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
                placeholder={form.unit === "currency" ? "100,000" : "10"}
                className="bg-zinc-900 border-white/[0.06] text-white h-10 text-sm pl-8"
              />
            </div>
          </div>

          {/* Current Value (optional) */}
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

      {step === 2 && (
        /* ─── Step 3: Confirm ─────────────────────────────── */
        <div className="flex flex-col gap-0">
          <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em] mb-4">
            Review your goal
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
                  ? form.notes.slice(0, 80) + "…"
                  : form.notes
              }
            />
          )}

          {/* Preview gauge */}
          <div className="mt-4 flex justify-center">
            <div className="w-32">
              <HalfRadialGauge
                percentage={
                  form.currentValue && parseFloat(form.targetValue) > 0
                    ? (parseFloat(form.currentValue) /
                        parseFloat(form.targetValue)) *
                      100
                    : 0
                }
                accent={meta.accent}
                accentRgb={meta.accentRgb}
                size={128}
              />
            </div>
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

  const meta = GOAL_TYPE_META[form.type] || GOAL_TYPE_META.custom;
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
                (optional)
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
                  ? form.notes.slice(0, 80) + "…"
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
  annualReturn,
}: {
  portfolioId: string;
  portfolioValue: number;
  annualReturn: number;
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

  const hasGoals = goals && goals.length > 0;

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight">
            Goals
          </h2>
          <p className="text-zinc-600 text-xs mt-1">
            {goals?.length ?? 0} active goal{goals?.length !== 1 ? "s" : ""}
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

      {/* Summary bar when goals exist — above the grid */}
      {hasGoals && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6 rounded-xl border border-white/[0.06] bg-zinc-950/40 px-5 py-4 flex items-center gap-6 flex-wrap"
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs text-zinc-500">
              <span className="text-white font-semibold tabular-nums">
                {
                  goals.filter((g) => {
                    const cv =
                      g.currentValue ??
                      (g.type === "portfolio_value"
                        ? portfolioValue
                        : g.type === "annual_return" ||
                            g.type === "yearly_return"
                          ? annualReturn
                          : 0);
                    return g.targetValue > 0 && cv >= g.targetValue;
                  }).length
                }
              </span>{" "}
              / {goals.length} completed
            </span>
          </div>
          <div className="w-px h-3 bg-white/[0.06]" />
          <div className="flex items-center gap-2">
            <Warning className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs text-zinc-500">
              <span className="text-white font-semibold tabular-nums">
                {
                  goals.filter((g) => {
                    const cv =
                      g.currentValue ??
                      (g.type === "portfolio_value"
                        ? portfolioValue
                        : g.type === "annual_return" ||
                            g.type === "yearly_return"
                          ? annualReturn
                          : 0);
                    return (
                      g.targetValue > 0 &&
                      cv < g.targetValue &&
                      cv / g.targetValue >= 0.75
                    );
                  }).length
                }
              </span>{" "}
              near target
            </span>
          </div>
          {goals.some((g) => g.deadline) && (
            <>
              <div className="w-px h-3 bg-white/[0.06]" />
              <div className="flex items-center gap-2">
                <CalendarBlank className="h-3.5 w-3.5 text-zinc-500" />
                <span className="text-xs text-zinc-500">
                  Next deadline:{" "}
                  <span className="text-white font-medium">
                    {(() => {
                      const upcoming = goals
                        .filter((g) => g.deadline && g.deadline > Date.now())
                        .sort((a, b) => (a.deadline || 0) - (b.deadline || 0));
                      if (upcoming.length === 0) return "None";
                      return new Date(upcoming[0].deadline!).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          year: "numeric",
                        },
                      );
                    })()}
                  </span>
                </span>
              </div>
            </>
          )}
        </motion.div>
      )}

      {/* Goal cards grid */}
      {hasGoals ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {goals.map((goal, i) => (
              <GoalCard
                key={goal._id}
                goal={goal as GoalRow}
                portfolioValue={portfolioValue}
                annualReturn={annualReturn}
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
          className="rounded-xl border border-dashed border-white/[0.08] bg-zinc-950/30 py-16 flex flex-col items-center justify-center text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
            <Target className="h-6 w-6 text-zinc-600" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1.5">
            No goals yet
          </h3>
          <p className="text-sm text-zinc-600 max-w-xs mb-6">
            Set portfolio targets and track your progress with precision
            instrument gauges.
          </p>
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" weight="bold" />
            Create Your First Goal
          </button>
        </motion.div>
      )}

      {/* Dialogs */}
      <AddGoalDialog
        portfolioId={portfolioId}
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
