"use client";

interface Portfolio {
  _id: string;
  name: string;
  currentValue: number;
}

interface V2AllocationBarProps {
  portfolios: Portfolio[];
  totalValue: number;
}

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#ec4899", "#10b981", "#6366f1"];

export function V2AllocationBar({ portfolios, totalValue }: V2AllocationBarProps) {
  if (portfolios.length === 0) return null;

  return (
    <div className="max-w-[1600px] mx-auto px-8 pb-12">
      <h3 className="text-lg font-semibold text-white mb-5">Allocation</h3>

      {/* Bar */}
      <div className="flex h-3 rounded-full overflow-hidden bg-white/[0.04] mb-6">
        {portfolios.map((portfolio, i) => {
          const percentage = (portfolio.currentValue / totalValue) * 100;
          const color = COLORS[i % COLORS.length];
          return (
            <div
              key={portfolio._id}
              style={{
                width: `${percentage}%`,
                backgroundColor: color,
              }}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {portfolios.map((portfolio, i) => {
          const percentage = (portfolio.currentValue / totalValue) * 100;
          const color = COLORS[i % COLORS.length];
          return (
            <div key={portfolio._id} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <div className="min-w-0">
                <p className="text-sm text-white font-medium truncate">{portfolio.name}</p>
                <p className="text-xs text-zinc-600">{percentage.toFixed(1)}%</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
