"use client";

import { ArrowUpRight, ArrowDownRight } from "@phosphor-icons/react";
import { useCurrency } from "@/hooks/useCurrency";
import { useTranslations } from "next-intl";

interface V2HeroSplitProps {
  leftContent: React.ReactNode;
  rightContent: React.ReactNode;
}

export function V2HeroSplit({ leftContent, rightContent }: V2HeroSplitProps) {
  return (
    <section
      className="border-b"
      style={{ borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        <div className="flex flex-col lg:flex-row">
          {/* Left - 60% */}
          <div className="flex-[0.6] pr-0 lg:pr-6">{leftContent}</div>

          {/* Vertical Divider */}
          <div className="hidden lg:block w-px bg-white/[0.06] mx-0 shrink-0" />

          {/* Right - 40% */}
          <div className="flex-[0.4] pl-0 lg:pl-6 mt-8 lg:mt-0">
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

export function NetWorthHero({
  value,
  change,
  changePercent,
  portfolioCount,
}: NetWorthHeroProps) {
  const { format, symbol } = useCurrency();
  const t = useTranslations("dashboard");
  const isPositive = change >= 0;

  // Build the formatted change string for ICU interpolation
  const formattedChange = `${isPositive ? "+" : "-"}${symbol}${Math.abs(change).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <div>
      <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em] mb-4">
        {t("totalNetWorth")}
      </p>
      <div className="flex items-end gap-5 flex-wrap">
        <h1 className="text-5xl lg:text-[68px] font-bold text-white tracking-tighter leading-none">
          {format(value)}
        </h1>
        <div
          className={`flex items-center gap-1.5 pb-1.5 ${isPositive ? "text-emerald-500" : "text-red-500"}`}
        >
          {isPositive ? (
            <ArrowUpRight className="h-5 w-5" />
          ) : (
            <ArrowDownRight className="h-5 w-5" />
          )}
          <span className="text-xl font-semibold">
            {isPositive ? "+" : ""}
            {changePercent.toFixed(2)}%
          </span>
        </div>
      </div>
      <p className="text-zinc-600 text-sm mt-3">
        {t("todayAcrossPortfolios", {
          change: formattedChange,
          count: portfolioCount,
        })}
      </p>
    </div>
  );
}
