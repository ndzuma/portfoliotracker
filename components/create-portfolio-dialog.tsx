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
import { useTranslations } from "next-intl";

interface V2CreatePortfolioDialogProps {
  userId?: string;
  triggerClassName?: string;
  triggerLabel?: string;
}

const RISK_OPTIONS = [
  {
    value: "Conservative",
    labelKey: "riskConservative" as const,
    descKey: "riskConservativeDesc" as const,
    icon: ShieldCheck,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    value: "Moderate",
    labelKey: "riskModerate" as const,
    descKey: "riskModerateDesc" as const,
    icon: ChartLineUp,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  {
    value: "Aggressive",
    labelKey: "riskAggressive" as const,
    descKey: "riskAggressiveDesc" as const,
    icon: ChartLineUp,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
  },
] as const;

const TIME_HORIZONS = [
  {
    value: "Short-term (< 3 years)",
    labelKey: "horizonShort" as const,
    subKey: "horizonShortSub" as const,
  },
  {
    value: "Medium-term (3-10 years)",
    labelKey: "horizonMedium" as const,
    subKey: "horizonMediumSub" as const,
  },
  {
    value: "Long-term (10+ years)",
    labelKey: "horizonLong" as const,
    subKey: "horizonLongSub" as const,
  },
] as const;

export function V2CreatePortfolioDialog({
  userId,
  triggerClassName,
  triggerLabel,
}: V2CreatePortfolioDialogProps) {
  const tc = useTranslations("common");
  const tp = useTranslations("portfolio");
  const td = useTranslations("dialogs.createPortfolio");

  const [open, setOpen] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [riskTolerance, setRiskTolerance] = useState<string>("");
  const [timeHorizon, setTimeHorizon] = useState<string>("");
  const [includeInNetworth, setIncludeInNetworth] = useState(true);
  const [allowSubscriptions, setAllowSubscriptions] = useState(false);
  const createPortfolio = useMutation(api.portfolios.createPortfolio);

  const STEPS = [td("stepName"), td("stepStrategy"), td("stepConfirm")];

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
        {stepIdx === 0 ? tc("cancel") : tc("back")}
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
            {td("createPortfolio")}
          </>
        ) : (
          <>
            {tc("continue")}
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
        {triggerLabel || td("newPortfolio")}
      </button>

      <ResponsiveDialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) reset();
        }}
        title={td("title")}
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
                {td("portfolioName")}
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={td("portfolioNamePlaceholder")}
                className="bg-zinc-900 border-white/[0.06] text-white h-10 text-sm"
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
                {td("description")}
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={td("descriptionPlaceholder")}
                rows={3}
                className="bg-zinc-900 border-white/[0.06] text-white resize-none text-sm"
              />
              <p className="text-xs text-zinc-600">{td("descriptionHelper")}</p>
            </div>
          </div>
        )}

        {/* ─── Step 2: Strategy ────────────────────────────── */}
        {stepIdx === 1 && (
          <div className="flex flex-col gap-6 pb-4">
            {/* Risk Tolerance — card selector */}
            <div className="flex flex-col gap-3">
              <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
                {tp("riskTolerance")}
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
                        {tp(opt.labelKey)}
                      </span>
                      <span className="text-[10px] text-zinc-600 leading-tight text-center">
                        {tp(opt.descKey)}
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
                {tp("timeHorizon")}
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
                        {tp(opt.labelKey)}
                      </span>
                      <span className="text-[10px] text-zinc-600">
                        {tp(opt.subKey)}
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
                      {tp("includeInNetWorth")}
                    </p>
                    <p className="text-[11px] text-zinc-600 mt-0.5">
                      {tp("includeInNetWorthDescription")}
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
                      {tp("allowSubscriptions")}
                    </p>
                    <p className="text-[11px] text-zinc-600 mt-0.5">
                      {tp("allowSubscriptionsDescription")}
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
                {td("readyToCreate")}
              </h3>
              <p className="text-zinc-400 text-sm">{td("reviewDetails")}</p>
            </div>

            <div className="rounded-lg border border-white/[0.06] overflow-hidden">
              {[
                { label: td("name"), value: name },
                ...(description
                  ? [{ label: td("description"), value: description }]
                  : []),
                ...(riskTolerance
                  ? [{ label: td("riskTolerance"), value: riskTolerance }]
                  : []),
                ...(timeHorizon
                  ? [{ label: td("timeHorizon"), value: timeHorizon }]
                  : []),
                {
                  label: td("includeInNetWorth"),
                  value: includeInNetworth ? tc("yes") : tc("no"),
                },
                {
                  label: td("allowSubscriptions"),
                  value: allowSubscriptions ? tc("yes") : tc("no"),
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
