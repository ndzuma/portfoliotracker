"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  ExternalLink,
  Receipt,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { V2TransactionDialog } from "@/components/v2/v2-transaction-dialog";
import type { Asset } from "@/app/(webapp)/portfolio/[id]/components/types";

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
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold uppercase ${c}`}>
      {type.slice(0, 2)}
    </div>
  );
}

function HoldingRow({ asset, onEdit, onDelete }: { asset: Asset; onEdit: (a: Asset) => void; onDelete: (id: string) => void }) {
  const [txOpen, setTxOpen] = useState(false);
  const up = asset.change >= 0;

  const getLink = (a: Asset) => {
    if (a.type === "crypto" && a.symbol) return `https://www.coingecko.com/en/coins/${a.symbol.toLowerCase()}`;
    if (a.type === "stock" && a.symbol) return `https://finance.yahoo.com/quote/${a.symbol}`;
    return null;
  };
  const link = getLink(asset);

  return (
    <>
      <div className="group flex items-center gap-4 py-3.5 px-5 hover:bg-white/[0.02] transition-colors border-b border-white/[0.04] last:border-b-0">
        <AssetTypeIcon type={asset.type} />

        {/* Name + Symbol */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white truncate">{asset.symbol || asset.name}</span>
            {link && (
              <a href={link} target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-zinc-400 transition-colors">
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <p className="text-xs text-zinc-600 truncate">{asset.name}</p>
        </div>

        {/* Quantity */}
        <div className="hidden md:block text-right min-w-[80px]">
          <p className="text-xs text-zinc-500">
            {asset.type === "cash"
              ? "Cash"
              : asset.type === "real estate"
                ? "1 property"
                : `${asset.quantity || 0} ${asset.type === "crypto" ? "units" : "shares"}`}
          </p>
        </div>

        {/* Avg Buy */}
        <div className="hidden lg:block text-right min-w-[90px]">
          <p className="text-sm text-zinc-400">${asset.avgBuyPrice?.toFixed(2) || "0.00"}</p>
          <p className="text-[10px] text-zinc-600">avg buy</p>
        </div>

        {/* Current Price */}
        <div className="hidden lg:block text-right min-w-[90px]">
          <p className="text-sm text-white font-medium">${asset.currentPrice?.toFixed(2) || "0.00"}</p>
          <p className="text-[10px] text-zinc-600">current</p>
        </div>

        {/* Value */}
        <div className="text-right min-w-[100px]">
          <p className="text-sm font-semibold text-white">
            {asset.type === "cash" && asset.currency ? `${asset.currency} ` : "$"}
            {asset.currentValue.toLocaleString()}
          </p>
          <p className="text-[10px] text-zinc-600">{asset.allocation?.toFixed(1)}% alloc</p>
        </div>

        {/* Change */}
        <div className="text-right min-w-[100px]">
          <p className={`text-sm font-medium ${up ? "text-emerald-500" : "text-red-500"}`}>
            {up ? "+" : ""}{asset.changePercent?.toFixed(2)}%
          </p>
          <p className={`text-[10px] ${up ? "text-emerald-500/60" : "text-red-500/60"}`}>
            {up ? "+" : ""}${Math.abs(asset.change).toLocaleString()}
          </p>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 rounded-md text-zinc-600 hover:text-white hover:bg-white/[0.06] opacity-0 group-hover:opacity-100 transition-all">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-zinc-950 border-white/[0.06]">
            <DropdownMenuItem onClick={() => setTxOpen(true)} className="text-zinc-300 focus:text-white focus:bg-white/[0.06]">
              <Receipt className="h-3.5 w-3.5 mr-2" />Transactions
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(asset)} className="text-zinc-300 focus:text-white focus:bg-white/[0.06]">
              <Edit className="h-3.5 w-3.5 mr-2" />Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(asset._id)} className="text-red-400 focus:text-red-300 focus:bg-red-500/10">
              <Trash2 className="h-3.5 w-3.5 mr-2" />Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <V2TransactionDialog
        isOpen={txOpen}
        onOpenChange={setTxOpen}
        assetId={asset._id}
        assetName={asset.name}
        assetType={asset.type}
        assetSymbol={asset.symbol}
      />
    </>
  );
}

export function V2Holdings({ assets, onEdit, onDelete }: V2HoldingsProps) {
  // Group by type
  const grouped = assets.reduce<Record<string, Asset[]>>((acc, a) => {
    acc[a.type] = acc[a.type] || [];
    acc[a.type].push(a);
    return acc;
  }, {});

  const typeOrder = ["stock", "crypto", "real estate", "commodity", "bond", "cash", "other"];
  const sortedTypes = typeOrder.filter((t) => grouped[t]?.length > 0);

  if (assets.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-zinc-600 text-sm">No holdings in this portfolio yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {sortedTypes.map((type) => (
        <div key={type} className="rounded-xl border border-white/[0.06] bg-zinc-950/60 overflow-hidden">
          {/* Section header */}
          <div className="flex items-center justify-between px-5 py-3 bg-white/[0.02]">
            <h3 className="text-sm font-semibold text-white">
              {TYPE_LABELS[type]} <span className="text-zinc-600 font-normal ml-1">({grouped[type].length})</span>
            </h3>
            <p className="text-xs text-zinc-500">
              ${grouped[type].reduce((s, a) => s + a.currentValue, 0).toLocaleString()}
            </p>
          </div>

          {/* Column headers */}
          <div className="flex items-center gap-4 px-5 py-2 text-[10px] text-zinc-600 font-medium uppercase tracking-wider border-b border-white/[0.04]">
            <div className="w-8" />
            <div className="flex-1">Asset</div>
            <div className="hidden md:block text-right min-w-[80px]">Qty</div>
            <div className="hidden lg:block text-right min-w-[90px]">Avg Buy</div>
            <div className="hidden lg:block text-right min-w-[90px]">Price</div>
            <div className="text-right min-w-[100px]">Value</div>
            <div className="text-right min-w-[100px]">Change</div>
            <div className="w-8" />
          </div>

          {/* Rows */}
          {grouped[type].map((asset) => (
            <HoldingRow key={asset._id} asset={asset} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      ))}
    </div>
  );
}
