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

const STEPS = ["Details", "Strategy", "Confirm"] as const;

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
      ? [{ label: "Name", from: initialName, to: name }]
      : []),
    ...(description !== initialDescription
      ? [
          {
            label: "Description",
            from: initialDescription || "—",
            to: description || "—",
          },
        ]
      : []),
    ...(riskTolerance !== initialRiskTolerance
      ? [
          {
            label: "Risk Tolerance",
            from: initialRiskTolerance || "—",
            to: riskTolerance || "—",
          },
        ]
      : []),
    ...(timeHorizon !== initialTimeHorizon
      ? [
          {
            label: "Time Horizon",
            from: initialTimeHorizon || "—",
            to: timeHorizon || "—",
          },
        ]
      : []),
    ...(includeInNetworth !== initialIncludeInNetworth
      ? [
          {
            label: "Include in Net Worth",
            from: initialIncludeInNetworth ? "Yes" : "No",
            to: includeInNetworth ? "Yes" : "No",
          },
        ]
      : []),
    ...(allowSubscriptions !== initialAllowSubscriptions
      ? [
          {
            label: "Allow Subscriptions",
            from: initialAllowSubscriptions ? "Yes" : "No",
            to: allowSubscriptions ? "Yes" : "No",
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
        {stepIdx === 0 ? "Cancel" : "Back"}
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
            Save Changes
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
        onClick={handleOpen}
        className="text-xs text-zinc-500 hover:text-white transition-colors"
        aria-label="Edit portfolio"
      >
        Edit Portfolio
      </button>

      <ResponsiveDialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) reset();
        }}
        title="Edit Portfolio"
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
                Portfolio Name
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Portfolio name"
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
            {hasChanges ? (
              <>
                <div className="text-center py-1">
                  <h3 className="text-white text-sm font-semibold mb-1">
                    Review Changes
                  </h3>
                  <p className="text-zinc-500 text-xs">
                    {changes.length} field{changes.length !== 1 ? "s" : ""}{" "}
                    modified
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
                  No changes have been made.
                </p>
                <p className="text-zinc-700 text-xs mt-1">
                  Go back to modify your portfolio settings.
                </p>
              </div>
            )}
          </div>
        )}
      </ResponsiveDialog>
    </>
  );
}
