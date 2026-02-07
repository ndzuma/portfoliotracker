"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings2, Save, ArrowLeft, Check } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface V2EditPortfolioDialogProps {
  portfolioId: string;
  userId: string;
  initialName: string;
  initialDescription?: string;
  initialRiskTolerance?: string;
  initialTimeHorizon?: string;
}

export function V2EditPortfolioDialog({
  portfolioId,
  userId,
  initialName,
  initialDescription = "",
  initialRiskTolerance = "",
  initialTimeHorizon = "",
}: V2EditPortfolioDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"details" | "confirm">("details");
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [riskTolerance, setRiskTolerance] = useState(initialRiskTolerance);
  const [timeHorizon, setTimeHorizon] = useState(initialTimeHorizon);

  const updatePortfolio = useMutation(api.portfolios.updatePortfolio);

  const reset = () => {
    setStep("details");
    setName(initialName);
    setDescription(initialDescription);
    setRiskTolerance(initialRiskTolerance);
    setTimeHorizon(initialTimeHorizon);
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
    });
    setOpen(false);
  };

  const canProceed = name.trim();

  return (
    <>
      <button
        onClick={handleOpen}
        className="text-xs text-zinc-500 hover:text-white transition-colors"
        aria-label="Edit portfolio"
      >
        Edit Portfolio
      </button>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) reset();
        }}
      >
        <DialogContent className="sm:max-w-[460px] bg-zinc-950 border-white/[0.08] p-0 overflow-hidden">
          <DialogTitle className="sr-only">Edit Portfolio</DialogTitle>

          {/* Step indicator */}
          <div className="flex items-center gap-0 border-b border-white/[0.06]">
            {["Details", "Confirm"].map((s, i) => {
              const stepMap = ["details", "confirm"];
              const currentIdx = stepMap.indexOf(step);
              const isActive = i === currentIdx;
              const isDone = i < currentIdx;
              return (
                <div
                  key={s}
                  className={`flex-1 py-3 text-center text-[11px] font-medium uppercase tracking-wider transition-colors ${
                    isActive
                      ? "text-white bg-white/[0.04]"
                      : isDone
                        ? "text-zinc-500"
                        : "text-zinc-700"
                  }`}
                >
                  {s}
                </div>
              );
            })}
          </div>

          <div className="px-6 pb-6 pt-5">
            {step === "details" && (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
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
                  <Label className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
                    Description
                  </Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your investment strategy or goals..."
                    rows={3}
                    className="bg-zinc-900 border-white/[0.06] text-white resize-none text-sm"
                  />
                  <p className="text-xs text-zinc-600">
                    Optional but helpful for organizing your portfolios
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
                    Risk Tolerance
                  </Label>
                  <Select
                    value={riskTolerance}
                    onValueChange={setRiskTolerance}
                  >
                    <SelectTrigger className="bg-zinc-900 border-white/[0.06] text-white h-10 text-sm">
                      <SelectValue placeholder="Select your risk tolerance" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/[0.08]">
                      <SelectItem
                        value="Conservative"
                        className="text-white hover:bg-zinc-800"
                      >
                        Conservative
                      </SelectItem>
                      <SelectItem
                        value="Moderate"
                        className="text-white hover:bg-zinc-800"
                      >
                        Moderate
                      </SelectItem>
                      <SelectItem
                        value="Aggressive"
                        className="text-white hover:bg-zinc-800"
                      >
                        Aggressive
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-zinc-600">
                    Conservative: Low risk, stable returns. Moderate: Balanced
                    risk/reward. Aggressive: High risk, high potential returns.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
                    Time Horizon
                  </Label>
                  <Select value={timeHorizon} onValueChange={setTimeHorizon}>
                    <SelectTrigger className="bg-zinc-900 border-white/[0.06] text-white h-10 text-sm">
                      <SelectValue placeholder="Select your investment timeframe" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/[0.08]">
                      <SelectItem
                        value="Short-term (< 3 years)"
                        className="text-white hover:bg-zinc-800"
                      >
                        Short-term (&lt; 3 years)
                      </SelectItem>
                      <SelectItem
                        value="Medium-term (3-10 years)"
                        className="text-white hover:bg-zinc-800"
                      >
                        Medium-term (3-10 years)
                      </SelectItem>
                      <SelectItem
                        value="Long-term (10+ years)"
                        className="text-white hover:bg-zinc-800"
                      >
                        Long-term (10+ years)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-zinc-600">
                    How long do you plan to hold these investments before
                    needing the money?
                  </p>
                </div>
              </div>
            )}

            {step === "confirm" && (
              <div className="flex flex-col gap-4">
                <div className="text-center py-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                    <Check className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h3 className="text-white text-lg font-semibold mb-1">
                    Ready to Save Changes
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    Review your updated portfolio details
                  </p>
                </div>

                <div className="bg-zinc-900/50 rounded-lg p-4 border border-white/[0.06]">
                  <div className="flex flex-col gap-3">
                    <div>
                      <Label className="text-xs text-zinc-500 uppercase tracking-wider">
                        Name
                      </Label>
                      <p className="text-white text-sm mt-1">{name}</p>
                    </div>
                    {description && (
                      <div>
                        <Label className="text-xs text-zinc-500 uppercase tracking-wider">
                          Description
                        </Label>
                        <p className="text-zinc-300 text-sm mt-1">
                          {description}
                        </p>
                      </div>
                    )}
                    {riskTolerance && (
                      <div>
                        <Label className="text-xs text-zinc-500 uppercase tracking-wider">
                          Risk Tolerance
                        </Label>
                        <p className="text-zinc-300 text-sm mt-1">
                          {riskTolerance}
                        </p>
                      </div>
                    )}
                    {timeHorizon && (
                      <div>
                        <Label className="text-xs text-zinc-500 uppercase tracking-wider">
                          Time Horizon
                        </Label>
                        <p className="text-zinc-300 text-sm mt-1">
                          {timeHorizon}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-white/[0.06]">
              <button
                onClick={() => {
                  if (step === "details") {
                    reset();
                    setOpen(false);
                  } else {
                    setStep("details");
                  }
                }}
                className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors flex items-center gap-2"
              >
                {step === "confirm" && <ArrowLeft className="h-3.5 w-3.5" />}
                {step === "details" ? "Cancel" : "Back"}
              </button>
              <button
                onClick={() => {
                  if (step === "details") {
                    setStep("confirm");
                  } else {
                    handleSave();
                  }
                }}
                disabled={!canProceed}
                className="px-5 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {step === "details" ? (
                  <>
                    Continue
                    <Settings2 className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
