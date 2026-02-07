"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/* ─── Sparkline Component ─── */
function Spark({ up, className = "" }: { up: boolean; className?: string }) {
  const pts = up
    ? "0,20 10,18 20,22 30,15 40,17 50,12 60,14 70,8 80,7"
    : "0,5 10,8 20,4 30,10 40,12 50,18 60,13 70,20 80,22";
  return (
    <svg viewBox="0 0 80 25" className={className} preserveAspectRatio="none">
      <polyline
        points={pts}
        fill="none"
        stroke={up ? "#22c55e" : "#ef4444"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
      <div className="relative rounded-2xl border border-white/[0.06] bg-zinc-950 p-5 hover:border-white/[0.12] transition-all hover:bg-zinc-900/50 min-h-[200px]">
        {/* Sparkline Background Graphics */}
        <div className="absolute bottom-0 left-0 right-0 h-16 opacity-[0.06] overflow-hidden rounded-b-2xl">
          <Spark up={isPositive} className="w-full h-full" />
        </div>

        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-base truncate">
                {name}
              </p>
              <p className="text-zinc-600 text-xs mt-0.5">
                {assetsCount} assets
              </p>
            </div>
            <Badge
              variant="outline"
              className={`border-0 text-xs ml-2 shrink-0 ${
                isPositive
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-red-500/10 text-red-500"
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              )}
              {isPositive ? "+" : ""}
              {changePercent.toFixed(2)}%
            </Badge>
          </div>

          {/* Portfolio Value */}
          <p className="text-2xl font-bold text-white tracking-tight">
            $
            {value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>

          {/* Daily Change */}
          <p
            className={`text-sm mt-1 ${isPositive ? "text-emerald-500" : "text-red-500"}`}
          >
            {isPositive ? "+" : ""}$
            {Math.abs(change).toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}{" "}
            today
          </p>

          {/* View Details Footer */}
          <div className="flex items-center gap-1 mt-4 text-xs text-zinc-600 group-hover:text-zinc-400 transition-colors">
            View details <ArrowUpRight className="h-3 w-3" />
          </div>
        </div>
      </div>
    </Link>
  );
}
