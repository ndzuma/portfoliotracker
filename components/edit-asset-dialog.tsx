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
import { Save, ArrowLeft } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import type { Asset } from "@/components/types";

interface V2EditAssetDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
  onAssetUpdated: () => void;
}

export function V2EditAssetDialog({
  isOpen,
  onOpenChange,
  asset,
  onAssetUpdated,
}: V2EditAssetDialogProps) {
  const [step, setStep] = useState<"details" | "confirm">("details");
  const [editingAsset, setEditingAsset] = useState<Asset | null>(asset);
  const updateAsset = useMutation(api.assets.updateAsset);

  if (
    asset !== null &&
    (editingAsset === null || asset._id !== editingAsset._id)
  ) {
    setEditingAsset(asset);
    setStep("details");
  }

  const reset = () => {
    setEditingAsset(asset);
    setStep("details");
  };

  const handleSave = () => {
    if (!editingAsset) return;
    updateAsset({
      assetId: editingAsset._id as Id<"assets">,
      name: editingAsset.name,
      symbol: editingAsset.symbol,
      type: editingAsset.type,
      currentPrice: editingAsset.currentPrice,
      currency:
        editingAsset.type === "cash" ? editingAsset.currency : undefined,
      notes: editingAsset.notes,
    });
    onOpenChange(false);
    onAssetUpdated();
  };

  if (!editingAsset) return null;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="sm:max-w-[460px] bg-zinc-950 border-white/[0.08] p-0 overflow-hidden">
        <DialogTitle className="sr-only">Edit Asset</DialogTitle>
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

        <div className="px-6 pb-6 pt-4">
          {/* STEP 1: Details */}
          {step === "details" && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
                  Asset Name
                </Label>
                <Input
                  value={editingAsset.name}
                  onChange={(e) =>
                    setEditingAsset({ ...editingAsset, name: e.target.value })
                  }
                  className="bg-zinc-900 border-white/[0.06] text-white h-10 text-sm"
                  autoFocus
                />
              </div>

              {(editingAsset.type === "stock" ||
                editingAsset.type === "crypto") && (
                <div className="flex flex-col gap-2">
                  <Label className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
                    Symbol
                  </Label>
                  <Input
                    value={editingAsset.symbol || ""}
                    onChange={(e) =>
                      setEditingAsset({
                        ...editingAsset,
                        symbol: e.target.value,
                      })
                    }
                    className="bg-zinc-900 border-white/[0.06] text-white h-10 text-sm"
                    placeholder={
                      editingAsset.type === "stock" ? "e.g., AAPL" : "e.g., BTC"
                    }
                  />
                </div>
              )}

              {editingAsset.type === "cash" ? (
                <div className="flex flex-col gap-2">
                  <Label className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
                    Currency
                  </Label>
                  <Select
                    value={editingAsset.currency || "USD"}
                    onValueChange={(v) =>
                      setEditingAsset({ ...editingAsset, currency: v })
                    }
                  >
                    <SelectTrigger className="bg-zinc-900 border-white/[0.06] text-white h-10 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-white/[0.08]">
                      {["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF"].map(
                        (c) => (
                          <SelectItem
                            key={c}
                            value={c}
                            className="text-zinc-300 focus:text-white focus:bg-white/[0.06]"
                          >
                            {c}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Label className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
                    Current Price
                  </Label>
                  <Input
                    type="number"
                    step={editingAsset.type === "crypto" ? "0.000001" : "0.01"}
                    value={editingAsset.currentPrice}
                    onChange={(e) =>
                      setEditingAsset({
                        ...editingAsset,
                        currentPrice: Number(e.target.value),
                      })
                    }
                    className="bg-zinc-900 border-white/[0.06] text-white h-10 text-sm"
                    placeholder="0.00"
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
                  Notes
                </Label>
                <Textarea
                  value={editingAsset.notes || ""}
                  onChange={(e) =>
                    setEditingAsset({ ...editingAsset, notes: e.target.value })
                  }
                  rows={3}
                  className="bg-zinc-900 border-white/[0.06] text-white resize-none text-sm"
                  placeholder="Additional details about this asset..."
                />
                <p className="text-xs text-zinc-600">
                  Optional notes for tracking or reference
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 mt-3 pt-4 border-t border-white/[0.06]">
                <button
                  onClick={() => {
                    reset();
                    onOpenChange(false);
                  }}
                  className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep("confirm")}
                  disabled={!editingAsset.name.trim()}
                  className="px-5 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Review Changes
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Confirmation */}
          {step === "confirm" && (
            <div className="flex flex-col gap-5">
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 flex flex-col gap-2.5">
                {[
                  { label: "Name", value: editingAsset.name },
                  ...(editingAsset.symbol
                    ? [
                        {
                          label: "Symbol",
                          value: editingAsset.symbol.toUpperCase(),
                        },
                      ]
                    : []),
                  ...(editingAsset.type === "cash"
                    ? [
                        {
                          label: "Currency",
                          value: editingAsset.currency || "USD",
                        },
                      ]
                    : [
                        {
                          label: "Current Price",
                          value: `$${editingAsset.currentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}`,
                        },
                      ]),
                  ...(editingAsset.notes
                    ? [{ label: "Notes", value: editingAsset.notes }]
                    : []),
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-xs text-zinc-500">{row.label}</span>
                    <span className="text-sm font-medium text-white max-w-[250px] text-right">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 mt-3 pt-4 border-t border-white/[0.06]">
                <button
                  onClick={() => {
                    reset();
                    onOpenChange(false);
                  }}
                  className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStep("details")}
                    className="px-3 py-2 text-sm text-zinc-500 hover:text-white transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-5 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors flex items-center gap-2"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
