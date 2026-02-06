"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowUpRight, ArrowDownRight, Terminal, Sparkles,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const DATA: Record<string, any> = {
  p1: { name: "tech_growth", label: "Tech Growth Fund", value: 127450.82, change: 3420.15, pct: 2.76, status: "ACTIVE",
    holdings: [
      { name: "NVIDIA Corp", ticker: "NVDA", value: 32400, change: 4.2, weight: 25.4, shares: 24, sector: "SEMICON" },
      { name: "Apple Inc", ticker: "AAPL", value: 28900, change: 1.1, weight: 22.7, shares: 130, sector: "TECH" },
      { name: "Microsoft Corp", ticker: "MSFT", value: 25200, change: 0.8, weight: 19.8, shares: 60, sector: "TECH" },
      { name: "Alphabet Inc", ticker: "GOOGL", value: 18500, change: -0.4, weight: 14.5, shares: 105, sector: "TECH" },
      { name: "Amazon.com Inc", ticker: "AMZN", value: 14200, change: 2.3, weight: 11.1, shares: 72, sector: "E-COMM" },
      { name: "Meta Platforms", ticker: "META", value: 8250, change: 3.1, weight: 6.5, shares: 14, sector: "SOCIAL" },
    ] },
  p2: { name: "div_kings", label: "Dividend Kings", value: 89230.44, change: -1205.30, pct: -1.33, status: "ACTIVE",
    holdings: [
      { name: "Johnson & Johnson", ticker: "JNJ", value: 22300, change: -0.8, weight: 25.0, shares: 140, sector: "HEALTH" },
      { name: "Procter & Gamble", ticker: "PG", value: 19800, change: -1.2, weight: 22.2, shares: 120, sector: "STAPLE" },
      { name: "Coca-Cola Co", ticker: "KO", value: 18100, change: -0.5, weight: 20.3, shares: 290, sector: "STAPLE" },
      { name: "PepsiCo Inc", ticker: "PEP", value: 15200, change: -2.1, weight: 17.0, shares: 88, sector: "STAPLE" },
      { name: "3M Company", ticker: "MMM", value: 13830, change: -1.8, weight: 15.5, shares: 110, sector: "INDUST" },
    ] },
  p3: { name: "crypto_alpha", label: "Crypto Alpha", value: 45890.12, change: 5670.88, pct: 14.10, status: "VOLATILE",
    holdings: [
      { name: "Bitcoin", ticker: "BTC", value: 22000, change: 12.5, weight: 47.9, shares: 0.22, sector: "L1" },
      { name: "Ethereum", ticker: "ETH", value: 12500, change: 18.3, weight: 27.2, shares: 3.4, sector: "L1" },
      { name: "Solana", ticker: "SOL", value: 6200, change: 8.7, weight: 13.5, shares: 30, sector: "L1" },
      { name: "Chainlink", ticker: "LINK", value: 3100, change: 5.2, weight: 6.8, shares: 180, sector: "ORACLE" },
      { name: "Aave Protocol", ticker: "AAVE", value: 2090, change: 22.1, weight: 4.6, shares: 6, sector: "DEFI" },
    ] },
  p4: { name: "global_macro", label: "Global Macro", value: 62100.00, change: 890.50, pct: 1.45, status: "ACTIVE",
    holdings: [
      { name: "iShares MSCI World", ticker: "URTH", value: 18600, change: 0.9, weight: 30.0, shares: 145, sector: "EQ-GLB" },
      { name: "Vanguard Total Bond", ticker: "BND", value: 12400, change: 0.2, weight: 20.0, shares: 170, sector: "BOND" },
      { name: "SPDR Gold Trust", ticker: "GLD", value: 9300, change: 1.8, weight: 15.0, shares: 38, sector: "COMMOD" },
      { name: "iShares EM", ticker: "EEM", value: 8700, change: 2.1, weight: 14.0, shares: 200, sector: "EQ-EM" },
      { name: "US Dollar Index", ticker: "UUP", value: 6500, change: -0.3, weight: 10.5, shares: 220, sector: "FX" },
      { name: "iShares TIPS", ticker: "TIP", value: 6600, change: 0.4, weight: 10.5, shares: 58, sector: "BOND" },
    ] },
  p5: { name: "reit_core", label: "Real Estate REIT", value: 38400.60, change: -420.10, pct: -1.08, status: "WATCH",
    holdings: [
      { name: "Prologis Inc", ticker: "PLD", value: 11500, change: -0.9, weight: 29.9, shares: 90, sector: "LOGIST" },
      { name: "American Tower", ticker: "AMT", value: 10200, change: -1.5, weight: 26.6, shares: 48, sector: "TOWER" },
      { name: "Realty Income", ticker: "O", value: 9400, change: -0.3, weight: 24.5, shares: 160, sector: "RETAIL" },
      { name: "Digital Realty", ticker: "DLR", value: 7300, change: -1.8, weight: 19.0, shares: 42, sector: "DATA" },
    ] },
};

export default function Redesign14Portfolio() {
  const { id } = useParams();
  const port = DATA[id as string] || DATA.p1;
  const up = port.change >= 0;
  const statusColor = port.status === "VOLATILE" ? "text-amber-500" : port.status === "WATCH" ? "text-red-500" : "text-emerald-500";

  return (
    <div className="min-h-screen font-mono" style={{ background: "#0a0a0a" }}>
      {/* Status Bar */}
      <header className="sticky top-10 z-40 border-b" style={{ borderColor: "#1a1a1a", background: "#0a0a0a" }}>
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 h-10">
          <div className="flex items-center gap-3">
            <Terminal className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs text-emerald-500 font-bold tracking-wider">FOLIO_TERM</span>
            <span className="text-xs text-zinc-700">/portfolios/{port.name}</span>
          </div>
          <Link href="/redesign/14" className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-emerald-500 transition-colors">
            <ArrowLeft className="h-3 w-3" /> cd ..
          </Link>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Portfolio Header */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-zinc-700">$</span>
            <span className="text-xs text-emerald-600">cat</span>
            <span className="text-xs text-zinc-700">portfolios/{port.name}/summary.json</span>
          </div>
          <div className="rounded-lg border p-6" style={{ borderColor: "#1a1a1a", background: "#0d0d0d" }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-lg text-zinc-300 font-bold">{port.name}</span>
              <Badge variant="outline" className={`border-0 text-[10px] ${statusColor} bg-transparent`}>[{port.status}]</Badge>
            </div>
            <p className="text-xs text-zinc-700 mb-4">{port.label} | {port.holdings.length} holdings</p>
            <div className="flex items-end gap-6 flex-wrap">
              <span className="text-4xl font-bold text-emerald-400 tracking-tight">
                ${port.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <div className={`flex items-center gap-2 pb-1 ${up ? "text-emerald-500" : "text-red-500"}`}>
                {up ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                <span className="text-lg font-bold">{up ? "+" : ""}{port.pct.toFixed(2)}%</span>
                <span className="text-xs text-zinc-700">(${Math.abs(port.change).toLocaleString(undefined, { minimumFractionDigits: 2 })})</span>
              </div>
            </div>
          </div>
        </section>

        {/* AI Analysis */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-3 w-3 text-emerald-500" />
            <span className="text-xs text-emerald-600">ai_analyst</span>
            <span className="text-xs text-zinc-700">--portfolio={port.name}</span>
          </div>
          <div className="rounded-lg border p-4" style={{ borderColor: "#1a1a1a", background: "#0d0d0d" }}>
            <pre className="text-[11px] text-zinc-500 leading-relaxed whitespace-pre-wrap">{`> analyze --portfolio ${port.name} --depth full
---
Portfolio ${port.name} contains ${port.holdings.length} positions.
Top holding: ${port.holdings[0]?.ticker} at ${port.holdings[0]?.weight}% weight.
Concentration: Top 2 = ${(port.holdings[0]?.weight + port.holdings[1]?.weight).toFixed(1)}%
Performance: ${up ? "OUTPERFORMING" : "UNDERPERFORMING"} (${up ? "+" : ""}${port.pct}%)
Risk level: ${port.status === "VOLATILE" ? "HIGH" : port.status === "WATCH" ? "ELEVATED" : "MODERATE"}

${up ? "Momentum indicators positive. Hold current allocation." : "Review sector exposure. Consider defensive rotation."}
---`}</pre>
          </div>
        </section>

        {/* Holdings Table */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-zinc-700">$</span>
            <span className="text-xs text-emerald-600">ls</span>
            <span className="text-xs text-zinc-700">portfolios/{port.name}/holdings/ -la</span>
          </div>
          <div className="rounded-lg border overflow-hidden" style={{ borderColor: "#1a1a1a", background: "#0d0d0d" }}>
            {/* Header */}
            <div className="flex items-center gap-2 px-5 py-3 border-b text-[10px] text-zinc-600 uppercase tracking-wider" style={{ borderColor: "#1a1a1a" }}>
              <span className="w-6">#</span>
              <span className="w-12">TICK</span>
              <span className="flex-1">NAME</span>
              <span className="w-16 text-right">SECTOR</span>
              <span className="w-20 text-right">VALUE</span>
              <span className="w-16 text-right">CHG%</span>
              <span className="w-14 text-right">WEIGHT</span>
              <span className="w-16 text-right">SHARES</span>
              <span className="w-28">BAR</span>
            </div>
            {port.holdings.map((h: any, i: number) => {
              const hup = h.change >= 0;
              return (
                <div key={h.ticker} className="flex items-center gap-2 px-5 py-3.5 border-b hover:bg-emerald-500/[0.02] transition-colors" style={{ borderColor: "#1a1a1a" }}>
                  <span className="text-[10px] text-zinc-700 w-6 font-mono">{String(i).padStart(2, "0")}</span>
                  <span className="text-xs text-emerald-400 font-bold w-12">{h.ticker}</span>
                  <span className="text-xs text-zinc-400 flex-1 truncate">{h.name}</span>
                  <span className="text-[10px] text-zinc-600 w-16 text-right">{h.sector}</span>
                  <span className="text-xs text-white font-bold w-20 text-right">${h.value.toLocaleString()}</span>
                  <span className={`text-xs font-bold w-16 text-right ${hup ? "text-emerald-400" : "text-red-400"}`}>
                    {hup ? "+" : ""}{h.change}%
                  </span>
                  <span className="text-xs text-zinc-500 w-14 text-right">{h.weight}%</span>
                  <span className="text-xs text-zinc-600 w-16 text-right">{h.shares}</span>
                  <div className="w-28 h-2.5 rounded-sm bg-zinc-900 overflow-hidden">
                    <div className="h-full rounded-sm bg-emerald-600/50" style={{ width: `${h.weight}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <div className="flex items-center gap-2 pb-8">
          <span className="text-xs text-emerald-600 animate-pulse">_</span>
          <span className="text-xs text-zinc-700">Ready for input...</span>
        </div>
      </div>
    </div>
  );
}
