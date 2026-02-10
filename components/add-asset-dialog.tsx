"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  ArrowLeft,
  ArrowRight,
  TrendUp,
  Coins,
  Money,
  Bank,
  Buildings,
  Diamond,
  MagnifyingGlass,
  CaretDown,
  Check,
} from "@phosphor-icons/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import { useCurrency, useAvailableCurrencies } from "@/hooks/useCurrency";
import {
  CURRENCIES,
  searchCurrencies,
  currencySymbol,
  formatMoney,
  type CurrencyMeta,
} from "@/lib/currency";
import { motion, AnimatePresence } from "motion/react";

interface V2AddAssetDialogProps {
  portfolioId: string;
}

const ASSET_TYPES = [
  {
    id: "stock" as const,
    label: "Stock",
    icon: TrendUp,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    description: "Equities & ETFs",
  },
  {
    id: "crypto" as const,
    label: "Crypto",
    icon: Coins,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    description: "Digital assets",
  },
  {
    id: "cash" as const,
    label: "Cash",
    icon: Money,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    description: "Savings & deposits",
  },
  {
    id: "bond" as const,
    label: "Bond",
    icon: Bank,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    description: "Fixed income",
  },
  {
    id: "real estate" as const,
    label: "Real Estate",
    icon: Buildings,
    color: "text-teal-400",
    bgColor: "bg-teal-500/10",
    description: "Property & REITs",
  },
  {
    id: "commodity" as const,
    label: "Commodity",
    icon: Diamond,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    description: "Gold, oil, etc.",
  },
];

type AssetType =
  | "stock"
  | "crypto"
  | "cash"
  | "bond"
  | "real estate"
  | "commodity";

const STEPS = ["Type", "Details", "Purchase", "Notes", "Confirm"] as const;

/* ═══════════════════════════════════════════════════════════════════════════
   PORTAL CURRENCY PICKER — renders dropdown via portal so it escapes
   the dialog's overflow:hidden / overflow-y:auto clipping.
   ═══════════════════════════════════════════════════════════════════════════ */

function PortalCurrencyPicker({
  value,
  onChange,
  currencies,
}: {
  value: string;
  onChange: (code: string) => void;
  currencies?: CurrencyMeta[];
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

  const list = currencies ?? CURRENCIES;
  const filtered = searchCurrencies(query, list);
  const selected = list.find((c) => c.code === value);

  // Position the dropdown beneath the trigger
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
      // Reposition on scroll/resize
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

  // Focus search input when opened
  useEffect(() => {
    if (open && inputRef.current) {
      // Small delay to ensure portal is mounted
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
   ADD ASSET DIALOG
   ═══════════════════════════════════════════════════════════════════════════ */

export function V2AddAssetDialog({ portfolioId }: V2AddAssetDialogProps) {
  const [open, setOpen] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const { currency: baseCurrency, format: fmtBase } = useCurrency();
  const { currencies: dynamicCurrencies } = useAvailableCurrencies();
  const [form, setForm] = useState({
    symbol: "",
    name: "",
    type: "stock" as AssetType,
    quantity: "",
    purchasePrice: "",
    currentPrice: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    fees: "0",
    notes: "",
    currency: baseCurrency,
  });

  const createAsset = useMutation(api.assets.createAsset);

  // Currency-aware formatting helpers — use the ASSET's selected currency, not the user's base
  const assetCurrSym = currencySymbol(form.currency);
  const fmtAsset = useCallback(
    (amount: number) => formatMoney(amount, form.currency),
    [form.currency],
  );

  const reset = () => {
    setForm({
      symbol: "",
      name: "",
      type: "stock",
      quantity: "",
      purchasePrice: "",
      currentPrice: "",
      purchaseDate: new Date().toISOString().split("T")[0],
      fees: "0",
      notes: "",
      currency: baseCurrency,
    });
    setStepIdx(0);
  };

  const handleSubmit = () => {
    createAsset({
      portfolioId,
      name: form.name,
      symbol: form.symbol ? form.symbol.toUpperCase() : undefined,
      type: form.type,
      currentPrice:
        form.type === "cash"
          ? Number(form.purchasePrice)
          : form.currentPrice
            ? Number(form.currentPrice)
            : Number(form.purchasePrice),
      currency: form.currency || baseCurrency,
      notes: form.notes || undefined,
      quantity:
        form.type === "cash" || form.type === "real estate"
          ? 1
          : Number(form.quantity),
      purchasePrice: Number(form.purchasePrice),
      purchaseDate: new Date(form.purchaseDate).getTime(),
      fees: form.fees ? Number(form.fees) : 0,
      transactionNotes: form.notes || undefined,
    });
    reset();
    setOpen(false);
  };

  const canProceedFromPurchase =
    form.purchasePrice &&
    (form.type === "cash" || form.type === "real estate" || form.quantity);

  const goNext = () => {
    if (stepIdx < STEPS.length - 1) setStepIdx(stepIdx + 1);
  };
  const goBack = () => {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  };

  const selectedType = ASSET_TYPES.find((t) => t.id === form.type);

  const isNextDisabled = () => {
    if (stepIdx === 1) return !form.name.trim();
    if (stepIdx === 2) return !canProceedFromPurchase;
    return false;
  };

  // Clickable step navigation
  const handleStepClick = (idx: number) => {
    // Allow clicking on completed steps or current step
    if (idx <= stepIdx) {
      setStepIdx(idx);
    }
  };

  // Computed values
  const qty =
    form.type === "cash" || form.type === "real estate"
      ? 1
      : Number(form.quantity) || 0;
  const totalCost = Number(form.purchasePrice) * qty + (Number(form.fees) || 0);

  // Get currency info for display
  const currencyInfo = CURRENCIES.find((c) => c.code === form.currency);

  // ─── Footer ───────────────────────────────────────────────────
  const footer =
    stepIdx === 0 ? (
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => {
            reset();
            setOpen(false);
          }}
          className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <p className="text-[11px] text-zinc-700">Select an asset type</p>
      </div>
    ) : (
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => goBack()}
          className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <button
          onClick={() => {
            if (stepIdx === STEPS.length - 1) {
              handleSubmit();
            } else {
              goNext();
            }
          }}
          disabled={isNextDisabled()}
          className="px-5 py-2.5 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {stepIdx === STEPS.length - 1 ? (
            <>
              <Plus className="h-3.5 w-3.5" />
              Add Asset
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
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Asset
      </button>

      <ResponsiveDialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) reset();
        }}
        title="Add Asset"
        steps={[...STEPS]}
        currentStep={stepIdx}
        onStepClick={handleStepClick}
        footer={footer}
        maxWidth="500px"
      >
        {/* ─── Step 1: Type Selection ──────────────────────── */}
        {stepIdx === 0 && (
          <div className="pb-4">
            <div className="grid grid-cols-3 gap-3">
              {ASSET_TYPES.map((t) => {
                const Icon = t.icon;
                const isSelected = form.type === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setForm({ ...form, type: t.id });
                      setStepIdx(1);
                    }}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-150 ${
                      isSelected
                        ? "border-white/20 bg-white/[0.04]"
                        : "border-white/[0.06] hover:border-white/10 hover:bg-white/[0.02]"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.bgColor}`}
                    >
                      <Icon
                        className={`h-5 w-5 ${t.color}`}
                        weight={isSelected ? "fill" : "regular"}
                      />
                    </div>
                    <span className="text-xs font-medium text-white">
                      {t.label}
                    </span>
                    <span className="text-[10px] text-zinc-600 leading-tight text-center">
                      {t.description}
                    </span>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── Step 2: Asset Details ───────────────────────── */}
        {stepIdx === 1 && (
          <div className="flex flex-col gap-5 pb-4">
            {/* Type badge */}
            {selectedType && (
              <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/30 px-4 py-2.5">
                <div
                  className={`w-7 h-7 rounded-md flex items-center justify-center ${selectedType.bgColor}`}
                >
                  <selectedType.icon
                    className={`h-3.5 w-3.5 ${selectedType.color}`}
                    weight="fill"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-white">
                    {selectedType.label}
                  </p>
                </div>
                <button
                  onClick={() => setStepIdx(0)}
                  className="text-[11px] text-zinc-600 hover:text-white transition-colors"
                >
                  Change
                </button>
              </div>
            )}

            {/* Name */}
            <div className="flex flex-col gap-2">
              <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
                Name
              </Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={
                  form.type === "stock"
                    ? "Apple Inc."
                    : form.type === "crypto"
                      ? "Bitcoin"
                      : form.type === "real estate"
                        ? "Property name"
                        : "Asset name"
                }
                className="bg-zinc-900 border-white/[0.06] text-white h-10 text-sm"
                autoFocus
              />
            </div>

            {/* Symbol — stocks & crypto only */}
            {(form.type === "stock" || form.type === "crypto") && (
              <div className="flex flex-col gap-2">
                <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
                  Symbol
                </Label>
                <Input
                  value={form.symbol}
                  onChange={(e) => setForm({ ...form, symbol: e.target.value })}
                  placeholder={form.type === "stock" ? "AAPL" : "BTC"}
                  className="bg-zinc-900 border-white/[0.06] text-white h-10 text-sm"
                />
                <p className="text-xs text-zinc-600">
                  Used for automatic price tracking
                </p>
              </div>
            )}

            {/* Currency — portal picker for ALL asset types */}
            <div className="flex flex-col gap-2">
              <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
                Currency
              </Label>
              <PortalCurrencyPicker
                value={form.currency}
                onChange={(v) => setForm({ ...form, currency: v })}
                currencies={dynamicCurrencies}
              />
              <p className="text-xs text-zinc-600">
                {form.type === "cash"
                  ? "The currency denomination for this cash holding"
                  : "The currency this asset is denominated in"}
              </p>
            </div>
          </div>
        )}

        {/* ─── Step 3: Purchase Info ───────────────────────── */}
        {stepIdx === 2 && (
          <div className="flex flex-col gap-5 pb-4">
            {/* Quantity — not for cash/real estate */}
            {form.type !== "cash" && form.type !== "real estate" && (
              <div className="flex flex-col gap-2">
                <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
                  Quantity
                </Label>
                <Input
                  type="number"
                  step={form.type === "crypto" ? "0.000001" : "0.01"}
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: e.target.value })
                  }
                  placeholder={form.type === "stock" ? "100" : "0.25"}
                  className="bg-zinc-900 border-white/[0.06] text-white h-10 text-sm"
                  autoFocus
                />
              </div>
            )}

            {/* Purchase Price + Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
                  {form.type === "cash" ? "Amount" : "Purchase Price"}
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-sm">
                    {assetCurrSym}
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.purchasePrice}
                    onChange={(e) =>
                      setForm({ ...form, purchasePrice: e.target.value })
                    }
                    placeholder="0.00"
                    className="bg-zinc-900 border-white/[0.06] text-white h-10 text-sm pl-7"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
                  Date
                </Label>
                <Input
                  type="date"
                  value={form.purchaseDate}
                  onChange={(e) =>
                    setForm({ ...form, purchaseDate: e.target.value })
                  }
                  className="bg-zinc-900 border-white/[0.06] text-white h-10 text-sm"
                />
              </div>
            </div>

            {/* Current Price + Fees — not for cash */}
            {form.type !== "cash" && (
              <div className="grid grid-cols-2 gap-3">
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
                      step="0.01"
                      value={form.currentPrice}
                      onChange={(e) =>
                        setForm({ ...form, currentPrice: e.target.value })
                      }
                      placeholder="Auto from buy"
                      className="bg-zinc-900 border-white/[0.06] text-white h-10 text-sm pl-7"
                    />
                  </div>
                  <p className="text-xs text-zinc-600">
                    Leave empty to use purchase price
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
                    Fees
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-sm">
                      {assetCurrSym}
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.fees}
                      onChange={(e) =>
                        setForm({ ...form, fees: e.target.value })
                      }
                      placeholder="0.00"
                      className="bg-zinc-900 border-white/[0.06] text-white h-10 text-sm pl-7"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Live cost summary */}
            {form.purchasePrice && (
              <div className="rounded-lg border border-white/[0.06] bg-zinc-900/20 px-4 py-3">
                <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.12em] mb-1.5">
                  Total Cost
                </p>
                <p className="text-lg font-semibold text-white tabular-nums">
                  {fmtAsset(totalCost)}
                </p>
                <p className="text-[11px] text-zinc-600 mt-0.5">
                  {form.type === "cash" || form.type === "real estate"
                    ? "1"
                    : form.quantity || "0"}{" "}
                  × {fmtAsset(Number(form.purchasePrice))}
                  {Number(form.fees) > 0 &&
                    ` + ${fmtAsset(Number(form.fees))} fees`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ─── Step 4: Notes ──────────────────────────────── */}
        {stepIdx === 3 && (
          <div className="flex flex-col gap-4 pb-4">
            <div className="flex flex-col gap-2">
              <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
                Notes
              </Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={5}
                className="bg-zinc-900 border-white/[0.06] text-white resize-none text-sm leading-relaxed"
                placeholder="Investment thesis, research notes, reminders…"
                autoFocus
              />
              <p className="text-xs text-zinc-600">
                Optional — you can always add notes later
              </p>
            </div>
          </div>
        )}

        {/* ─── Step 5: Confirm ────────────────────────────── */}
        {stepIdx === 4 && (
          <div className="flex flex-col gap-5 pb-4">
            <div className="text-center py-1">
              <h3 className="text-white text-sm font-semibold mb-1">
                Review Asset
              </h3>
              <p className="text-zinc-500 text-xs">
                Confirm the details before adding
              </p>
            </div>

            <div className="rounded-lg border border-white/[0.06] overflow-hidden">
              {[
                {
                  label: "Type",
                  value: form.type.charAt(0).toUpperCase() + form.type.slice(1),
                },
                { label: "Name", value: form.name },
                ...(form.symbol
                  ? [{ label: "Symbol", value: form.symbol.toUpperCase() }]
                  : []),
                {
                  label: "Currency",
                  value: currencyInfo
                    ? `${currencyInfo.flag} ${currencyInfo.code} — ${currencyInfo.name}`
                    : form.currency,
                },
                {
                  label:
                    form.type === "cash" || form.type === "real estate"
                      ? "Units"
                      : "Quantity",
                  value:
                    form.type === "cash" || form.type === "real estate"
                      ? "1"
                      : form.quantity,
                },
                {
                  label: form.type === "cash" ? "Amount" : "Purchase Price",
                  value: fmtAsset(Number(form.purchasePrice)),
                },
                {
                  label: "Date",
                  value: new Date(form.purchaseDate).toLocaleDateString(
                    "en-US",
                    { year: "numeric", month: "short", day: "numeric" },
                  ),
                },
                ...(form.type !== "cash" && form.currentPrice
                  ? [
                      {
                        label: "Current Price",
                        value: fmtAsset(Number(form.currentPrice)),
                      },
                    ]
                  : []),
                ...(Number(form.fees) > 0
                  ? [
                      {
                        label: "Fees",
                        value: fmtAsset(Number(form.fees)),
                      },
                    ]
                  : []),
                ...(form.notes
                  ? [
                      {
                        label: "Notes",
                        value:
                          form.notes.length > 60
                            ? form.notes.slice(0, 60) + "…"
                            : form.notes,
                      },
                    ]
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
                  <span className="text-sm text-white font-medium text-right max-w-[55%] leading-snug">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Total cost highlight */}
            <div className="rounded-lg border border-white/[0.06] bg-zinc-900/20 px-4 py-3 text-center">
              <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.12em] mb-1">
                Total Investment
              </p>
              <p className="text-xl font-semibold text-white tabular-nums">
                {fmtAsset(totalCost)}
              </p>
            </div>
          </div>
        )}
      </ResponsiveDialog>
    </>
  );
}
