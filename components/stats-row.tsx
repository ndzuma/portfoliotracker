"use client";

import { Card } from "@/components/ui/card";
import { TrendUp, TrendDown } from "@phosphor-icons/react";

interface StatItem {
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
}

interface V2StatsRowProps {
  stats: StatItem[];
}

export function V2StatsRow({ stats }: V2StatsRowProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, i) => {
        const hasChange = stat.change !== undefined;
        const isPositive = hasChange && stat.change! >= 0;

        return (
          <Card key={i} className="p-5 bg-zinc-950 border-white/[0.06]">
            <p className="text-sm text-zinc-600 font-medium mb-2">
              {stat.label}
            </p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            {hasChange && (
              <div
                className={`flex items-center gap-1 text-sm mt-2 ${isPositive ? "text-emerald-500" : "text-red-500"}`}
              >
                {isPositive ? (
                  <TrendUp className="h-4 w-4" />
                ) : (
                  <TrendDown className="h-4 w-4" />
                )}
                <span>
                  {isPositive ? "+" : ""}
                  {stat.change}% {stat.changeLabel || ""}
                </span>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
