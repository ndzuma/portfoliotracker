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
  Plus,
  ArrowLeft,
  ArrowRight,
  TrendUp,
  Coins,
  Money,
  Bank,
  Buildings,
  Diamond,
} from "@phosphor-icons/react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ResponsiveDialog } from "@/components/responsive-dialog";

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

export function V2AddAssetDialog({ portfolioId }: V2AddAssetDialogProps) {
  const [open, setOpen] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
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
    currency: "USD",
  });

  const createAsset = useMutation(api.assets.createAsset);

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
      currency: "USD",
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
      currency: form.type === "cash" ? form.currency : undefined,
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

  const canProceedFromDetails =
    form.name && (form.type === "cash" || form.type !== "stock" || true); // name is enough for details step

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

  // Determine if "Continue" should be disabled per step
  const isNextDisabled = () => {
    if (stepIdx === 1) return !form.name.trim();
    if (stepIdx === 2) return !canProceedFromPurchase;
    return false;
  };

  // ─── Footer ───────────────────────────────────────────────────
  const footer =
    stepIdx === 0 ? (
      // Type step — only cancel, no continue (selecting a type auto-advances)
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
            {/* Type badge — compact reminder */}
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

            {form.type === "cash" && (
              <div className="flex flex-col gap-2">
                <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
                  Currency
                </Label>
                <Select
                  value={form.currency}
                  onValueChange={(v) => setForm({ ...form, currency: v })}
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
            )}
          </div>
        )}

        {/* ─── Step 3: Purchase Info ───────────────────────── */}
        {stepIdx === 2 && (
          <div className="flex flex-col gap-5 pb-4">
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

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
                  {form.type === "cash" ? "Amount" : "Purchase Price"}
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-sm">
                    $
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

            {form.type !== "cash" && (
              <div className="grid grid-cols-2 gap-3">
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
                      $
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
                  $
                  {(
                    Number(form.purchasePrice) *
                      (form.type === "cash" || form.type === "real estate"
                        ? 1
                        : Number(form.quantity) || 0) +
                    (Number(form.fees) || 0)
                  ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-zinc-600 mt-0.5">
                  {form.type === "cash" || form.type === "real estate"
                    ? "1"
                    : form.quantity || "0"}{" "}
                  × $
                  {Number(form.purchasePrice).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                  {Number(form.fees) > 0 &&
                    ` + $${Number(form.fees).toLocaleString(undefined, { minimumFractionDigits: 2 })} fees`}
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
                ...(form.type === "cash"
                  ? [{ label: "Currency", value: form.currency }]
                  : []),
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
                  value: `$${Number(form.purchasePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
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
                        value: `$${Number(form.currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                      },
                    ]
                  : []),
                ...(Number(form.fees) > 0
                  ? [
                      {
                        label: "Fees",
                        value: `$${Number(form.fees).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
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
                $
                {(
                  Number(form.purchasePrice) *
                    (form.type === "cash" || form.type === "real estate"
                      ? 1
                      : Number(form.quantity) || 0) +
                  (Number(form.fees) || 0)
                ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        )}
      </ResponsiveDialog>
    </>
  );
}
