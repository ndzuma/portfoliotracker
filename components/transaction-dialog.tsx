"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Percent,
  Plus,
  PencilSimple,
  Trash,
  ArrowLeft,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { useCurrency } from "@/hooks/useCurrency";
import { motion } from "motion/react";

interface V2TransactionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  assetId: string;
  assetName: string;
  assetType: string;
  assetSymbol?: string;
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

const TYPE_STYLES: Record<
  string,
  { icon: typeof ArrowDownLeft; label: string; color: string }
> = {
  buy: {
    icon: ArrowDownLeft,
    label: "Buy",
    color: "text-emerald-400 bg-emerald-500/10",
  },
  sell: {
    icon: ArrowUpRight,
    label: "Sell",
    color: "text-red-400 bg-red-500/10",
  },
  dividend: {
    icon: Percent,
    label: "Dividend",
    color: "text-amber-400 bg-amber-500/10",
  },
};

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

/* ─── Clickable Step Indicator ──────────────────────────────────────── */
function StepIndicator({
  steps,
  currentStep,
  onStepClick,
}: {
  steps: string[];
  currentStep: string;
  onStepClick: (step: string) => void;
}) {
  const stepMap = ["type", "details", "confirm"];
  const currentIdx = stepMap.indexOf(currentStep);

  return (
    <div className="flex items-stretch border-b border-white/[0.06] relative">
      {steps.map((label, i) => {
        const isActive = i === currentIdx;
        const isDone = i < currentIdx;
        const isClickable = isDone || isActive;

        return (
          <div
            key={label}
            className="flex-1 relative flex items-center justify-center"
          >
            <button
              type="button"
              disabled={!isClickable}
              onClick={() => {
                if (isClickable) onStepClick(stepMap[i]);
              }}
              className={`w-full py-3.5 text-center text-[11px] font-medium uppercase tracking-[0.12em] transition-colors duration-200 select-none ${
                isActive
                  ? "text-white"
                  : isDone
                    ? "text-zinc-500 hover:text-zinc-300"
                    : "text-zinc-700"
              } ${isClickable ? "cursor-pointer" : "cursor-default"}`}
            >
              {label}
            </button>
            {/* Active step underline */}
            {isActive && (
              <motion.div
                layoutId="tx-step-indicator"
                className="absolute bottom-0 left-0 right-0 h-[2px]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 0%, var(--primary) 20%, var(--primary) 80%, transparent 100%)",
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 35,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function V2TransactionDialog({
  isOpen,
  onOpenChange,
  assetId,
  assetName,
  assetType,
  assetSymbol,
}: V2TransactionDialogProps) {
  const [step, setStep] = useState<"list" | "type" | "details" | "confirm">(
    "list",
  );
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [form, setForm] = useState({
    type: "buy" as "buy" | "sell" | "dividend",
    date: new Date().toISOString().split("T")[0],
    quantity: "",
    price: "",
    fees: "0",
    notes: "",
  });

  const { format, symbol: currSymbol } = useCurrency();

  const transactions = useQuery(api.transactions.getAssetTransactions, {
    assetId: assetId as Id<"assets">,
  });
  const stats = useQuery(api.transactions.getAssetTransactionStats, {
    assetId: assetId as Id<"assets">,
  });

  const createTransaction = useMutation(api.transactions.createTransaction);
  const updateTransaction = useMutation(api.transactions.updateTransaction);
  const deleteTransaction = useMutation(api.transactions.deleteTransaction);

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

  // Handle clickable step navigation
  const handleStepClick = (targetStep: string) => {
    const validStep = targetStep as "type" | "details" | "confirm";
    setStep(validStep);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-zinc-950 border-white/[0.08] p-0 overflow-hidden max-h-[85vh] flex flex-col">
        {step !== "list" && (
          <DialogTitle className="sr-only">
            {editingTx ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
        )}

        {/* ─── Clickable Step Indicator (non-list views) ─── */}
        {step !== "list" && (
          <StepIndicator
            steps={["Type", "Details", "Confirm"]}
            currentStep={step}
            onStepClick={handleStepClick}
          />
        )}

        {/* ─── List Header ─── */}
        {step === "list" && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
            <div>
              <DialogTitle className="text-white text-sm font-semibold">
                Transactions
              </DialogTitle>
              <p className="text-[11px] text-zinc-600 mt-0.5">
                {assetSymbol && `${assetSymbol} · `}
                {assetName}
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setStep("type");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors"
            >
              <Plus className="h-3 w-3" /> Add
            </button>
          </div>
        )}

        {/* ─── Stats Bar ─── */}
        {step === "list" && stats && (
          <div className="grid grid-cols-4 border-b border-white/[0.06] shrink-0">
            {[
              {
                label: "Quantity",
                value: stats.currentQuantity?.toLocaleString() || "0",
              },
              {
                label: "Avg Buy",
                value:
                  stats.avgBuyPrice !== undefined
                    ? format(stats.avgBuyPrice)
                    : "--",
              },
              {
                label: "Total Invested",
                value:
                  stats.totalBuyAmount !== undefined
                    ? format(stats.totalBuyAmount)
                    : "--",
              },
              {
                label: "Transactions",
                value: String(stats.totalTransactions || 0),
              },
            ].map((s) => (
              <div key={s.label} className="px-4 py-3 text-center">
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">
                  {s.label}
                </p>
                <p className="text-sm font-semibold text-white">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ─── Content ─── */}
        <div className="flex-1 overflow-y-auto">
          {/* ══════════ LIST VIEW ══════════ */}
          {step === "list" && (
            <div>
              {!transactions || transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-zinc-600 text-sm mb-4">
                    No transactions recorded yet.
                  </p>
                  <button
                    onClick={() => {
                      resetForm();
                      setStep("type");
                    }}
                    className="text-xs text-zinc-400 hover:text-white transition-colors"
                  >
                    Add your first transaction
                  </button>
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
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${style.color}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium capitalize">
                          {tx.type}
                        </p>
                        <p className="text-[11px] text-zinc-600">
                          {formatDate(tx.date)}
                        </p>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className="text-sm text-zinc-300">
                          {tx.quantity
                            ? `${tx.quantity.toLocaleString()} @ `
                            : ""}
                          {tx.price !== undefined ? format(tx.price) : "--"}
                        </p>
                        {tx.quantity && tx.price && (
                          <p className="text-[10px] text-zinc-600">
                            {format(tx.quantity * tx.price)} total
                          </p>
                        )}
                      </div>

                      {/* Inline action buttons — visible on hover */}
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
          )}

          {/* ══════════ STEP 1: TYPE SELECTION ══════════ */}
          {step === "type" && (
            <div className="px-6 pb-6 pt-4">
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
                        setStep("details");
                      }}
                      className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all ${
                        isSelected
                          ? "border-white/[0.15] bg-white/[0.04]"
                          : "border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.02]"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${style.color}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium text-zinc-300 capitalize">
                        {style.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between gap-2 mt-4">
                <button
                  onClick={() => {
                    resetForm();
                    onOpenChange(false);
                  }}
                  className="px-4 py-1.5 text-sm text-zinc-500 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <div></div>
              </div>
            </div>
          )}

          {/* ══════════ STEP 2: DETAILS ══════════ */}
          {step === "details" && (
            <div className="px-6 pb-6 pt-4 flex flex-col gap-4">
              {/* Type indicator — clickable to go back */}
              <button
                onClick={() => setStep("type")}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition-colors self-start -mt-1 mb-1"
              >
                <ArrowLeft className="h-3 w-3" /> Change type
              </button>

              {/* Date + Fees row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-zinc-400">Date</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="bg-zinc-900 border-white/[0.06] text-white h-9"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-zinc-400">Fees</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-xs">
                      {currSymbol}
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.fees}
                      onChange={(e) =>
                        setForm({ ...form, fees: e.target.value })
                      }
                      placeholder="0.00"
                      className="bg-zinc-900 border-white/[0.06] text-white h-9 pl-7"
                    />
                  </div>
                </div>
              </div>

              {/* Quantity — not for dividends */}
              {form.type !== "dividend" && (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-zinc-400">Quantity</Label>
                  <Input
                    type="number"
                    step={assetType === "crypto" ? "0.000001" : "0.01"}
                    value={form.quantity}
                    onChange={(e) =>
                      setForm({ ...form, quantity: e.target.value })
                    }
                    placeholder={assetType === "crypto" ? "0.5" : "10"}
                    className="bg-zinc-900 border-white/[0.06] text-white h-9"
                  />
                </div>
              )}

              {/* Price */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-zinc-400">
                  {form.type === "dividend"
                    ? "Dividend Amount"
                    : "Price Per Unit"}
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-xs">
                    {currSymbol}
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    placeholder={
                      form.type === "dividend"
                        ? "100.00"
                        : assetType === "crypto"
                          ? "50000.00"
                          : "150.00"
                    }
                    className="bg-zinc-900 border-white/[0.06] text-white h-9 pl-7"
                  />
                </div>
              </div>

              {/* Live cost summary */}
              {form.price && form.type !== "dividend" && form.quantity && (
                <div className="rounded-lg border border-white/[0.06] bg-zinc-900/20 px-4 py-3">
                  <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-[0.12em] mb-1">
                    Total
                  </p>
                  <p className="text-base font-semibold text-white tabular-nums">
                    {format(
                      Number(form.quantity) * Number(form.price) +
                        (Number(form.fees) || 0),
                    )}
                  </p>
                  <p className="text-[10px] text-zinc-600 mt-0.5">
                    {form.quantity} × {format(Number(form.price))}
                    {Number(form.fees) > 0 &&
                      ` + ${format(Number(form.fees))} fees`}
                  </p>
                </div>
              )}

              {/* Notes */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-zinc-400">
                  Notes (optional)
                </Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Additional details..."
                  rows={2}
                  className="bg-zinc-900 border-white/[0.06] text-white resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 mt-4">
                <button
                  onClick={() => {
                    resetForm();
                    onOpenChange(false);
                  }}
                  className="px-4 py-1.5 text-sm text-zinc-500 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStep("type")}
                    className="px-3 py-1.5 text-sm text-zinc-500 hover:text-white transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep("confirm")}
                    disabled={!canSubmit}
                    className="px-4 py-1.5 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Review
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════ STEP 3: CONFIRMATION ══════════ */}
          {step === "confirm" && (
            <div className="px-6 pb-6 pt-4 flex flex-col gap-4">
              <div className="text-center py-1">
                <h3 className="text-white text-sm font-semibold mb-1">
                  {editingTx ? "Review Changes" : "Review Transaction"}
                </h3>
                <p className="text-zinc-500 text-xs">
                  Confirm the details before {editingTx ? "updating" : "adding"}
                </p>
              </div>

              <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
                {[
                  {
                    label: "Type",
                    value:
                      form.type.charAt(0).toUpperCase() + form.type.slice(1),
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
                    value: format(Number(form.price)),
                  },
                  ...(form.type !== "dividend" && form.quantity
                    ? [
                        {
                          label: "Total",
                          value: format(
                            Number(form.quantity) * Number(form.price),
                          ),
                        },
                      ]
                    : []),
                  ...(form.fees !== "0" && Number(form.fees) > 0
                    ? [
                        {
                          label: "Fees",
                          value: format(Number(form.fees)),
                        },
                      ]
                    : []),
                  ...(form.notes
                    ? [{ label: "Notes", value: form.notes }]
                    : []),
                ].map((row, i, arr) => (
                  <div
                    key={row.label}
                    className={`flex items-start justify-between px-4 py-3 ${
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

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 mt-4">
                <button
                  onClick={() => {
                    resetForm();
                    onOpenChange(false);
                  }}
                  className="px-4 py-1.5 text-sm text-zinc-500 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStep("details")}
                    className="px-3 py-1.5 text-sm text-zinc-500 hover:text-white transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={editingTx ? handleEdit : handleAdd}
                    className="px-4 py-1.5 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors"
                  >
                    {editingTx ? "Update Transaction" : "Add Transaction"}
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
