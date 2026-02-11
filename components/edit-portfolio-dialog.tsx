"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  ArrowRight,
  FloppyDisk,
  ShieldCheck,
  ChartLineUp,
  Clock,
  Wallet,
  Bell,
} from "@phosphor-icons/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { useTranslations } from "next-intl";

interface V2EditPortfolioDialogProps {
  portfolioId: string;
  userId: string;
  initialName: string;
  initialDescription?: string;
  initialRiskTolerance?: string;
  initialTimeHorizon?: string;
  initialIncludeInNetworth?: boolean;
  initialAllowSubscriptions?: boolean;
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

export function V2EditPortfolioDialog({
  portfolioId,
  userId,
  initialName,
  initialDescription = "",
  initialRiskTolerance = "",
  initialTimeHorizon = "",
  initialIncludeInNetworth = true,
  initialAllowSubscriptions = false,
}: V2EditPortfolioDialogProps) {
  const tc = useTranslations("common");
  const tp = useTranslations("portfolio");
  const td = useTranslations("dialogs.editPortfolio");
  const tdc = useTranslations("dialogs.createPortfolio");

  const [open, setOpen] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [riskTolerance, setRiskTolerance] = useState(initialRiskTolerance);
  const [timeHorizon, setTimeHorizon] = useState(initialTimeHorizon);
  const [includeInNetworth, setIncludeInNetworth] = useState(
    initialIncludeInNetworth,
  );
  const [allowSubscriptions, setAllowSubscriptions] = useState(
    initialAllowSubscriptions,
  );

  const updatePortfolio = useMutation(api.portfolios.updatePortfolio);

  const STEPS = [td("stepDetails"), td("stepStrategy"), td("stepReview")];

  // Sync state when initial props change (e.g. after a refetch)
  useEffect(() => {
    if (!open) {
      setName(initialName);
      setDescription(initialDescription);
      setRiskTolerance(initialRiskTolerance);
      setTimeHorizon(initialTimeHorizon);
      setIncludeInNetworth(initialIncludeInNetworth);
      setAllowSubscriptions(initialAllowSubscriptions);
    }
  }, [
    open,
    initialName,
    initialDescription,
    initialRiskTolerance,
    initialTimeHorizon,
    initialIncludeInNetworth,
    initialAllowSubscriptions,
  ]);

  const reset = () => {
    setStepIdx(0);
    setName(initialName);
    setDescription(initialDescription);
    setRiskTolerance(initialRiskTolerance);
    setTimeHorizon(initialTimeHorizon);
    setIncludeInNetworth(initialIncludeInNetworth);
    setAllowSubscriptions(initialAllowSubscriptions);
  };

  const handleOpen = () => {
    reset();
    setOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    updatePortfolio({
      portfolioId: portfolioId as Id<"portfolios">,
      userId: userId as Id<"users">,
      name,
      description,
      riskTolerance: riskTolerance || undefined,
      timeHorizon: timeHorizon || undefined,
      includeInNetworth,
      allowSubscriptions,
    });
    setOpen(false);
  };

  const canProceed = name.trim();

  const goNext = () => {
    if (stepIdx < STEPS.length - 1) setStepIdx(stepIdx + 1);
  };
  const goBack = () => {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  };

  // ── Detect changes for the confirm step ───────────────────────
  const changes = [
    ...(name !== initialName
      ? [{ label: td("portfolioName"), from: initialName, to: name }]
      : []),
    ...(description !== initialDescription
      ? [
          {
            label: tc("description"),
            from: initialDescription || "—",
            to: description || "—",
          },
        ]
      : []),
    ...(riskTolerance !== initialRiskTolerance
      ? [
          {
            label: tp("riskTolerance"),
            from: initialRiskTolerance || "—",
            to: riskTolerance || "—",
          },
        ]
      : []),
    ...(timeHorizon !== initialTimeHorizon
      ? [
          {
            label: tp("timeHorizon"),
            from: initialTimeHorizon || "—",
            to: timeHorizon || "—",
          },
        ]
      : []),
    ...(includeInNetworth !== initialIncludeInNetworth
      ? [
          {
            label: tp("includeInNetWorth"),
            from: initialIncludeInNetworth ? tc("yes") : tc("no"),
            to: includeInNetworth ? tc("yes") : tc("no"),
          },
        ]
      : []),
    ...(allowSubscriptions !== initialAllowSubscriptions
      ? [
          {
            label: tp("allowSubscriptions"),
            from: initialAllowSubscriptions ? tc("yes") : tc("no"),
            to: allowSubscriptions ? tc("yes") : tc("no"),
          },
        ]
      : []),
  ];

  const hasChanges = changes.length > 0;

  // ─── Footer ───────────────────────────────────────────────────
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
            handleSave();
          } else {
            goNext();
          }
        }}
        disabled={!canProceed || (stepIdx === STEPS.length - 1 && !hasChanges)}
        className="px-5 py-2.5 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {stepIdx === STEPS.length - 1 ? (
          <>
            <FloppyDisk className="h-3.5 w-3.5" />
            {td("saveChanges")}
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
        onClick={handleOpen}
        className="text-xs text-zinc-500 hover:text-white transition-colors"
        aria-label={td("editPortfolioButton")}
      >
        {td("editPortfolioButton")}
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
        {/* ─── Step 1: Details ─────────────────────────────── */}
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
                {tc("description")}
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={tdc("descriptionPlaceholder")}
                rows={3}
                className="bg-zinc-900 border-white/[0.06] text-white resize-none text-sm"
              />
              <p className="text-xs text-zinc-600">
                {tdc("descriptionHelper")}
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
            {hasChanges ? (
              <>
                <div className="text-center py-1">
                  <h3 className="text-white text-sm font-semibold mb-1">
                    {td("reviewChanges")}
                  </h3>
                  <p className="text-zinc-500 text-xs">
                    {td("fieldsModified", { count: changes.length })}
                  </p>
                </div>

                <div className="rounded-lg border border-white/[0.06] overflow-hidden">
                  {changes.map((change, i) => (
                    <div
                      key={change.label}
                      className={`px-4 py-3 bg-zinc-900/30 ${
                        i < changes.length - 1
                          ? "border-b border-white/[0.06]"
                          : ""
                      }`}
                    >
                      <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.12em] block mb-2">
                        {change.label}
                      </span>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-zinc-600 line-through max-w-[40%] truncate">
                          {change.from}
                        </span>
                        <ArrowRight className="h-3 w-3 text-zinc-700 shrink-0" />
                        <span className="text-white font-medium max-w-[40%] truncate">
                          {change.to}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-zinc-500 text-sm">
                  {td("noChangesDescription")}
                </p>
                <p className="text-zinc-700 text-xs mt-1">
                  {td("goBackToModify")}
                </p>
              </div>
            )}
          </div>
        )}
      </ResponsiveDialog>
    </>
  );
}
