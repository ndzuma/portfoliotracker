"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  TrendingUp,
  Coins,
  Banknote,
  Landmark,
  Building2,
  Gem,
  ArrowLeft,
} from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface V2AddAssetDialogProps {
  portfolioId: string;
}

const ASSET_TYPES = [
  {
    id: "stock" as const,
    label: "Stock",
    icon: TrendingUp,
    color: "text-blue-400 bg-blue-500/10",
  },
  {
    id: "crypto" as const,
    label: "Crypto",
    icon: Coins,
    color: "text-amber-400 bg-amber-500/10",
  },
  {
    id: "cash" as const,
    label: "Cash",
    icon: Banknote,
    color: "text-emerald-400 bg-emerald-500/10",
  },
  {
    id: "bond" as const,
    label: "Bond",
    icon: Landmark,
    color: "text-purple-400 bg-purple-500/10",
  },
  {
    id: "real estate" as const,
    label: "Real Estate",
    icon: Building2,
    color: "text-teal-400 bg-teal-500/10",
  },
  {
    id: "commodity" as const,
    label: "Commodity",
    icon: Gem,
    color: "text-orange-400 bg-orange-500/10",
  },
];

type AssetType =
  | "stock"
  | "crypto"
  | "cash"
  | "bond"
  | "real estate"
  | "commodity";

export function V2AddAssetDialog({ portfolioId }: V2AddAssetDialogProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"type" | "details" | "confirm">("type");
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
    setStep("type");
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

  const canProceed =
    form.name &&
    form.purchasePrice &&
    (form.type === "cash" || form.type === "real estate" || form.quantity);
  const selectedType = ASSET_TYPES.find((t) => t.id === form.type);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add Asset
      </button>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) reset();
        }}
      >
        <DialogContent className="sm:max-w-[480px] bg-zinc-950 border-white/[0.08] p-0 overflow-hidden">
          {/* Step indicator */}
          <div className="flex items-center gap-0 border-b border-white/[0.06]">
            {["Type", "Details", "Confirm"].map((s, i) => {
              const stepMap = ["type", "details", "confirm"];
              const currentIdx = stepMap.indexOf(step);
              const isActive = i === currentIdx;
              const isDone = i < currentIdx;
              return (
                <div
                  key={s}
                  className={`flex-1 py-3 text-center text-[11px] font-medium uppercase tracking-wider transition-colors ${isActive ? "text-white bg-white/[0.04]" : isDone ? "text-zinc-500" : "text-zinc-700"}`}
                >
                  {s}
                </div>
              );
            })}
          </div>

          <div className="px-6 pb-6 pt-4">
            {/* STEP 1: Type Selection */}
            {step === "type" && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  {ASSET_TYPES.map((t) => {
                    const Icon = t.icon;
                    const isSelected = form.type === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          setForm({ ...form, type: t.id });
                          setStep("details");
                        }}
                        className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all ${
                          isSelected
                            ? "border-white/[0.15] bg-white/[0.04]"
                            : "border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.02]"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${t.color}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-medium text-zinc-300">
                          {t.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between gap-2 mt-4">
                  <button
                    onClick={() => {
                      reset();
                      setOpen(false);
                    }}
                    className="px-4 py-1.5 text-sm text-zinc-500 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <div></div>
                </div>
              </>
            )}

            {/* STEP 2: Details */}
            {step === "details" && (
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => setStep("type")}
                  className="flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition-colors self-start -mt-1 mb-1"
                >
                  <ArrowLeft className="h-3 w-3" /> Change type
                </button>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-zinc-400">Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={
                      form.type === "stock"
                        ? "Apple Inc."
                        : form.type === "crypto"
                          ? "Bitcoin"
                          : "Asset name"
                    }
                    className="bg-zinc-900 border-white/[0.06] text-white h-9"
                  />
                </div>

                {(form.type === "stock" || form.type === "crypto") && (
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-zinc-400">Symbol</Label>
                    <Input
                      value={form.symbol}
                      onChange={(e) =>
                        setForm({ ...form, symbol: e.target.value })
                      }
                      placeholder={form.type === "stock" ? "AAPL" : "BTC"}
                      className="bg-zinc-900 border-white/[0.06] text-white h-9"
                    />
                  </div>
                )}

                {form.type === "cash" && (
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-zinc-400">Currency</Label>
                    <Select
                      value={form.currency}
                      onValueChange={(v) => setForm({ ...form, currency: v })}
                    >
                      <SelectTrigger className="bg-zinc-900 border-white/[0.06] text-white h-9">
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

                {form.type !== "cash" && form.type !== "real estate" && (
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-zinc-400">Quantity</Label>
                    <Input
                      type="number"
                      step={form.type === "crypto" ? "0.000001" : "0.01"}
                      value={form.quantity}
                      onChange={(e) =>
                        setForm({ ...form, quantity: e.target.value })
                      }
                      placeholder={form.type === "stock" ? "100" : "0.25"}
                      className="bg-zinc-900 border-white/[0.06] text-white h-9"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-zinc-400">
                      {form.type === "cash" ? "Amount" : "Purchase Price"}
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.purchasePrice}
                      onChange={(e) =>
                        setForm({ ...form, purchasePrice: e.target.value })
                      }
                      placeholder="0.00"
                      className="bg-zinc-900 border-white/[0.06] text-white h-9"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-zinc-400">Date</Label>
                    <Input
                      type="date"
                      value={form.purchaseDate}
                      onChange={(e) =>
                        setForm({ ...form, purchaseDate: e.target.value })
                      }
                      className="bg-zinc-900 border-white/[0.06] text-white h-9"
                    />
                  </div>
                </div>

                {form.type !== "cash" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs text-zinc-400">
                        Current Price
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={form.currentPrice}
                        onChange={(e) =>
                          setForm({ ...form, currentPrice: e.target.value })
                        }
                        placeholder="Leave empty to use buy price"
                        className="bg-zinc-900 border-white/[0.06] text-white h-9"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label className="text-xs text-zinc-400">Fees</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={form.fees}
                        onChange={(e) =>
                          setForm({ ...form, fees: e.target.value })
                        }
                        placeholder="0.00"
                        className="bg-zinc-900 border-white/[0.06] text-white h-9"
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-zinc-400">
                    Notes (optional)
                  </Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    placeholder="Any additional details..."
                    rows={2}
                    className="bg-zinc-900 border-white/[0.06] text-white resize-none"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 mt-4">
                  <button
                    onClick={() => {
                      reset();
                      setOpen(false);
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
                      disabled={!canProceed}
                      className="px-4 py-1.5 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Review
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Confirmation */}
            {step === "confirm" && (
              <div className="flex flex-col gap-4">
                <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 flex flex-col gap-2.5">
                  {[
                    {
                      label: "Type",
                      value:
                        form.type.charAt(0).toUpperCase() + form.type.slice(1),
                    },
                    { label: "Name", value: form.name },
                    ...(form.symbol
                      ? [{ label: "Symbol", value: form.symbol.toUpperCase() }]
                      : []),
                    ...(form.type === "cash"
                      ? [{ label: "Currency", value: form.currency }]
                      : []),
                    {
                      label: form.type === "cash" ? "Amount" : "Qty",
                      value:
                        form.type === "cash" || form.type === "real estate"
                          ? "1"
                          : form.quantity,
                    },
                    {
                      label: form.type === "cash" ? "Amount" : "Price",
                      value: `$${Number(form.purchasePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                    },
                    {
                      label: "Date",
                      value: new Date(form.purchaseDate).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "short", day: "numeric" },
                      ),
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between"
                    >
                      <span className="text-xs text-zinc-500">{row.label}</span>
                      <span className="text-sm font-medium text-white">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-2 mt-4">
                  <button
                    onClick={() => {
                      reset();
                      setOpen(false);
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
                      onClick={handleSubmit}
                      className="px-4 py-1.5 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors"
                    >
                      Add Asset
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
