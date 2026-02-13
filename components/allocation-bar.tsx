"use client";

import { useState } from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface Portfolio {
  _id: string;
  name: string;
  currentValue: number;
}

interface V2AllocationBarProps {
  portfolios: Portfolio[];
  totalValue: number;
}

const COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#ec4899",
  "#10b981",
  "#6366f1",
];

interface PortfolioSlice {
  id: string;
  name: string;
  value: number;
  percentage: number;
  color: string;
}

function computePortfolioSlices(
  portfolios: Portfolio[],
  totalValue: number,
): PortfolioSlice[] {
  const safeTotalValue = Math.max(0, totalValue);

  return portfolios.map((p, i) => {
    const value = Math.max(0, p.currentValue);
    return {
      id: p._id,
      name: p.name,
      value,
      percentage: safeTotalValue > 0 ? (value / safeTotalValue) * 100 : 0,
      color: COLORS[i % COLORS.length],
    };
  });
}

export function V2AllocationBar({
  portfolios,
  totalValue,
}: V2AllocationBarProps) {
  const slices = computePortfolioSlices(portfolios, totalValue);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (portfolios.length === 0) return null;

  return (
    <div className="max-w-[1600px] mx-auto pb-12">
      <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em] mb-5">
        Portfolio Allocation
      </p>

      {/* Bar with tooltips */}
      <TooltipProvider delayDuration={0}>
        <div className="flex h-2.5 rounded-full overflow-hidden bg-white/[0.04] mb-5">
          {slices.map((slice, i) => (
            <Tooltip key={slice.id}>
              <TooltipTrigger asChild>
                <div
                  className="relative transition-all duration-200 cursor-default"
                  style={{
                    width: `${slice.percentage}%`,
                    backgroundColor: slice.color,
                    opacity:
                      hoveredId === null || hoveredId === slice.id ? 1 : 0.3,
                    marginRight: i < slices.length - 1 ? "1px" : 0,
                  }}
                  onMouseEnter={() => setHoveredId(slice.id)}
                  onMouseLeave={() => setHoveredId(null)}
                />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                sideOffset={8}
                className="bg-zinc-900 border border-white/[0.08] px-3 py-2 rounded-lg shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="text-xs font-medium text-white">
                    {slice.name}
                  </span>
                  <span className="text-xs text-zinc-400 font-semibold tabular-nums">
                    {slice.percentage.toFixed(1)}%
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-0.5 pl-4">
                  $
                  {slice.value.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      {/* Compact legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {slices.map((slice) => (
          <div
            key={slice.id}
            className="flex items-center gap-1.5 cursor-default transition-opacity duration-150"
            style={{
              opacity: hoveredId === null || hoveredId === slice.id ? 1 : 0.35,
            }}
            onMouseEnter={() => setHoveredId(slice.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-[11px] text-zinc-500 font-medium truncate max-w-[120px]">
              {slice.name}
            </span>
            <span className="text-[11px] text-zinc-400 font-semibold tabular-nums">
              {slice.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========================================================================== */
/*  ASSET TYPE ALLOCATION BAR                                                  */
/*  Tooltip-based, no external labels — for portfolio detail page              */
/* ========================================================================== */

type AssetType =
  | "stock"
  | "bond"
  | "commodity"
  | "real estate"
  | "crypto"
  | "cash"
  | "other";

interface AssetForAllocation {
  type: AssetType;
  currentValue: number;
}

interface V2AssetAllocationBarProps {
  assets: AssetForAllocation[];
}

const TYPE_CONFIG: Record<AssetType, { color: string; label: string }> = {
  stock: { color: "#3b82f6", label: "Stocks" },
  bond: { color: "#10b981", label: "Bonds" },
  commodity: { color: "#f59e0b", label: "Commodities" },
  "real estate": { color: "#8b5cf6", label: "Real Estate" },
  crypto: { color: "#f97316", label: "Crypto" },
  cash: { color: "#71717a", label: "Cash" },
  other: { color: "#ec4899", label: "Other" },
};

/* Sorted order for consistent rendering */
const TYPE_ORDER: AssetType[] = [
  "stock",
  "crypto",
  "bond",
  "real estate",
  "commodity",
  "cash",
  "other",
];

interface AllocationSlice {
  type: AssetType;
  value: number;
  percentage: number;
  color: string;
  label: string;
}

function computeSlices(assets: AssetForAllocation[]): AllocationSlice[] {
  const totals = new Map<AssetType, number>();
  let grandTotal = 0;

  for (const a of assets) {
    const v = Math.max(0, a.currentValue);
    totals.set(a.type, (totals.get(a.type) || 0) + v);
    grandTotal += v;
  }

  if (grandTotal === 0) return [];

  return TYPE_ORDER.filter((t) => (totals.get(t) || 0) > 0).map((t) => {
    const value = totals.get(t)!;
    return {
      type: t,
      value,
      percentage: (value / grandTotal) * 100,
      color: TYPE_CONFIG[t].color,
      label: TYPE_CONFIG[t].label,
    };
  });
}

export function V2AssetAllocationBar({ assets }: V2AssetAllocationBarProps) {
  const slices = computeSlices(assets);
  const [hoveredType, setHoveredType] = useState<AssetType | null>(null);

  if (slices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-zinc-600">
        <p className="text-xs">No allocation data</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Label */}
      <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
        Asset Allocation
      </p>

      {/* Bar with tooltips */}
      <TooltipProvider delayDuration={0}>
        <div className="flex h-2.5 rounded-full overflow-hidden bg-white/[0.04]">
          {slices.map((slice, i) => (
            <Tooltip key={slice.type}>
              <TooltipTrigger asChild>
                <div
                  className="relative transition-all duration-200 cursor-default"
                  style={{
                    width: `${slice.percentage}%`,
                    backgroundColor: slice.color,
                    opacity:
                      hoveredType === null || hoveredType === slice.type
                        ? 1
                        : 0.3,
                    marginRight: i < slices.length - 1 ? "1px" : 0,
                  }}
                  onMouseEnter={() => setHoveredType(slice.type)}
                  onMouseLeave={() => setHoveredType(null)}
                />
              </TooltipTrigger>
              <TooltipContent
                side="top"
                sideOffset={8}
                className="bg-zinc-900 border border-white/[0.08] px-3 py-2 rounded-lg shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="text-xs font-medium text-white">
                    {slice.label}
                  </span>
                  <span className="text-xs text-zinc-400 font-semibold tabular-nums">
                    {slice.percentage.toFixed(1)}%
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-0.5 pl-4">
                  $
                  {slice.value.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      {/* Compact legend grid */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {slices.map((slice) => (
          <div
            key={slice.type}
            className="flex items-center gap-1.5 cursor-default transition-opacity duration-150"
            style={{
              opacity:
                hoveredType === null || hoveredType === slice.type ? 1 : 0.35,
            }}
            onMouseEnter={() => setHoveredType(slice.type)}
            onMouseLeave={() => setHoveredType(null)}
          >
            <div
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-[11px] text-zinc-500 font-medium">
              {slice.label}
            </span>
            <span className="text-[11px] text-zinc-400 font-semibold tabular-nums">
              {slice.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
