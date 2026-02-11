"use client";

import { useState } from "react";
import {
  PencilSimple,
  Trash,
  ArrowSquareOut,
  Receipt,
  TrendUp,
  TrendDown,
  CaretDown,
  Plus,
  ArrowsLeftRight,
} from "@phosphor-icons/react";
import { useCurrency } from "@/hooks/useCurrency";
import { V2TransactionDialog } from "@/components/transaction-dialog";
import type { Asset } from "@/components/types";
import { motion, AnimatePresence } from "motion/react";

interface V2HoldingsProps {
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
  stock: "Stocks",
  crypto: "Crypto",
  "real estate": "Real Estate",
  commodity: "Commodities",
  bond: "Bonds",
  cash: "Cash",
  other: "Other",
};

function AssetTypeIcon({ type }: { type: string }) {
  const colors: Record<string, string> = {
    stock: "bg-blue-500/15 text-blue-400",
    crypto: "bg-amber-500/15 text-amber-400",
    "real estate": "bg-emerald-500/15 text-emerald-400",
    commodity: "bg-orange-500/15 text-orange-400",
    bond: "bg-purple-500/15 text-purple-400",
    cash: "bg-zinc-500/15 text-zinc-400",
    other: "bg-zinc-500/15 text-zinc-400",
  };
  const c = colors[type] || colors.other;
  return (
    <div
      className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold uppercase ${c}`}
    >
      {type.slice(0, 2)}
    </div>
  );
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

/* ─── Expanded Row Panel ──────────────────────────────────────────── */
function ExpandedPanel({
  asset,
  onEdit,
  onDelete,
}: {
  asset: Asset;
  onEdit: (a: Asset) => void;
  onDelete: (id: string) => void;
}) {
  const [txOpen, setTxOpen] = useState(false);
  const { format } = useCurrency();

  return (
    <>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="overflow-hidden"
      >
        <div className="px-5 pb-4 pt-1">
          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2.5">
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">
                Quantity
              </p>
              <p className="text-sm font-semibold text-white tabular-nums">
                {asset.type === "cash"
                  ? "Cash"
                  : asset.type === "real estate"
                    ? "1 property"
                    : `${(asset.quantity || 0).toLocaleString()} ${asset.type === "crypto" ? "units" : "shares"}`}
              </p>
            </div>
            <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2.5">
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">
                Avg Buy Price
              </p>
              <p className="text-sm font-semibold text-white tabular-nums">
                {format(asset.avgBuyPrice || 0)}
              </p>
            </div>
            <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2.5">
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">
                Current Price
              </p>
              <p className="text-sm font-semibold text-white tabular-nums">
                {format(asset.currentPrice || 0)}
              </p>
            </div>
            <div className="rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2.5">
              <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">
                Total Value
              </p>
              <p className="text-sm font-semibold text-white tabular-nums">
                {format(asset.currentValue)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setTxOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-white/[0.06] bg-white/[0.03] text-zinc-300 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.1] transition-all"
            >
              <Receipt className="h-3.5 w-3.5" />
              Transactions
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(asset);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-white/[0.06] bg-white/[0.03] text-zinc-300 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.1] transition-all"
            >
              <PencilSimple className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm("Are you sure you want to delete this asset?")) {
                  onDelete(asset._id);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-500/10 bg-red-500/5 text-red-400 hover:text-red-300 hover:bg-red-500/10 hover:border-red-500/20 transition-all ml-auto"
            >
              <Trash className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>
      </motion.div>

      <V2TransactionDialog
        isOpen={txOpen}
        onOpenChange={setTxOpen}
        assetId={asset._id}
        assetName={asset.name}
        assetType={asset.type}
        assetSymbol={asset.symbol}
        assetCurrency={asset.currency || "USD"}
      />
    </>
  );
}

/* ─── Holding Row (click-to-expand) ───────────────────────────────── */
function HoldingRow({
  asset,
  onEdit,
  onDelete,
  isExpanded,
  onToggle,
}: {
  asset: Asset;
  onEdit: (a: Asset) => void;
  onDelete: (id: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { format, symbol, currency: displayCurrency } = useCurrency();
  const up = asset.change >= 0;

  const getLink = (a: Asset) => {
    if (a.type === "crypto" && a.symbol)
      return `https://www.coingecko.com/en/coins/${a.symbol.toLowerCase()}`;
    if (a.type === "stock" && a.symbol)
      return `https://finance.yahoo.com/quote/${a.symbol}`;
    return null;
  };
  const link = getLink(asset);
  const assetCurrency = asset.currency || "USD";
  const isConverted =
    assetCurrency.toUpperCase() !== displayCurrency.toUpperCase();

  return (
    <div className={`transition-colors ${isExpanded ? "bg-white/[0.02]" : ""}`}>
      {/* Main row — clickable */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-4 py-3.5 px-5 text-left hover:bg-white/[0.03] transition-colors border-b cursor-pointer ${
          isExpanded ? "border-white/[0.03]" : "border-white/[0.04]"
        }`}
      >
        <AssetTypeIcon type={asset.type} />

        {/* Name + Symbol + FX badge */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white truncate">
              {asset.symbol || asset.name}
            </span>
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-600 hover:text-zinc-400 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ArrowSquareOut className="h-3 w-3" />
              </a>
            )}
            {isConverted && (
              <FxBadge
                assetCurrency={assetCurrency}
                displayCurrency={displayCurrency}
              />
            )}
          </div>
          <p className="text-xs text-zinc-600 truncate">{asset.name}</p>
        </div>

        {/* Quantity — hidden on small */}
        <div className="hidden md:block text-right min-w-[80px]">
          <p className="text-xs text-zinc-500">
            {asset.type === "cash"
              ? "Cash"
              : asset.type === "real estate"
                ? "1 property"
                : `${asset.quantity || 0} ${asset.type === "crypto" ? "units" : "shares"}`}
          </p>
        </div>

        {/* Value */}
        <div className="text-right min-w-[100px]">
          <p className="text-sm font-semibold text-white">
            {format(asset.currentValue)}
          </p>
          <p className="text-[10px] text-zinc-600">
            {asset.allocation?.toFixed(1)}% alloc
          </p>
        </div>

        {/* Change */}
        <div className="text-right min-w-[90px]">
          <p
            className={`text-sm font-medium ${up ? "text-emerald-500" : "text-red-500"}`}
          >
            {up ? "+" : ""}
            {asset.changePercent?.toFixed(2)}%
          </p>
          <p
            className={`text-[10px] ${up ? "text-emerald-500/60" : "text-red-500/60"}`}
          >
            {up ? "+" : "-"}
            {symbol}
            {Math.abs(asset.change).toLocaleString()}
          </p>
        </div>

        {/* Expand chevron */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="shrink-0"
        >
          <CaretDown
            className={`h-3.5 w-3.5 transition-colors ${isExpanded ? "text-zinc-400" : "text-zinc-700"}`}
          />
        </motion.div>
      </button>

      {/* Expanded panel */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <ExpandedPanel asset={asset} onEdit={onEdit} onDelete={onDelete} />
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionTotal({ assets }: { assets: Asset[] }) {
  const { format } = useCurrency();
  const total = assets.reduce((s, a) => s + a.currentValue, 0);
  return <p className="text-xs text-zinc-500">{format(total)}</p>;
}

export function V2Holdings({ assets, onEdit, onDelete }: V2HoldingsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Group by type
  const grouped = assets.reduce<Record<string, Asset[]>>((acc, a) => {
    acc[a.type] = acc[a.type] || [];
    acc[a.type].push(a);
    return acc;
  }, {});

  const typeOrder = [
    "stock",
    "crypto",
    "real estate",
    "commodity",
    "bond",
    "cash",
    "other",
  ];
  const sortedTypes = typeOrder.filter((t) => grouped[t]?.length > 0);

  if (assets.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-zinc-600 text-sm">
          No holdings in this portfolio yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {sortedTypes.map((type) => (
        <div
          key={type}
          className="rounded-xl border border-white/[0.06] bg-zinc-950/60 overflow-hidden"
        >
          {/* Section header */}
          <div className="flex items-center justify-between px-5 py-3 bg-white/[0.02]">
            <h3 className="text-sm font-semibold text-white">
              {TYPE_LABELS[type]}{" "}
              <span className="text-zinc-600 font-normal ml-1">
                ({grouped[type].length})
              </span>
            </h3>
            <SectionTotal assets={grouped[type]} />
          </div>

          {/* Column headers */}
          <div className="flex items-center gap-4 px-5 py-2 text-[10px] text-zinc-600 font-medium uppercase tracking-wider border-b border-white/[0.04]">
            <div className="w-8" />
            <div className="flex-1">Asset</div>
            <div className="hidden md:block text-right min-w-[80px]">Qty</div>
            <div className="text-right min-w-[100px]">Value</div>
            <div className="text-right min-w-[90px]">Change</div>
            <div className="w-3.5" />
          </div>

          {/* Rows */}
          {grouped[type].map((asset) => (
            <HoldingRow
              key={asset._id}
              asset={asset}
              onEdit={onEdit}
              onDelete={onDelete}
              isExpanded={expandedId === asset._id}
              onToggle={() => toggleExpand(asset._id)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
