"use client";

function Sparkline({ up, className = "" }: { up: boolean; className?: string }) {
  const points = up
    ? "0,20 10,18 20,22 30,15 40,17 50,12 60,14 70,8 80,7"
    : "0,5 10,8 20,4 30,10 40,12 50,18 60,13 70,20 80,22";
  return (
    <svg viewBox="0 0 80 25" className={className} preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={up ? "#22c55e" : "#ef4444"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface Benchmark {
  name: string;
  ticker: string;
  close: number;
  percentageChange: number;
}

interface V2TickerProps {
  benchmarks: Benchmark[];
}

export function V2Ticker({ benchmarks }: V2TickerProps) {
  return (
    <div className="border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
      <div className="max-w-[1600px] mx-auto flex items-center overflow-x-auto">
        {benchmarks.map((benchmark, i) => {
          const isPositive = benchmark.percentageChange >= 0;
          return (
            <div
              key={benchmark.ticker}
              className={`flex items-center gap-4 px-6 py-3 shrink-0 ${i < benchmarks.length - 1 ? "border-r" : ""}`}
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <div>
                <p className="text-xs text-zinc-600 font-medium">{benchmark.ticker}</p>
                <p className="text-sm text-white font-semibold">{benchmark.close.toLocaleString()}</p>
              </div>
              <Sparkline up={isPositive} className="w-16 h-6" />
              <span className={`text-xs font-semibold ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                {isPositive ? "+" : ""}
                {benchmark.percentageChange.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
