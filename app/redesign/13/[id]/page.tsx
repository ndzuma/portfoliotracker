"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowUpRight, ArrowDownRight, Sparkles,
  Layers, TrendingUp, TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const DATA: Record<string, any> = {
  p1: { name: "Tech Growth Fund", value: 127450.82, change: 3420.15, pct: 2.76, desc: "Large-cap tech focused on AI & cloud", color: "#3b82f6",
    holdings: [
      { name: "NVIDIA", ticker: "NVDA", value: 32400, change: 4.2, weight: 25.4 },
      { name: "Apple", ticker: "AAPL", value: 28900, change: 1.1, weight: 22.7 },
      { name: "Microsoft", ticker: "MSFT", value: 25200, change: 0.8, weight: 19.8 },
      { name: "Alphabet", ticker: "GOOGL", value: 18500, change: -0.4, weight: 14.5 },
      { name: "Amazon", ticker: "AMZN", value: 14200, change: 2.3, weight: 11.1 },
      { name: "Meta", ticker: "META", value: 8250, change: 3.1, weight: 6.5 },
    ] },
  p2: { name: "Dividend Kings", value: 89230.44, change: -1205.30, pct: -1.33, desc: "High-yield dividend aristocrats", color: "#8b5cf6",
    holdings: [
      { name: "Johnson & Johnson", ticker: "JNJ", value: 22300, change: -0.8, weight: 25.0 },
      { name: "Procter & Gamble", ticker: "PG", value: 19800, change: -1.2, weight: 22.2 },
      { name: "Coca-Cola", ticker: "KO", value: 18100, change: -0.5, weight: 20.3 },
      { name: "PepsiCo", ticker: "PEP", value: 15200, change: -2.1, weight: 17.0 },
      { name: "3M Company", ticker: "MMM", value: 13830, change: -1.8, weight: 15.5 },
    ] },
  p3: { name: "Crypto Alpha", value: 45890.12, change: 5670.88, pct: 14.10, desc: "BTC, ETH & DeFi blue chips", color: "#f59e0b",
    holdings: [
      { name: "Bitcoin", ticker: "BTC", value: 22000, change: 12.5, weight: 47.9 },
      { name: "Ethereum", ticker: "ETH", value: 12500, change: 18.3, weight: 27.2 },
      { name: "Solana", ticker: "SOL", value: 6200, change: 8.7, weight: 13.5 },
      { name: "Chainlink", ticker: "LINK", value: 3100, change: 5.2, weight: 6.8 },
      { name: "Aave", ticker: "AAVE", value: 2090, change: 22.1, weight: 4.6 },
    ] },
  p4: { name: "Global Macro", value: 62100.00, change: 890.50, pct: 1.45, desc: "Multi-asset global macro strategy", color: "#22c55e",
    holdings: [
      { name: "iShares MSCI World", ticker: "URTH", value: 18600, change: 0.9, weight: 30.0 },
      { name: "Vanguard Total Bond", ticker: "BND", value: 12400, change: 0.2, weight: 20.0 },
      { name: "SPDR Gold Trust", ticker: "GLD", value: 9300, change: 1.8, weight: 15.0 },
      { name: "iShares EM", ticker: "EEM", value: 8700, change: 2.1, weight: 14.0 },
      { name: "US Dollar Index", ticker: "UUP", value: 6500, change: -0.3, weight: 10.5 },
      { name: "iShares TIPS", ticker: "TIP", value: 6600, change: 0.4, weight: 10.5 },
    ] },
  p5: { name: "Real Estate REIT", value: 38400.60, change: -420.10, pct: -1.08, desc: "Commercial & residential REITs", color: "#ef4444",
    holdings: [
      { name: "Prologis", ticker: "PLD", value: 11500, change: -0.9, weight: 29.9 },
      { name: "American Tower", ticker: "AMT", value: 10200, change: -1.5, weight: 26.6 },
      { name: "Realty Income", ticker: "O", value: 9400, change: -0.3, weight: 24.5 },
      { name: "Digital Realty", ticker: "DLR", value: 7300, change: -1.8, weight: 19.0 },
    ] },
};

export default function Redesign13Portfolio() {
  const { id } = useParams();
  const port = DATA[id as string] || DATA.p1;
  const up = port.change >= 0;

  return (
    <div className="min-h-screen" style={{ background: "#09090b" }}>
      <nav className="sticky top-10 z-40 backdrop-blur-xl border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(9,9,11,0.9)" }}>
        <div className="max-w-[1100px] mx-auto flex items-center justify-between px-8 h-14">
          <span className="text-base font-bold text-white tracking-tight">Prism</span>
          <Link href="/redesign/13"><Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button></Link>
        </div>
      </nav>

      <div className="max-w-[1100px] mx-auto px-8">
        {/* Hero */}
        <section className="py-16 relative">
          <div className="absolute top-0 left-0 w-80 h-80 rounded-full blur-[120px] opacity-10" style={{ backgroundColor: port.color }} />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: port.color }} />
              <Badge variant="outline" className="border-white/10 text-zinc-500 text-xs">{port.holdings.length} holdings</Badge>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white tracking-tighter mb-3">{port.name}</h1>
            <p className="text-zinc-500 text-sm mb-8">{port.desc}</p>
            <div className="flex items-end gap-4 flex-wrap">
              <span className="text-5xl font-bold text-white tracking-tighter">${port.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              <div className={`flex items-center gap-2 pb-1 ${up ? "text-emerald-400" : "text-red-400"}`}>
                {up ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                <span className="text-xl font-semibold">{up ? "+" : ""}{port.pct.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </section>

        <Separator className="bg-white/[0.06]" />

        {/* AI */}
        <section className="py-8">
          <div className="flex items-start gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <Sparkles className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-zinc-400 leading-relaxed">
              {port.name} holds {port.holdings.length} positions with {port.holdings[0]?.name} as the dominant asset at {port.holdings[0]?.weight}%. {up ? "Momentum is positive -- consider holding current allocation." : "Performance is under pressure. Review sector exposure."} Concentration risk: top 2 holdings represent {(port.holdings[0]?.weight + port.holdings[1]?.weight).toFixed(1)}% of the portfolio.
            </p>
          </div>
        </section>

        <Separator className="bg-white/[0.06]" />

        {/* Holdings */}
        <section className="py-10 pb-20">
          <p className="text-xs text-zinc-600 font-semibold uppercase tracking-[0.15em] mb-8">Holdings</p>
          <div className="flex flex-col gap-3">
            {port.holdings.map((h: any, i: number) => {
              const hup = h.change >= 0;
              return (
                <div key={h.ticker} className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.03] transition-colors">
                  <span className="text-xs text-zinc-700 font-mono w-6">{String(i + 1).padStart(2, "0")}</span>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: `${port.color}15`, color: port.color }}>
                    {h.ticker.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{h.name}</p>
                    <p className="text-xs text-zinc-600">{h.ticker}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-sm">${h.value.toLocaleString()}</p>
                    <div className={`flex items-center gap-1 justify-end ${hup ? "text-emerald-400" : "text-red-400"}`}>
                      {hup ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      <span className="text-xs font-semibold">{hup ? "+" : ""}{h.change}%</span>
                    </div>
                  </div>
                  <div className="w-16 text-right">
                    <p className="text-xs text-zinc-500">{h.weight}%</p>
                    <div className="h-1 rounded-full bg-white/[0.04] mt-1">
                      <div className="h-1 rounded-full" style={{ width: `${h.weight}%`, backgroundColor: port.color }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
