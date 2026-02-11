"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ResponsiveDialog } from "@/components/responsive-dialog";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Percent,
  Plus,
  PencilSimple,
  Trash,
  ArrowLeft,
  ArrowRight,
  ArrowsLeftRight,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { useCurrency } from "@/hooks/useCurrency";
import { currencySymbol, formatMoney } from "@/lib/currency";
import { motion } from "motion/react";

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES & CONSTANTS
   ═══════════════════════════════════════════════════════════════════════════ */

interface V2TransactionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  assetId: string;
  assetName: string;
  assetType: string;
  assetSymbol?: string;
  assetCurrency?: string;
}

interface Transaction {
  _id: Id<"transactions">;
  assetId: Id<"assets">;
  type: "buy" | "sell" | "dividend";
  date: number;
  quantity?: number;
  price?: number;
  fees?: number;
  notes?: string;
  _creationTime: number;
}

type Step = "list" | "type" | "details" | "confirm";

const STEP_LABELS = ["Type", "Details", "Confirm"] as const;

const TYPE_STYLES: Record<
  string,
  {
    icon: typeof ArrowDownLeft;
    label: string;
    color: string;
    description: string;
  }
> = {
  buy: {
    icon: ArrowDownLeft,
    label: "Buy",
    color: "text-emerald-400 bg-emerald-500/10",
    description: "Purchase units",
  },
  sell: {
    icon: ArrowUpRight,
    label: "Sell",
    color: "text-red-400 bg-red-500/10",
    description: "Sell holdings",
  },
  dividend: {
    icon: Percent,
    label: "Dividend",
    color: "text-amber-400 bg-amber-500/10",
    description: "Income received",
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateInput(timestamp: number) {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ─── FX Conversion Badge ─────────────────────────────────────────── */
function FxBadge({
  assetCurrency,
  displayCurrency,
}: {
  assetCurrency: string;
  displayCurrency: string;
}) {
  if (
    !assetCurrency ||
    !displayCurrency ||
    assetCurrency.toUpperCase() === displayCurrency.toUpperCase()
  ) {
    return null;
  }

  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/8 border border-amber-500/15 text-[9px] font-semibold text-amber-500/80 uppercase tracking-wider whitespace-nowrap">
      <ArrowsLeftRight className="h-2.5 w-2.5" />
      {assetCurrency}→{displayCurrency}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TRANSACTION DIALOG — ResponsiveDialog rebuild
   ═══════════════════════════════════════════════════════════════════════════ */

export function V2TransactionDialog({
  isOpen,
  onOpenChange,
  assetId,
  assetName,
  assetType,
  assetSymbol,
  assetCurrency: assetCurrencyProp,
}: V2TransactionDialogProps) {
  const [step, setStep] = useState<Step>("list");
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [form, setForm] = useState({
    type: "buy" as "buy" | "sell" | "dividend",
    date: new Date().toISOString().split("T")[0],
    quantity: "",
    price: "",
    fees: "0",
    notes: "",
  });

  // ── Currency context ─────────────────────────────────────────────
  const { format: fmtDisplay, currency: displayCurrency } = useCurrency();
  const assetCurrency = (assetCurrencyProp || "USD").toUpperCase();
  const assetCurrSym = currencySymbol(assetCurrency);
  const isConverted = assetCurrency !== displayCurrency.toUpperCase();

  // Format in asset's native currency
  const fmtAsset = useCallback(
    (amount: number) => formatMoney(amount, assetCurrency),
    [assetCurrency],
  );

  // ── Convex queries & mutations ───────────────────────────────────
  const transactions = useQuery(api.transactions.getAssetTransactions, {
    assetId: assetId as Id<"assets">,
  });

  const stats = useQuery(api.transactions.getAssetTransactionStats, {
    assetId: assetId as Id<"assets">,
    displayCurrency: displayCurrency,
  });

  const createTransaction = useMutation(api.transactions.createTransaction);
  const updateTransaction = useMutation(api.transactions.updateTransaction);
  const deleteTransaction = useMutation(api.transactions.deleteTransaction);

  // ── Reset on open ────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setStep("list");
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setForm({
      type: "buy",
      date: new Date().toISOString().split("T")[0],
      quantity: "",
      price: "",
      fees: "0",
      notes: "",
    });
    setEditingTx(null);
  };

  // ── Handlers ─────────────────────────────────────────────────────
  const handleAdd = () => {
    try {
      createTransaction({
        assetId: assetId as Id<"assets">,
        type: form.type,
        date: new Date(form.date).getTime(),
        quantity: form.type !== "dividend" ? Number(form.quantity) : undefined,
        price: Number(form.price),
        fees: form.fees ? Number(form.fees) : 0,
        notes: form.notes || undefined,
      });
      toast.success("Transaction added");
      setStep("list");
      resetForm();
    } catch {
      toast.error("Failed to add transaction");
    }
  };

  const handleEdit = () => {
    if (!editingTx) return;
    try {
      updateTransaction({
        transactionId: editingTx._id,
        type: form.type,
        date: new Date(form.date).getTime(),
        quantity: form.type !== "dividend" ? Number(form.quantity) : undefined,
        price: Number(form.price),
        fees: Number(form.fees),
        notes: form.notes || undefined,
      });
      toast.success("Transaction updated");
      setStep("list");
      resetForm();
    } catch {
      toast.error("Failed to update");
    }
  };

  const handleDelete = (id: Id<"transactions">) => {
    if (confirm("Delete this transaction?")) {
      try {
        deleteTransaction({ transactionId: id });
        toast.success("Deleted");
      } catch {
        toast.error("Failed to delete");
      }
    }
  };

  const openEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setForm({
      type: tx.type,
      date: formatDateInput(tx.date),
      quantity: tx.quantity?.toString() || "",
      price: tx.price?.toString() || "",
      fees: (tx.fees || 0).toString(),
      notes: tx.notes || "",
    });
    setStep("details");
  };

  const canSubmit =
    form.date && form.price && (form.type === "dividend" || form.quantity);

  // ── Step navigation ──────────────────────────────────────────────
  const stepToIndex = (s: Step): number => {
    if (s === "type") return 0;
    if (s === "details") return 1;
    if (s === "confirm") return 2;
    return 0;
  };

  const handleStepClick = (idx: number) => {
    const steps: Step[] = ["type", "details", "confirm"];
    if (idx <= stepToIndex(step)) {
      setStep(steps[idx]);
    }
  };

  // ── Computed form values ─────────────────────────────────────────
  const totalAmount =
    form.type !== "dividend" && form.quantity && form.price
      ? Number(form.quantity) * Number(form.price) + (Number(form.fees) || 0)
      : form.type === "dividend" && form.price
        ? Number(form.price)
        : 0;

  // ── Footer ───────────────────────────────────────────────────────
  const footer = (() => {
    if (step === "list") {
      return (
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              resetForm();
              setStep("type");
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Transaction
          </button>
        </div>
      );
    }

    if (step === "type") {
      return (
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => {
              resetForm();
              setStep("list");
            }}
            className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <p className="text-[11px] text-zinc-700">Select a transaction type</p>
        </div>
      );
    }

    if (step === "details") {
      return (
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setStep("type")}
            className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <button
            onClick={() => setStep("confirm")}
            disabled={!canSubmit}
            className="px-5 py-2.5 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Review
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      );
    }

    // confirm
    return (
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setStep("details")}
          className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <button
          onClick={editingTx ? handleEdit : handleAdd}
          className="px-5 py-2.5 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors flex items-center gap-2"
        >
          <Plus className="h-3.5 w-3.5" />
          {editingTx ? "Update Transaction" : "Add Transaction"}
        </button>
      </div>
    );
  })();

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <ResponsiveDialog
      open={isOpen}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) resetForm();
      }}
      title={
        step === "list"
          ? "Transactions"
          : editingTx
            ? "Edit Transaction"
            : "Add Transaction"
      }
      steps={step !== "list" ? [...STEP_LABELS] : undefined}
      currentStep={step !== "list" ? stepToIndex(step) : 0}
      onStepClick={step !== "list" ? handleStepClick : undefined}
      footer={footer}
      maxWidth="640px"
    >
      {/* ══════════════════════════════════════════════════════════════
          LIST VIEW
          ══════════════════════════════════════════════════════════════ */}
      {step === "list" && (
        <div className="flex flex-col gap-0 -mx-6 -mt-5">
          {/* ─── List Header ─── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <div>
              <h2 className="text-white text-sm font-semibold">Transactions</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[11px] text-zinc-600">
                  {assetSymbol && `${assetSymbol} · `}
                  {assetName}
                </p>
                {isConverted && (
                  <FxBadge
                    assetCurrency={assetCurrency}
                    displayCurrency={displayCurrency}
                  />
                )}
              </div>
            </div>
          </div>

          {/* ─── Stats Bar ─── */}
          {stats && stats.totalTransactions > 0 && (
            <div>
              <div className="grid grid-cols-4 border-b border-white/[0.06]">
                {[
                  {
                    label: "Quantity",
                    value: stats.currentQuantity?.toLocaleString() || "0",
                  },
                  {
                    label: "Avg Buy",
                    value:
                      stats.avgBuyPrice !== undefined
                        ? fmtAsset(stats.avgBuyPrice)
                        : "--",
                  },
                  {
                    label: "Total Invested",
                    value:
                      stats.totalBuyAmount !== undefined
                        ? fmtAsset(stats.totalBuyAmount)
                        : "--",
                  },
                  {
                    label: "Transactions",
                    value: String(stats.totalTransactions || 0),
                  },
                ].map((s) => (
                  <div key={s.label} className="px-3 py-3 text-center">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">
                      {s.label}
                    </p>
                    <p className="text-sm font-semibold text-white tabular-nums">
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Converted net value summary row */}
              {isConverted &&
                stats.convertedNetValue !== null &&
                stats.convertedNetValue !== undefined && (
                  <div className="flex items-center justify-center gap-2 px-6 py-2 border-b border-white/[0.06] bg-amber-500/[0.02]">
                    <ArrowsLeftRight className="h-3 w-3 text-amber-500/50" />
                    <p className="text-[11px] text-amber-500/70">
                      Net investment ≈{" "}
                      <span className="font-semibold text-amber-500/90 tabular-nums">
                        {fmtDisplay(stats.convertedNetValue)}
                      </span>{" "}
                      in {displayCurrency}
                    </p>
                  </div>
                )}
            </div>
          )}

          {/* ─── Transaction Rows ─── */}
          <div className="overflow-y-auto" style={{ maxHeight: "320px" }}>
            {!transactions || transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                  <ArrowDownLeft className="h-5 w-5 text-zinc-700" />
                </div>
                <p className="text-zinc-500 text-sm mb-1">
                  No transactions yet
                </p>
                <p className="text-zinc-700 text-xs">
                  Add your first buy, sell, or dividend
                </p>
              </div>
            ) : (
              transactions.map((tx: Transaction) => {
                const style = TYPE_STYLES[tx.type] || TYPE_STYLES.buy;
                const Icon = style.icon;
                return (
                  <div
                    key={tx._id}
                    className="group flex items-center gap-3 px-6 py-3 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Type icon */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${style.color}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium capitalize">
                        {tx.type}
                      </p>
                      <p className="text-[11px] text-zinc-600">
                        {formatDate(tx.date)}
                      </p>
                    </div>

                    {/* Amounts — in asset's native currency */}
                    <div className="text-right min-w-[80px]">
                      <p className="text-sm text-zinc-300 tabular-nums">
                        {tx.quantity
                          ? `${tx.quantity.toLocaleString()} @ `
                          : ""}
                        {tx.price !== undefined ? fmtAsset(tx.price) : "--"}
                      </p>
                      {tx.quantity && tx.price && (
                        <p className="text-[10px] text-zinc-600 tabular-nums">
                          {fmtAsset(tx.quantity * tx.price)} total
                        </p>
                      )}
                    </div>

                    {/* Hover-reveal actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(tx)}
                        className="p-1.5 rounded-md text-zinc-600 hover:text-white hover:bg-white/[0.06] transition-all"
                        title="Edit"
                      >
                        <PencilSimple className="h-3.5 w-3.5" weight="bold" />
                      </button>
                      <button
                        onClick={() => handleDelete(tx._id)}
                        className="p-1.5 rounded-md text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Delete"
                      >
                        <Trash className="h-3.5 w-3.5" weight="bold" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TYPE STEP — 3-card grid, auto-advances on click
          ══════════════════════════════════════════════════════════════ */}
      {step === "type" && (
        <div className="pb-4">
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(TYPE_STYLES).map(([type, style]) => {
              const Icon = style.icon;
              const isSelected = form.type === type;
              return (
                <button
                  key={type}
                  onClick={() => {
                    setForm({
                      ...form,
                      type: type as "buy" | "sell" | "dividend",
                    });
                    // Auto-advance to details
                    setStep("details");
                  }}
                  className={`relative flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all duration-150 ${
                    isSelected
                      ? "border-white/20 bg-white/[0.04]"
                      : "border-white/[0.06] hover:border-white/10 hover:bg-white/[0.02]"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${style.color}`}
                  >
                    <Icon
                      className="h-5 w-5"
                      weight={isSelected ? "fill" : "regular"}
                    />
                  </div>
                  <span className="text-xs font-medium text-white capitalize">
                    {style.label}
                  </span>
                  <span className="text-[10px] text-zinc-600 leading-tight text-center">
                    {style.description}
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

      {/* ══════════════════════════════════════════════════════════════
          DETAILS STEP
          ══════════════════════════════════════════════════════════════ */}
      {step === "details" && (
        <div className="flex flex-col gap-4 pb-4">
          {/* Currency indicator — read-only, informational */}
          <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-zinc-900/30 px-4 py-2.5">
            <div
              className={`w-7 h-7 rounded-md flex items-center justify-center ${TYPE_STYLES[form.type]?.color || "bg-zinc-500/10 text-zinc-400"}`}
            >
              {(() => {
                const Icon = TYPE_STYLES[form.type]?.icon || ArrowDownLeft;
                return <Icon className="h-3.5 w-3.5" weight="fill" />;
              })()}
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-white capitalize">
                {form.type}
              </p>
              <p className="text-[10px] text-zinc-600">
                All values in {assetCurrency} ({assetCurrSym})
              </p>
            </div>
            <button
              onClick={() => setStep("type")}
              className="text-[11px] text-zinc-600 hover:text-white transition-colors"
            >
              Change
            </button>
          </div>

          {/* Date + Fees row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
                Date
              </Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="bg-zinc-900 border-white/[0.06] text-white h-10 text-sm"
              />
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
                  onChange={(e) => setForm({ ...form, fees: e.target.value })}
                  placeholder="0.00"
                  className="bg-zinc-900 border-white/[0.06] text-white h-10 text-sm pl-7"
                />
              </div>
            </div>
          </div>

          {/* Quantity — not for dividends */}
          {form.type !== "dividend" && (
            <div className="flex flex-col gap-2">
              <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
                Quantity
              </Label>
              <Input
                type="number"
                step={assetType === "crypto" ? "0.000001" : "0.01"}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder={assetType === "crypto" ? "0.5" : "10"}
                className="bg-zinc-900 border-white/[0.06] text-white h-10 text-sm"
                autoFocus
              />
            </div>
          )}

          {/* Price per unit / Dividend amount */}
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
              {form.type === "dividend" ? "Dividend Amount" : "Price Per Unit"}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-sm">
                {assetCurrSym}
              </span>
              <Input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder={
                  form.type === "dividend"
                    ? "100.00"
                    : assetType === "crypto"
                      ? "50000.00"
                      : "150.00"
                }
                className="bg-zinc-900 border-white/[0.06] text-white h-10 text-sm pl-7"
                autoFocus={form.type === "dividend"}
              />
            </div>
          </div>

          {/* Live total summary */}
          {totalAmount > 0 && (
            <div className="rounded-lg border border-white/[0.06] bg-zinc-900/20 px-4 py-3">
              <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.12em] mb-1.5">
                Total
              </p>
              <p className="text-lg font-semibold text-white tabular-nums">
                {fmtAsset(totalAmount)}
              </p>
              {form.type !== "dividend" && form.quantity && form.price && (
                <p className="text-[11px] text-zinc-600 mt-0.5 tabular-nums">
                  {form.quantity} × {fmtAsset(Number(form.price))}
                  {Number(form.fees) > 0 &&
                    ` + ${fmtAsset(Number(form.fees))} fees`}
                </p>
              )}
              {/* Converted equivalent when currencies differ */}
              {isConverted && totalAmount > 0 && (
                <p className="text-[10px] text-amber-500/60 mt-1 tabular-nums">
                  ≈ {fmtDisplay(totalAmount)} in {displayCurrency}
                  <span className="text-amber-500/40 ml-1">(indicative)</span>
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
              Notes (optional)
            </Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Additional details..."
              rows={2}
              className="bg-zinc-900 border-white/[0.06] text-white resize-none text-sm"
            />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          CONFIRM STEP
          ══════════════════════════════════════════════════════════════ */}
      {step === "confirm" && (
        <div className="flex flex-col gap-5 pb-4">
          <div className="text-center py-1">
            <h3 className="text-white text-sm font-semibold mb-1">
              {editingTx ? "Review Changes" : "Review Transaction"}
            </h3>
            <p className="text-zinc-500 text-xs">
              Confirm the details before {editingTx ? "updating" : "adding"}
            </p>
          </div>

          <div className="rounded-lg border border-white/[0.06] overflow-hidden">
            {[
              {
                label: "Type",
                value: form.type.charAt(0).toUpperCase() + form.type.slice(1),
              },
              {
                label: "Date",
                value: new Date(form.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }),
              },
              ...(form.type !== "dividend"
                ? [{ label: "Quantity", value: form.quantity }]
                : []),
              {
                label: form.type === "dividend" ? "Amount" : "Price",
                value: fmtAsset(Number(form.price)),
              },
              ...(form.type !== "dividend" && form.quantity
                ? [
                    {
                      label: "Total",
                      value: fmtAsset(
                        Number(form.quantity) * Number(form.price),
                      ),
                    },
                  ]
                : []),
              ...(form.fees !== "0" && Number(form.fees) > 0
                ? [
                    {
                      label: "Fees",
                      value: fmtAsset(Number(form.fees)),
                    },
                  ]
                : []),
              {
                label: "Currency",
                value: assetCurrency,
              },
              ...(form.notes
                ? [
                    {
                      label: "Notes",
                      value:
                        form.notes.length > 80
                          ? form.notes.slice(0, 80) + "…"
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
                <span className="text-sm text-white font-medium text-right max-w-[55%] leading-snug break-words">
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Grand total with conversion */}
          {totalAmount > 0 && (
            <div className="rounded-lg border border-white/[0.06] bg-zinc-900/20 px-4 py-3 text-center">
              <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.12em] mb-1">
                {form.type === "dividend" ? "Dividend Amount" : "Total Cost"}
              </p>
              <p className="text-xl font-semibold text-white tabular-nums">
                {fmtAsset(totalAmount)}
              </p>
              {isConverted && (
                <p className="text-[11px] text-amber-500/60 mt-1 tabular-nums">
                  ≈ {fmtDisplay(totalAmount)} in {displayCurrency}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </ResponsiveDialog>
  );
}
