"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface V2HeroSplitProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
}

export function V2HeroSplit({ leftContent, rightContent }: V2HeroSplitProps) {
  return (
    <section className="relative overflow-hidden border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,197,94,0.04),transparent)]" />
      <div className="relative max-w-[1600px] mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-8">
          {/* Left Side - 60% */}
          <div className="relative">
            {leftContent}
          </div>

          {/* Divider */}
          <div className="hidden lg:block absolute left-[60%] top-0 bottom-0 w-px bg-white/[0.06]" />

          {/* Right Side - 40% */}
          <div className="relative">
            {rightContent}
          </div>
        </div>
      </div>
    </section>
  );
}

interface NetWorthHeroProps {
  value: number;
  change: number;
  changePercent: number;
  portfolioCount: number;
}

export function NetWorthHero({ value, change, changePercent, portfolioCount }: NetWorthHeroProps) {
  const isPositive = change >= 0;
  return (
    <div>
      <p className="text-zinc-600 text-sm font-medium tracking-widest uppercase mb-4">Total Net Worth</p>
      <div className="flex items-end gap-6 flex-wrap">
        <h1 className="text-6xl lg:text-7xl font-bold text-white tracking-tighter leading-none">
          ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h1>
        <div className={`flex items-center gap-2 pb-2 ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
          {isPositive ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownRight className="h-6 w-6" />}
          <span className="text-2xl font-semibold">
            {isPositive ? "+" : ""}
            {changePercent.toFixed(2)}%
          </span>
        </div>
      </div>
      <p className="text-zinc-600 text-sm mt-3">
        {isPositive ? "+" : ""}${Math.abs(change).toLocaleString(undefined, { minimumFractionDigits: 2 })} today across {portfolioCount} portfolios
      </p>
    </div>
  );
}
