"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown,
  Sparkles, ChevronLeft, ChevronRight, ArrowRight,
  Layers, BarChart3, DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/* ─── Mock Data ─── */
const PORTFOLIOS = [
  { id: "p1", name: "Tech Growth Fund", value: 127450.82, change: 3420.15, pct: 2.76, assets: 12, desc: "Large-cap tech focused on AI & cloud", color: "#3b82f6",
    topHoldings: ["NVDA", "AAPL", "MSFT", "GOOGL"] },
  { id: "p2", name: "Dividend Kings", value: 89230.44, change: -1205.30, pct: -1.33, assets: 8, desc: "High-yield dividend aristocrats", color: "#8b5cf6",
    topHoldings: ["JNJ", "PG", "KO", "PEP"] },
  { id: "p3", name: "Crypto Alpha", value: 45890.12, change: 5670.88, pct: 14.10, assets: 6, desc: "BTC, ETH & DeFi blue chips", color: "#f59e0b",
    topHoldings: ["BTC", "ETH", "SOL", "LINK"] },
  { id: "p4", name: "Global Macro", value: 62100.00, change: 890.50, pct: 1.45, assets: 15, desc: "Multi-asset global macro strategy", color: "#22c55e",
    topHoldings: ["URTH", "BND", "GLD", "EEM"] },
  { id: "p5", name: "Real Estate REIT", value: 38400.60, change: -420.10, pct: -1.08, assets: 4, desc: "Commercial & residential REITs", color: "#ef4444",
    topHoldings: ["PLD", "AMT", "O", "DLR"] },
];
const BENCHMARKS = [
  { name: "S&P 500", value: 5892.34, change: 0.87 },
  { name: "NASDAQ", value: 19234.78, change: 1.23 },
  { name: "DOW Jones", value: 43567.12, change: -0.32 },
];
const TOTAL = PORTFOLIOS.reduce((s, p) => s + p.value, 0);
const TOTAL_CHG = PORTFOLIOS.reduce((s, p) => s + p.change, 0);

const AI_INSIGHTS = [
  "Tech Growth is outperforming benchmarks by 1.4% -- NVIDIA driving gains.",
  "Dividend Kings decline is sector-wide, not portfolio-specific.",
  "Crypto Alpha volatility is 3x higher than your other portfolios.",
  "Consider rebalancing Global Macro -- bonds underweight vs target.",
];

export default function Redesign13() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = PORTFOLIOS[activeIdx];
  const up = active.change >= 0;

  const prev = () => setActiveIdx((i) => (i === 0 ? PORTFOLIOS.length - 1 : i - 1));
  const next = () => setActiveIdx((i) => (i === PORTFOLIOS.length - 1 ? 0 : i + 1));

  return (
    <div className="min-h-screen" style={{ background: "#09090b" }}>
      {/* ── Nav ── */}
      <nav className="sticky top-10 z-40 backdrop-blur-xl border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(9,9,11,0.9)" }}>
        <div className="max-w-[1100px] mx-auto flex items-center justify-between px-8 h-14">
          <span className="text-base font-bold text-white tracking-tight">Prism</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-500">Net Worth</span>
            <span className="text-sm font-bold text-white">${TOTAL.toLocaleString()}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-[1100px] mx-auto px-8">
        {/* ── Spotlight Card ── */}
        <section className="py-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button onClick={prev} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 hover:text-white hover:border-white/20 transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={next} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 hover:text-white hover:border-white/20 transition-colors">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            {/* Dot indicators */}
            <div className="flex items-center gap-2">
              {PORTFOLIOS.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setActiveIdx(i)}
                  className={`transition-all rounded-full ${i === activeIdx ? "w-8 h-2" : "w-2 h-2"}`}
                  style={{ backgroundColor: i === activeIdx ? p.color : "rgba(255,255,255,0.1)" }}
                />
              ))}
            </div>
          </div>

          {/* Main spotlight card */}
          <div className="rounded-3xl border border-white/[0.06] overflow-hidden relative" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)" }}>
            {/* Accent glow */}
            <div className="absolute top-0 left-0 w-80 h-80 rounded-full blur-[120px] opacity-15" style={{ backgroundColor: active.color }} />

            <div className="relative p-10 lg:p-14">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: active.color }} />
                    <Badge variant="outline" className="border-white/10 text-zinc-500 text-xs">{active.assets} assets</Badge>
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tighter mb-3">{active.name}</h2>
                  <p className="text-zinc-500 text-sm max-w-md">{active.desc}</p>

                  <div className="flex items-end gap-4 mt-8">
                    <span className="text-5xl lg:text-6xl font-bold text-white tracking-tighter">
                      ${active.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 mt-3 ${up ? "text-emerald-400" : "text-red-400"}`}>
                    {up ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                    <span className="text-lg font-semibold">{up ? "+" : ""}{active.pct.toFixed(2)}%</span>
                    <span className="text-sm text-zinc-600">(${Math.abs(active.change).toLocaleString(undefined, { minimumFractionDigits: 2 })})</span>
                  </div>
                </div>

                {/* Right side: top holdings */}
                <div className="lg:w-64">
                  <p className="text-xs text-zinc-600 font-semibold uppercase tracking-[0.15em] mb-4">Top Holdings</p>
                  <div className="flex flex-col gap-2">
                    {active.topHoldings.map((t: string, i: number) => (
                      <div key={t} className="flex items-center gap-3 rounded-lg p-3 bg-white/[0.03]">
                        <span className="text-xs text-zinc-700 font-mono w-4">{i + 1}</span>
                        <div className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: `${active.color}20`, color: active.color }}>{t.slice(0, 2)}</div>
                        <span className="text-sm text-white font-medium">{t}</span>
                      </div>
                    ))}
                  </div>
                  <Link href={`/redesign/13/${active.id}`}>
                    <Button className="w-full mt-4 rounded-xl h-11" style={{ backgroundColor: active.color, color: "#fff" }}>
                      View Portfolio <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Benchmarks ── */}
        <div className="flex items-center gap-6 pb-8 overflow-x-auto">
          {BENCHMARKS.map((b) => (
            <div key={b.name} className="flex items-center gap-3 shrink-0 rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-3">
              <div>
                <p className="text-xs text-zinc-600">{b.name}</p>
                <p className="text-sm text-white font-semibold">{b.value.toLocaleString()}</p>
              </div>
              <span className={`text-xs font-semibold ${b.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {b.change >= 0 ? "+" : ""}{b.change}%
              </span>
            </div>
          ))}
        </div>

        <Separator className="bg-white/[0.06]" />

        {/* ── AI Insights ── */}
        <section className="py-10">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <p className="text-xs text-zinc-600 font-semibold uppercase tracking-[0.15em]">AI Insights</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AI_INSIGHTS.map((ins, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-amber-400">{i + 1}</span>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">{ins}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Mini portfolio list ── */}
        <Separator className="bg-white/[0.06]" />
        <section className="py-10 pb-20">
          <p className="text-xs text-zinc-600 font-semibold uppercase tracking-[0.15em] mb-6">Quick Access</p>
          <div className="flex flex-col gap-2">
            {PORTFOLIOS.map((p, i) => {
              const pup = p.change >= 0;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveIdx(i)}
                  className={`flex items-center gap-4 rounded-xl p-4 transition-all text-left ${
                    i === activeIdx ? "bg-white/[0.04] border border-white/[0.08]" : "hover:bg-white/[0.02] border border-transparent"
                  }`}
                >
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="text-sm text-white font-medium flex-1">{p.name}</span>
                  <span className="text-sm text-white font-bold">${p.value.toLocaleString()}</span>
                  <span className={`text-xs font-semibold w-16 text-right ${pup ? "text-emerald-400" : "text-red-400"}`}>
                    {pup ? "+" : ""}{p.pct.toFixed(2)}%
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
