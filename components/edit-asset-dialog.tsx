"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  MagnifyingGlass,
  CaretDown,
  Check,
} from "@phosphor-icons/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import type { Asset } from "@/components/types";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { useCurrency } from "@/hooks/useCurrency";
import {
  CURRENCIES,
  searchCurrencies,
  currencySymbol,
  formatMoney,
} from "@/lib/currency";

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

/* ═══════════════════════════════════════════════════════════════════════════
   PORTAL CURRENCY PICKER — renders dropdown via portal so it escapes
   the dialog's overflow clipping.
   ═══════════════════════════════════════════════════════════════════════════ */

function PortalCurrencyPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = searchCurrencies(query);
  const selected = CURRENCIES.find((c) => c.code === value);

  // Position dropdown beneath trigger
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 6,
      left: rect.left,
      width: Math.max(rect.width, 280),
    });
  }, []);

  useEffect(() => {
    if (open) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [open, updatePosition]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Focus search input
  useEffect(() => {
    if (open && inputRef.current) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const handleSelect = useCallback(
    (code: string) => {
      onChange(code);
      setOpen(false);
      setQuery("");
    },
    [onChange],
  );

  const dropdown =
    mounted && open
      ? createPortal(
          <div
            ref={dropdownRef}
            className="fixed rounded-xl border border-white/[0.08] bg-zinc-950 shadow-2xl shadow-black/60 overflow-hidden"
            style={{
              top: pos.top,
              left: pos.left,
              width: pos.width,
              zIndex: 99999,
            }}
          >
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.06]">
              <MagnifyingGlass className="h-3.5 w-3.5 text-zinc-600 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search currencies…"
                className="bg-transparent text-xs text-zinc-300 placeholder:text-zinc-700 outline-none w-full"
              />
            </div>

            {/* List */}
            <div className="max-h-[220px] overflow-y-auto overflow-x-hidden scrollbar-hide">
              {filtered.length === 0 ? (
                <div className="px-3 py-4 text-center text-[11px] text-zinc-600">
                  No currencies found
                </div>
              ) : (
                filtered.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelect(c.code)}
                    className={`
                      flex items-center gap-2.5 w-full px-3 py-2 text-left transition-colors
                      hover:bg-white/[0.04]
                      ${c.code === value ? "bg-white/[0.04]" : ""}
                    `}
                  >
                    <span className="text-sm w-6 text-center shrink-0">
                      {c.flag}
                    </span>
                    <span
                      className={`text-xs font-semibold tracking-wide ${
                        c.code === value ? "text-white" : "text-zinc-400"
                      }`}
                    >
                      {c.code}
                    </span>
                    <span className="text-[11px] text-zinc-600 flex-1 truncate">
                      {c.name}
                    </span>
                    <span className="text-[11px] text-zinc-700 shrink-0 w-5 text-right">
                      {c.symbol}
                    </span>
                    {c.code === value && (
                      <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`
          flex items-center gap-2 bg-zinc-900 border text-zinc-300 text-sm
          pl-3 pr-2 py-2 rounded-lg cursor-pointer w-full h-10
          hover:border-white/[0.12] hover:text-white transition-colors
          ${open ? "border-white/[0.2] ring-1 ring-white/10" : "border-white/[0.06]"}
        `}
      >
        {selected && (
          <span className="text-base leading-none">{selected.flag}</span>
        )}
        <span className="flex-1 text-left font-medium text-sm">{value}</span>
        {selected && (
          <span className="text-zinc-600 text-xs truncate">
            {selected.name}
          </span>
        )}
        <CaretDown
          className={`h-3 w-3 text-zinc-600 transition-transform ml-1 shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {dropdown}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EDIT ASSET DIALOG
   ═══════════════════════════════════════════════════════════════════════════ */

export function V2EditAssetDialog({
  isOpen,
  onOpenChange,
  asset,
  onAssetUpdated,
}: V2EditAssetDialogProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(asset);
  const updateAsset = useMutation(api.assets.updateAsset);
  const { currency: baseCurrency } = useCurrency();

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
      currency: editingAsset.currency || baseCurrency,
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

  // Clickable step navigation — allow jumping to completed or current steps
  const handleStepClick = (idx: number) => {
    if (idx <= stepIdx) {
      setStepIdx(idx);
    }
  };

  if (!editingAsset) return null;

  const canProceed = editingAsset.name.trim();
  const meta = TYPE_META[editingAsset.type] || TYPE_META.other;
  const TypeIcon = meta.icon;
  const assetCurrency = editingAsset.currency || baseCurrency;

  // Currency-aware formatting — uses the asset's own currency
  const assetCurrSym = currencySymbol(assetCurrency);
  const fmtAsset = (amount: number) => formatMoney(amount, assetCurrency);

  // Get currency info for confirm screen
  const currencyInfo = CURRENCIES.find((c) => c.code === assetCurrency);

  // Computed values
  const currentValue =
    (editingAsset.quantity || 0) * (editingAsset.currentPrice || 0);

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
      onStepClick={handleStepClick}
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

          {/* Name */}
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

          {/* Symbol — stocks & crypto only */}
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

          {/* Currency — portal picker for ALL asset types */}
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
              Currency
            </Label>
            <PortalCurrencyPicker
              value={assetCurrency}
              onChange={(v) =>
                setEditingAsset({ ...editingAsset, currency: v })
              }
            />
            <p className="text-xs text-zinc-600">
              {editingAsset.type === "cash"
                ? "The currency denomination for this cash holding"
                : "The currency this asset is denominated in"}
            </p>
          </div>
        </div>
      )}

      {/* ─── Step 2: Pricing ─────────────────────────────── */}
      {stepIdx === 1 && (
        <div className="flex flex-col gap-5 pb-4">
          {editingAsset.type === "cash" ? (
            <div className="rounded-lg border border-white/[0.06] bg-zinc-900/20 px-4 py-3">
              <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.12em] mb-2">
                Cash Holding
              </p>
              <p className="text-sm text-zinc-400">
                Cash assets use their quantity as the value. Price is managed
                through transactions.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
                Current Price
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-sm">
                  {assetCurrSym}
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

          {/* Context info — current value */}
          <div className="rounded-lg border border-white/[0.06] bg-zinc-900/20 px-4 py-3">
            <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.12em] mb-2">
              Current Value
            </p>
            <p className="text-lg font-semibold text-white tabular-nums">
              {fmtAsset(currentValue)}
            </p>
            <p className="text-[11px] text-zinc-600 mt-1">
              {editingAsset.quantity || 0} units ×{" "}
              {fmtAsset(editingAsset.currentPrice || 0)}
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
              {
                label: "Currency",
                value: currencyInfo
                  ? `${currencyInfo.flag} ${currencyInfo.code} — ${currencyInfo.name}`
                  : assetCurrency,
              },
              ...(editingAsset.type !== "cash"
                ? [
                    {
                      label: "Current Price",
                      value: fmtAsset(editingAsset.currentPrice || 0),
                    },
                  ]
                : []),
              ...(editingAsset.type !== "cash"
                ? [
                    {
                      label: "Current Value",
                      value: fmtAsset(currentValue),
                    },
                  ]
                : []),
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
