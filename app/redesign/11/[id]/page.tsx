"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowUpRight, ArrowDownRight, DollarSign,
  Sparkles, Layers, PieChart, TrendingUp, TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

const DATA: Record<string, any> = {
  p1: {
    name: "Tech Growth Fund", value: 127450.82, change: 3420.15, pct: 2.76, desc: "Large-cap tech focused on AI & cloud",
    holdings: [
      { name: "NVIDIA", ticker: "NVDA", value: 32400, change: 4.2, weight: 25.4 },
      { name: "Apple", ticker: "AAPL", value: 28900, change: 1.1, weight: 22.7 },
      { name: "Microsoft", ticker: "MSFT", value: 25200, change: 0.8, weight: 19.8 },
      { name: "Alphabet", ticker: "GOOGL", value: 18500, change: -0.4, weight: 14.5 },
      { name: "Amazon", ticker: "AMZN", value: 14200, change: 2.3, weight: 11.1 },
      { name: "Meta", ticker: "META", value: 8250, change: 3.1, weight: 6.5 },
    ],
  },
  p2: {
    name: "Dividend Kings", value: 89230.44, change: -1205.30, pct: -1.33, desc: "High-yield dividend aristocrats",
    holdings: [
      { name: "Johnson & Johnson", ticker: "JNJ", value: 22300, change: -0.8, weight: 25.0 },
      { name: "Procter & Gamble", ticker: "PG", value: 19800, change: -1.2, weight: 22.2 },
      { name: "Coca-Cola", ticker: "KO", value: 18100, change: -0.5, weight: 20.3 },
      { name: "PepsiCo", ticker: "PEP", value: 15200, change: -2.1, weight: 17.0 },
      { name: "3M Company", ticker: "MMM", value: 13830, change: -1.8, weight: 15.5 },
    ],
  },
  p3: {
    name: "Crypto Alpha", value: 45890.12, change: 5670.88, pct: 14.10, desc: "BTC, ETH & DeFi blue chips",
    holdings: [
      { name: "Bitcoin", ticker: "BTC", value: 22000, change: 12.5, weight: 47.9 },
      { name: "Ethereum", ticker: "ETH", value: 12500, change: 18.3, weight: 27.2 },
      { name: "Solana", ticker: "SOL", value: 6200, change: 8.7, weight: 13.5 },
      { name: "Chainlink", ticker: "LINK", value: 3100, change: 5.2, weight: 6.8 },
      { name: "Aave", ticker: "AAVE", value: 2090, change: 22.1, weight: 4.6 },
    ],
  },
  p4: {
    name: "Global Macro", value: 62100.00, change: 890.50, pct: 1.45, desc: "Multi-asset global macro strategy",
    holdings: [
      { name: "iShares MSCI World", ticker: "URTH", value: 18600, change: 0.9, weight: 30.0 },
      { name: "Vanguard Total Bond", ticker: "BND", value: 12400, change: 0.2, weight: 20.0 },
      { name: "SPDR Gold Trust", ticker: "GLD", value: 9300, change: 1.8, weight: 15.0 },
      { name: "iShares EM", ticker: "EEM", value: 8700, change: 2.1, weight: 14.0 },
      { name: "US Dollar Index", ticker: "UUP", value: 6500, change: -0.3, weight: 10.5 },
      { name: "iShares TIPS", ticker: "TIP", value: 6600, change: 0.4, weight: 10.5 },
    ],
  },
  p5: {
    name: "Real Estate REIT", value: 38400.60, change: -420.10, pct: -1.08, desc: "Commercial & residential REITs",
    holdings: [
      { name: "Prologis", ticker: "PLD", value: 11500, change: -0.9, weight: 29.9 },
      { name: "American Tower", ticker: "AMT", value: 10200, change: -1.5, weight: 26.6 },
      { name: "Realty Income", ticker: "O", value: 9400, change: -0.3, weight: 24.5 },
      { name: "Digital Realty", ticker: "DLR", value: 7300, change: -1.8, weight: 19.0 },
    ],
  },
};

export default function Redesign11Portfolio() {
  const { id } = useParams();
  const port = DATA[id as string] || DATA.p1;
  const up = port.change >= 0;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: "#09090b" }}>
      {/* Left: Overview */}
      <div className="lg:w-[45%] lg:min-h-screen lg:sticky lg:top-10 border-r" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="px-8 py-5 border-b flex items-center gap-3" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <Link href="/redesign/11"><Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white h-7 px-2"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center"><DollarSign className="h-4 w-4 text-white" /></div>
          <span className="text-base font-semibold text-white">Stratton</span>
        </div>

        <div className="px-8 pt-12 pb-8">
          <p className="text-blue-400 text-xs font-semibold uppercase tracking-[0.2em] mb-2">{port.desc}</p>
          <h1 className="text-4xl font-bold text-white tracking-tighter mb-4">{port.name}</h1>
          <p className="text-5xl font-bold text-white tracking-tighter">${port.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <div className={`flex items-center gap-2 mt-3 ${up ? "text-emerald-400" : "text-red-400"}`}>
            {up ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
            <span className="text-lg font-semibold">{up ? "+" : ""}{port.pct.toFixed(2)}%</span>
            <span className="text-sm text-zinc-600">(${Math.abs(port.change).toLocaleString(undefined, { minimumFractionDigits: 2 })})</span>
          </div>
        </div>

        <Separator className="bg-white/[0.06]" />

        {/* Stats */}
        <div className="px-8 py-6 grid grid-cols-2 gap-4">
          {[
            { icon: Layers, label: "Holdings", val: port.holdings.length },
            { icon: PieChart, label: "Top Holding", val: port.holdings[0]?.ticker },
            { icon: TrendingUp, label: "Best Today", val: `+${Math.max(...port.holdings.map((h: any) => h.change))}%` },
            { icon: TrendingDown, label: "Worst Today", val: `${Math.min(...port.holdings.map((h: any) => h.change))}%` },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <s.icon className="h-4 w-4 text-zinc-600 mb-2" />
              <p className="text-xs text-zinc-600 mb-1">{s.label}</p>
              <p className="text-lg font-bold text-white">{s.val}</p>
            </div>
          ))}
        </div>

        <Separator className="bg-white/[0.06]" />

        {/* AI */}
        <div className="px-8 py-6">
          <div className="flex items-center gap-2 mb-3"><Sparkles className="h-4 w-4 text-blue-400" /><p className="text-xs text-zinc-600 font-semibold uppercase tracking-[0.15em]">AI Summary</p></div>
          <div className="rounded-xl border border-blue-600/20 bg-blue-600/5 p-4">
            <p className="text-sm text-zinc-300 leading-relaxed">This portfolio is {up ? "performing well" : "underperforming"} with {port.holdings[0]?.name} as the dominant holding at {port.holdings[0]?.weight}% weight. {up ? "Momentum indicators are positive." : "Consider reviewing sector allocation."}</p>
          </div>
        </div>
      </div>

      {/* Right: Holdings */}
      <div className="lg:w-[55%] lg:min-h-screen">
        <div className="px-8 py-5 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="text-xs text-zinc-600 font-semibold uppercase tracking-[0.15em]">Holdings</p>
          <Badge variant="outline" className="border-white/10 text-zinc-500 text-xs">{port.holdings.length} positions</Badge>
        </div>
        <div className="px-8 py-6 flex flex-col gap-4">
          {port.holdings.map((h: any) => {
            const hup = h.change >= 0;
            return (
              <div key={h.ticker} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.03] transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center text-sm font-bold text-white">{h.ticker.slice(0, 2)}</div>
                    <div>
                      <p className="text-white font-semibold">{h.name}</p>
                      <p className="text-xs text-zinc-600">{h.ticker}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">${h.value.toLocaleString()}</p>
                    <span className={`text-xs font-semibold ${hup ? "text-emerald-400" : "text-red-400"}`}>
                      {hup ? "+" : ""}{h.change}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={h.weight} className="h-1.5 flex-1 bg-white/[0.04]" />
                  <span className="text-xs text-zinc-600 font-medium w-12 text-right">{h.weight}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
