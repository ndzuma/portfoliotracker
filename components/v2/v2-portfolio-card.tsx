"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface V2PortfolioCardProps {
  id: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  assetsCount: number;
  description?: string;
}

export function V2PortfolioCard({
  id,
  name,
  value,
  change,
  changePercent,
  assetsCount,
  description,
}: V2PortfolioCardProps) {
  const isPositive = change >= 0;

  return (
    <Link href={`/v2/portfolio/${id}`} className="group">
      <div className="relative rounded-2xl border border-white/[0.06] bg-zinc-950 p-6 hover:border-white/[0.12] transition-all hover:bg-zinc-900/50 h-full">
        {/* Sparkline Background - Optional subtle gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-20 opacity-[0.03] overflow-hidden rounded-b-2xl bg-gradient-to-t from-emerald-500/20 to-transparent" />

        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-lg truncate">{name}</h3>
              <p className="text-zinc-600 text-sm mt-0.5">{assetsCount} assets</p>
            </div>
            <Badge
              variant="outline"
              className={`border-0 text-xs ml-2 ${
                isPositive
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-red-500/10 text-red-500"
              }`}
            >
              {isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
              {isPositive ? "+" : ""}
              {changePercent.toFixed(2)}%
            </Badge>
          </div>

          {/* Value */}
          <p className="text-3xl font-bold text-white tracking-tight">
            ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>

          {/* Change */}
          <p className={`text-sm mt-1 ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
            {isPositive ? "+" : ""}${Math.abs(change).toLocaleString(undefined, { minimumFractionDigits: 2 })} today
          </p>

          {/* Description (if provided) */}
          {description && (
            <p className="text-xs text-zinc-600 mt-3 line-clamp-2">{description}</p>
          )}

          {/* View Details */}
          <div className="flex items-center gap-1 mt-5 text-xs text-zinc-600 group-hover:text-zinc-400 transition-colors">
            View details <ArrowUpRight className="h-3 w-3" />
          </div>
        </div>
      </div>
    </Link>
  );
}
