"use client";

import { useState } from "react";
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
import {
  ArrowLeft,
  ArrowRight,
  FloppyDisk,
  TrendUp,
  Coins,
  Money,
  Bank,
  Buildings,
  Diamond,
  Cube,
} from "@phosphor-icons/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import type { Asset } from "@/components/types";
import { ResponsiveDialog } from "@/components/responsive-dialog";

interface V2EditAssetDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
  onAssetUpdated: () => void;
}

const STEPS = ["Asset Info", "Pricing", "Notes", "Confirm"] as const;

const TYPE_META: Record<
  string,
  { icon: typeof TrendUp; color: string; bgColor: string }
> = {
  stock: { icon: TrendUp, color: "text-blue-400", bgColor: "bg-blue-500/10" },
  crypto: {
    icon: Coins,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  cash: {
    icon: Money,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  bond: {
    icon: Bank,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  "real estate": {
    icon: Buildings,
    color: "text-teal-400",
    bgColor: "bg-teal-500/10",
  },
  commodity: {
    icon: Diamond,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
  },
  other: { icon: Cube, color: "text-zinc-400", bgColor: "bg-zinc-500/10" },
};

export function V2EditAssetDialog({
  isOpen,
  onOpenChange,
  asset,
  onAssetUpdated,
}: V2EditAssetDialogProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(asset);
  const updateAsset = useMutation(api.assets.updateAsset);

  // Sync when asset prop changes (new asset selected for editing)
  if (
    asset !== null &&
    (editingAsset === null || asset._id !== editingAsset._id)
  ) {
    setEditingAsset(asset);
    setStepIdx(0);
  }

  const reset = () => {
    setEditingAsset(asset);
    setStepIdx(0);
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
      notes: (editingAsset as any).notes,
    });
    onOpenChange(false);
    onAssetUpdated();
  };

  const goNext = () => {
    if (stepIdx < STEPS.length - 1) setStepIdx(stepIdx + 1);
  };
  const goBack = () => {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  };

  if (!editingAsset) return null;

  const canProceed = editingAsset.name.trim();
  const meta = TYPE_META[editingAsset.type] || TYPE_META.other;
  const TypeIcon = meta.icon;

  // ─── Footer ───────────────────────────────────────────────────
  const footer = (
    <div className="flex items-center justify-between gap-3">
      <button
        onClick={() => {
          if (stepIdx === 0) {
            reset();
            onOpenChange(false);
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
        disabled={!canProceed}
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
    <ResponsiveDialog
      open={isOpen}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
      title="Edit Asset"
      steps={[...STEPS]}
      currentStep={stepIdx}
      footer={footer}
      maxWidth="480px"
    >
      {/* ─── Step 1: Asset Info ───────────────────────────── */}
      {stepIdx === 0 && (
        <div className="flex flex-col gap-5 pb-4">
          {/* Type badge — read-only */}
          <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/30 px-4 py-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${meta.bgColor}`}
            >
              <TypeIcon className={`h-4.5 w-4.5 ${meta.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-white capitalize">
                {editingAsset.type}
              </p>
              <p className="text-[11px] text-zinc-600">
                Asset type (read-only)
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
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
              <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
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
        </div>
      )}

      {/* ─── Step 2: Pricing ─────────────────────────────── */}
      {stepIdx === 1 && (
        <div className="flex flex-col gap-5 pb-4">
          {editingAsset.type === "cash" ? (
            <div className="flex flex-col gap-2">
              <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
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
              <p className="text-xs text-zinc-600">
                The currency denomination for this cash holding
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
                Current Price
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-sm">
                  $
                </span>
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
                  className="bg-zinc-900 border-white/[0.06] text-white h-10 text-sm pl-7"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-zinc-600">
                Override the current market price for this asset
              </p>
            </div>
          )}

          {/* Context info */}
          <div className="rounded-lg border border-white/[0.06] bg-zinc-900/20 px-4 py-3">
            <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.12em] mb-2">
              Current Value
            </p>
            <p className="text-lg font-semibold text-white tabular-nums">
              $
              {(
                (editingAsset.quantity || 0) * (editingAsset.currentPrice || 0)
              ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-zinc-600 mt-1">
              {editingAsset.quantity || 0} units × $
              {(editingAsset.currentPrice || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      )}

      {/* ─── Step 3: Notes ───────────────────────────────── */}
      {stepIdx === 2 && (
        <div className="flex flex-col gap-4 pb-4">
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
              Notes
            </Label>
            <Textarea
              value={(editingAsset as any).notes || ""}
              onChange={(e) =>
                setEditingAsset({
                  ...editingAsset,
                  notes: e.target.value,
                } as any)
              }
              rows={5}
              className="bg-zinc-900 border-white/[0.06] text-white resize-none text-sm leading-relaxed"
              placeholder="Investment thesis, research notes, reminders…"
              autoFocus
            />
            <p className="text-xs text-zinc-600">
              Optional — track your reasoning or any context about this asset
            </p>
          </div>
        </div>
      )}

      {/* ─── Step 4: Confirm ─────────────────────────────── */}
      {stepIdx === 3 && (
        <div className="flex flex-col gap-5 pb-4">
          <div className="text-center py-1">
            <h3 className="text-white text-sm font-semibold mb-1">
              Review Asset Details
            </h3>
            <p className="text-zinc-500 text-xs">
              Confirm your changes before saving
            </p>
          </div>

          <div className="rounded-lg border border-white/[0.06] overflow-hidden">
            {[
              {
                label: "Type",
                value:
                  editingAsset.type.charAt(0).toUpperCase() +
                  editingAsset.type.slice(1),
              },
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
                      value: `$${(editingAsset.currentPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                    },
                  ]),
              ...((editingAsset as any).notes
                ? [{ label: "Notes", value: (editingAsset as any).notes }]
                : []),
            ].map((row, i, arr) => (
              <div
                key={row.label}
                className={`flex items-start justify-between px-4 py-3 bg-zinc-900/30 ${
                  i < arr.length - 1 ? "border-b border-white/[0.06]" : ""
                }`}
              >
                <span className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.12em] pt-0.5 shrink-0">
                  {row.label}
                </span>
                <span className="text-sm text-white font-medium text-right max-w-[55%] leading-snug break-words">
                  {row.label === "Notes" && row.value.length > 80
                    ? row.value.slice(0, 80) + "…"
                    : row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ResponsiveDialog>
  );
}
