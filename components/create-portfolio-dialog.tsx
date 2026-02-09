"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  ArrowLeft,
  ArrowRight,
  Check,
  ShieldCheck,
  ChartLineUp,
  Clock,
  Wallet,
  Bell,
} from "@phosphor-icons/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ResponsiveDialog } from "@/components/responsive-dialog";

interface V2CreatePortfolioDialogProps {
  userId?: string;
  triggerClassName?: string;
  triggerLabel?: string;
}

const STEPS = ["Name", "Strategy", "Confirm"] as const;

const RISK_OPTIONS = [
  {
    value: "Conservative",
    icon: ShieldCheck,
    description: "Low risk, stable returns",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    value: "Moderate",
    icon: ChartLineUp,
    description: "Balanced risk & reward",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  {
    value: "Aggressive",
    icon: ChartLineUp,
    description: "High risk, high potential",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
  },
] as const;

const TIME_HORIZONS = [
  { value: "Short-term (< 3 years)", label: "Short-term", sub: "< 3 years" },
  {
    value: "Medium-term (3-10 years)",
    label: "Medium-term",
    sub: "3–10 years",
  },
  { value: "Long-term (10+ years)", label: "Long-term", sub: "10+ years" },
] as const;

export function V2CreatePortfolioDialog({
  userId,
  triggerClassName,
  triggerLabel = "New Portfolio",
}: V2CreatePortfolioDialogProps) {
  const [open, setOpen] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [riskTolerance, setRiskTolerance] = useState<string>("");
  const [timeHorizon, setTimeHorizon] = useState<string>("");
  const [includeInNetworth, setIncludeInNetworth] = useState(true);
  const [allowSubscriptions, setAllowSubscriptions] = useState(false);
  const createPortfolio = useMutation(api.portfolios.createPortfolio);

  const reset = () => {
    setStepIdx(0);
    setName("");
    setDescription("");
    setRiskTolerance("");
    setTimeHorizon("");
    setIncludeInNetworth(true);
    setAllowSubscriptions(false);
  };

  const handleCreate = () => {
    if (userId && name.trim()) {
      createPortfolio({
        userId,
        name,
        description,
        riskTolerance: riskTolerance || undefined,
        timeHorizon: timeHorizon || undefined,
        includeInNetworth,
        allowSubscriptions,
      });
      reset();
      setOpen(false);
    }
  };

  const canProceed = name.trim();

  const goNext = () => {
    if (stepIdx < STEPS.length - 1) setStepIdx(stepIdx + 1);
  };
  const goBack = () => {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  };

  // ─── Footer (navigation buttons) ──────────────────────────────
  const footer = (
    <div className="flex items-center justify-between gap-3">
      <button
        onClick={() => {
          if (stepIdx === 0) {
            reset();
            setOpen(false);
          } else {
            goBack();
          }
        }}
        className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors flex items-center gap-2"
      >
        {stepIdx > 0 && <ArrowLeft className="h-3.5 w-3.5" />}
        {stepIdx === 0 ? "Cancel" : "Back"}
      </button>
      <button
        onClick={() => {
          if (stepIdx === STEPS.length - 1) {
            handleCreate();
          } else {
            goNext();
          }
        }}
        disabled={!canProceed}
        className="px-5 py-2.5 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {stepIdx === STEPS.length - 1 ? (
          <>
            <Plus className="h-3.5 w-3.5" />
            Create Portfolio
          </>
        ) : (
          <>
            Continue
            <ArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </button>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          triggerClassName ||
          "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors"
        }
      >
        <Plus className="h-4 w-4" />
        {triggerLabel}
      </button>

      <ResponsiveDialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) reset();
        }}
        title="Create Portfolio"
        steps={[...STEPS]}
        currentStep={stepIdx}
        footer={footer}
        maxWidth="480px"
      >
        {/* ─── Step 1: Name & Description ──────────────────── */}
        {stepIdx === 0 && (
          <div className="flex flex-col gap-5 pb-4">
            <div className="flex flex-col gap-2">
              <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
                Portfolio Name
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Growth Portfolio, Tech Stocks…"
                className="bg-zinc-900 border-white/[0.06] text-white h-10 text-sm"
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
                Description
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your investment strategy or goals…"
                rows={3}
                className="bg-zinc-900 border-white/[0.06] text-white resize-none text-sm"
              />
              <p className="text-xs text-zinc-600">
                Optional — helps organize your portfolios
              </p>
            </div>
          </div>
        )}

        {/* ─── Step 2: Strategy ────────────────────────────── */}
        {stepIdx === 1 && (
          <div className="flex flex-col gap-6 pb-4">
            {/* Risk Tolerance — card selector */}
            <div className="flex flex-col gap-3">
              <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
                Risk Tolerance
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {RISK_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = riskTolerance === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() =>
                        setRiskTolerance(isSelected ? "" : opt.value)
                      }
                      className={`relative flex flex-col items-center gap-2 rounded-lg border p-3 transition-all duration-150 ${
                        isSelected
                          ? "border-white/20 bg-white/[0.04]"
                          : "border-white/[0.06] bg-zinc-900/50 hover:border-white/10 hover:bg-white/[0.02]"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${opt.bgColor}`}
                      >
                        <Icon
                          className={`h-4 w-4 ${opt.color}`}
                          weight={isSelected ? "fill" : "regular"}
                        />
                      </div>
                      <span className="text-xs font-medium text-white">
                        {opt.value}
                      </span>
                      <span className="text-[10px] text-zinc-600 leading-tight text-center">
                        {opt.description}
                      </span>
                      {/* Selection indicator dot */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Horizon — card selector */}
            <div className="flex flex-col gap-3">
              <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
                Time Horizon
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_HORIZONS.map((opt) => {
                  const isSelected = timeHorizon === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() =>
                        setTimeHorizon(isSelected ? "" : opt.value)
                      }
                      className={`relative flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all duration-150 ${
                        isSelected
                          ? "border-white/20 bg-white/[0.04]"
                          : "border-white/[0.06] bg-zinc-900/50 hover:border-white/10 hover:bg-white/[0.02]"
                      }`}
                    >
                      <Clock
                        className={`h-4 w-4 ${isSelected ? "text-white" : "text-zinc-600"}`}
                        weight={isSelected ? "fill" : "regular"}
                      />
                      <span className="text-xs font-medium text-white">
                        {opt.label}
                      </span>
                      <span className="text-[10px] text-zinc-600">
                        {opt.sub}
                      </span>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Toggles — includeInNetworth & allowSubscriptions */}
            <div className="flex flex-col gap-0 rounded-lg border border-white/[0.06] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3.5 bg-zinc-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Wallet className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">
                      Include in Net Worth
                    </p>
                    <p className="text-[11px] text-zinc-600 mt-0.5">
                      Count this portfolio in your total net worth
                    </p>
                  </div>
                </div>
                <Switch
                  checked={includeInNetworth}
                  onCheckedChange={setIncludeInNetworth}
                />
              </div>
              <div className="w-full h-px bg-white/[0.06]" />
              <div className="flex items-center justify-between px-4 py-3.5 bg-zinc-900/30">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Bell className="h-3.5 w-3.5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">
                      Allow Subscriptions
                    </p>
                    <p className="text-[11px] text-zinc-600 mt-0.5">
                      Let others follow this portfolio's updates
                    </p>
                  </div>
                </div>
                <Switch
                  checked={allowSubscriptions}
                  onCheckedChange={setAllowSubscriptions}
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── Step 3: Confirm ────────────────────────────── */}
        {stepIdx === 2 && (
          <div className="flex flex-col gap-5 pb-4">
            <div className="text-center py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                <Check className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-white text-lg font-semibold mb-1">
                Ready to Create Portfolio
              </h3>
              <p className="text-zinc-400 text-sm">
                Review your portfolio details before creating
              </p>
            </div>

            <div className="rounded-lg border border-white/[0.06] overflow-hidden">
              {[
                { label: "Name", value: name },
                ...(description
                  ? [{ label: "Description", value: description }]
                  : []),
                ...(riskTolerance
                  ? [{ label: "Risk Tolerance", value: riskTolerance }]
                  : []),
                ...(timeHorizon
                  ? [{ label: "Time Horizon", value: timeHorizon }]
                  : []),
                {
                  label: "Include in Net Worth",
                  value: includeInNetworth ? "Yes" : "No",
                },
                {
                  label: "Allow Subscriptions",
                  value: allowSubscriptions ? "Yes" : "No",
                },
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  className={`flex items-start justify-between px-4 py-3 bg-zinc-900/30 ${
                    i < arr.length - 1 ? "border-b border-white/[0.06]" : ""
                  }`}
                >
                  <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.12em] pt-0.5">
                    {row.label}
                  </span>
                  <span className="text-sm text-white font-medium text-right max-w-[55%] leading-snug">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </ResponsiveDialog>
    </>
  );
}
