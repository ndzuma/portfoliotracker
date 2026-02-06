"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown,
  Sparkles, Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

const DATA: Record<string, any> = {
  p1: { name: "Tech Growth Fund", value: 127450.82, change: 3420.15, pct: 2.76, desc: "Large-cap tech focused on AI & cloud infrastructure. Overweight NVIDIA and Microsoft.", category: "Technology",
    holdings: [
      { name: "NVIDIA", ticker: "NVDA", value: 32400, change: 4.2, weight: 25.4 },
      { name: "Apple", ticker: "AAPL", value: 28900, change: 1.1, weight: 22.7 },
      { name: "Microsoft", ticker: "MSFT", value: 25200, change: 0.8, weight: 19.8 },
      { name: "Alphabet", ticker: "GOOGL", value: 18500, change: -0.4, weight: 14.5 },
      { name: "Amazon", ticker: "AMZN", value: 14200, change: 2.3, weight: 11.1 },
      { name: "Meta", ticker: "META", value: 8250, change: 3.1, weight: 6.5 },
    ] },
  p2: { name: "Dividend Kings", value: 89230.44, change: -1205.30, pct: -1.33, desc: "High-yield dividend aristocrats yielding 3.8% annually.", category: "Income",
    holdings: [
      { name: "Johnson & Johnson", ticker: "JNJ", value: 22300, change: -0.8, weight: 25.0 },
      { name: "Procter & Gamble", ticker: "PG", value: 19800, change: -1.2, weight: 22.2 },
      { name: "Coca-Cola", ticker: "KO", value: 18100, change: -0.5, weight: 20.3 },
      { name: "PepsiCo", ticker: "PEP", value: 15200, change: -2.1, weight: 17.0 },
      { name: "3M Company", ticker: "MMM", value: 13830, change: -1.8, weight: 15.5 },
    ] },
  p3: { name: "Crypto Alpha", value: 45890.12, change: 5670.88, pct: 14.10, desc: "Bitcoin-dominant digital asset allocation with DeFi exposure.", category: "Digital Assets",
    holdings: [
      { name: "Bitcoin", ticker: "BTC", value: 22000, change: 12.5, weight: 47.9 },
      { name: "Ethereum", ticker: "ETH", value: 12500, change: 18.3, weight: 27.2 },
      { name: "Solana", ticker: "SOL", value: 6200, change: 8.7, weight: 13.5 },
      { name: "Chainlink", ticker: "LINK", value: 3100, change: 5.2, weight: 6.8 },
      { name: "Aave", ticker: "AAVE", value: 2090, change: 22.1, weight: 4.6 },
    ] },
  p4: { name: "Global Macro", value: 62100.00, change: 890.50, pct: 1.45, desc: "Multi-asset global macro strategy across equities, bonds, gold.", category: "Multi-Asset",
    holdings: [
      { name: "iShares MSCI World", ticker: "URTH", value: 18600, change: 0.9, weight: 30.0 },
      { name: "Vanguard Total Bond", ticker: "BND", value: 12400, change: 0.2, weight: 20.0 },
      { name: "SPDR Gold Trust", ticker: "GLD", value: 9300, change: 1.8, weight: 15.0 },
      { name: "iShares EM", ticker: "EEM", value: 8700, change: 2.1, weight: 14.0 },
      { name: "US Dollar Index", ticker: "UUP", value: 6500, change: -0.3, weight: 10.5 },
      { name: "iShares TIPS", ticker: "TIP", value: 6600, change: 0.4, weight: 10.5 },
    ] },
  p5: { name: "Real Estate REIT", value: 38400.60, change: -420.10, pct: -1.08, desc: "Data centers and logistics REITs.", category: "Real Estate",
    holdings: [
      { name: "Prologis", ticker: "PLD", value: 11500, change: -0.9, weight: 29.9 },
      { name: "American Tower", ticker: "AMT", value: 10200, change: -1.5, weight: 26.6 },
      { name: "Realty Income", ticker: "O", value: 9400, change: -0.3, weight: 24.5 },
      { name: "Digital Realty", ticker: "DLR", value: 7300, change: -1.8, weight: 19.0 },
    ] },
};

export default function Redesign12Portfolio() {
  const { id } = useParams();
  const port = DATA[id as string] || DATA.p1;
  const up = port.change >= 0;

  return (
    <div className="min-h-screen" style={{ background: "#fafaf9" }}>
      <header className="sticky top-10 z-40 border-b bg-white/80 backdrop-blur-md" style={{ borderColor: "#e7e5e4" }}>
        <div className="max-w-[1200px] mx-auto flex items-center justify-between px-8 h-14">
          <span className="text-lg font-bold tracking-tight text-stone-900" style={{ fontStyle: "italic" }}>The Portfolio Journal</span>
          <Badge variant="outline" className="text-xs border-stone-300 text-stone-500">Feb 6, 2026</Badge>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-8">
        <div className="pt-8 pb-4">
          <Link href="/redesign/12"><Button variant="ghost" size="sm" className="text-stone-500 hover:text-stone-900 -ml-3"><ArrowLeft className="h-4 w-4 mr-2" />All Portfolios</Button></Link>
        </div>

        {/* Article Header */}
        <section className="pb-8">
          <Badge className="bg-stone-100 text-stone-500 hover:bg-stone-100 border-0 text-xs mb-4">{port.category}</Badge>
          <h1 className="text-5xl lg:text-6xl font-bold tracking-tighter text-stone-900 leading-[0.95] mb-4">{port.name}</h1>
          <p className="text-stone-500 text-lg leading-relaxed max-w-[600px]">{port.desc}</p>
          <div className="flex items-center gap-6 mt-6">
            <span className="text-4xl font-bold text-stone-900">${port.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <div className={`flex items-center gap-1.5 text-lg font-semibold ${up ? "text-emerald-600" : "text-red-600"}`}>
              {up ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
              {up ? "+" : ""}{port.pct.toFixed(2)}%
            </div>
          </div>
        </section>

        <Separator className="bg-stone-200" />

        {/* AI Pull Quote */}
        <section className="py-10">
          <div className="rounded-2xl bg-stone-900 p-8 relative overflow-hidden">
            <div className="absolute top-4 right-4 opacity-10"><Quote className="h-16 w-16 text-white" /></div>
            <div className="relative flex items-start gap-4">
              <Sparkles className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-white/90 text-sm leading-relaxed italic">{`"${port.name} is ${up ? "trending positively" : "facing headwinds"} with ${port.holdings[0]?.name} as the dominant position at ${port.holdings[0]?.weight}%. ${up ? "Momentum indicators suggest continued strength." : "Consider reviewing sector allocation for potential rebalancing opportunities."} Overall exposure across ${port.holdings.length} positions provides ${up ? "solid" : "moderate"} diversification."`}</p>
            </div>
          </div>
        </section>

        <Separator className="bg-stone-200" />

        {/* Holdings as editorial cards */}
        <section className="py-10">
          <p className="text-xs text-stone-400 font-semibold uppercase tracking-[0.25em] mb-8">Holdings ({port.holdings.length})</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {port.holdings.map((h: any, i: number) => {
              const hup = h.change >= 0;
              return (
                <div key={h.ticker} className="rounded-xl border border-stone-200 bg-white p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-sm font-bold text-stone-700">{String(i + 1).padStart(2, "0")}</div>
                      <div>
                        <p className="text-stone-900 font-semibold">{h.name}</p>
                        <p className="text-xs text-stone-400">{h.ticker}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`border-0 text-xs ${hup ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                      {hup ? "+" : ""}{h.change}%
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-stone-900 mb-3">${h.value.toLocaleString()}</p>
                  <div className="flex items-center gap-3">
                    <Progress value={h.weight} className="h-1.5 flex-1" />
                    <span className="text-xs text-stone-500 font-medium">{h.weight}%</span>
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
