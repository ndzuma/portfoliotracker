"use client";

import Link from "next/link";
import {
  ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown,
  Sparkles, Quote, ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

/* ─── Mock Data ─── */
const PORTFOLIOS = [
  { id: "p1", name: "Tech Growth Fund", value: 127450.82, change: 3420.15, pct: 2.76, assets: 12, desc: "Large-cap tech focused on AI & cloud infrastructure. Overweight NVIDIA and Microsoft.", category: "Technology" },
  { id: "p2", name: "Dividend Kings", value: 89230.44, change: -1205.30, pct: -1.33, assets: 8, desc: "Blue-chip dividend aristocrats yielding 3.8% annually. Focused on consumer staples.", category: "Income" },
  { id: "p3", name: "Crypto Alpha", value: 45890.12, change: 5670.88, pct: 14.10, assets: 6, desc: "Bitcoin-dominant digital asset allocation with DeFi exposure through Ethereum and Solana.", category: "Digital Assets" },
  { id: "p4", name: "Global Macro", value: 62100.00, change: 890.50, pct: 1.45, assets: 15, desc: "Cross-border diversification across equities, bonds, commodities, and currencies.", category: "Multi-Asset" },
  { id: "p5", name: "Real Estate REIT", value: 38400.60, change: -420.10, pct: -1.08, assets: 4, desc: "Data centers and logistics REITs. Prologis and American Tower are core holdings.", category: "Real Estate" },
];
const BENCHMARKS = [
  { name: "S&P 500", value: 5892.34, change: 0.87 },
  { name: "NASDAQ", value: 19234.78, change: 1.23 },
  { name: "DOW Jones", value: 43567.12, change: -0.32 },
  { name: "Russell 2000", value: 2156.89, change: 0.45 },
];
const TOTAL = PORTFOLIOS.reduce((s, p) => s + p.value, 0);
const TOTAL_CHG = PORTFOLIOS.reduce((s, p) => s + p.change, 0);
const TOTAL_PCT = (TOTAL_CHG / (TOTAL - TOTAL_CHG)) * 100;

const AI_QUOTE = "Your Tech Growth Fund is your strongest performer this quarter, driven by the AI capex cycle. I'd recommend trimming NVIDIA exposure above 25% and rotating into undervalued mid-cap software names. The Dividend Kings decline is sector-wide and not a cause for concern.";

export default function Redesign12() {
  const isUp = TOTAL_CHG >= 0;
  const featured = PORTFOLIOS[0];
  const rest = PORTFOLIOS.slice(1);

  return (
    <div className="min-h-screen" style={{ background: "#fafaf9" }}>
      {/* ── Masthead ── */}
      <header className="sticky top-10 z-40 border-b bg-white/80 backdrop-blur-md" style={{ borderColor: "#e7e5e4" }}>
        <div className="max-w-[1200px] mx-auto flex items-center justify-between px-8 h-14">
          <span className="text-lg font-bold tracking-tight" style={{ color: "#1c1917", fontStyle: "italic" }}>The Portfolio Journal</span>
          <nav className="hidden md:flex items-center gap-6">
            {["Dashboard", "Markets", "Research", "Settings"].map((item, i) => (
              <button key={item} className={`text-sm font-medium transition-colors ${i === 0 ? "text-stone-900 underline underline-offset-4" : "text-stone-500 hover:text-stone-900"}`}>{item}</button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-stone-300 text-stone-500">Feb 6, 2026</Badge>
          </div>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-8">
        {/* ── Headline Section ── */}
        <section className="pt-16 pb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-4" style={{ color: "#a8a29e" }}>Portfolio Overview</p>
          <h1 className="text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.95]" style={{ color: "#1c1917" }}>
            ${TOTAL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h1>
          <div className={`flex items-center gap-3 mt-4`}>
            <span className={`flex items-center gap-1.5 text-lg font-semibold ${isUp ? "text-emerald-600" : "text-red-600"}`}>
              {isUp ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
              {isUp ? "+" : ""}{TOTAL_PCT.toFixed(2)}%
            </span>
            <span className="text-sm text-stone-400">
              {isUp ? "+" : ""}${Math.abs(TOTAL_CHG).toLocaleString(undefined, { minimumFractionDigits: 2 })} today
            </span>
          </div>
        </section>

        <Separator className="bg-stone-200" />

        {/* ── Benchmark Ticker ── */}
        <section className="flex items-center gap-8 py-4 overflow-x-auto">
          {BENCHMARKS.map((b) => {
            const up = b.change >= 0;
            return (
              <div key={b.name} className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-medium text-stone-900">{b.name}</span>
                <span className="text-sm text-stone-500">{b.value.toLocaleString()}</span>
                <span className={`text-xs font-semibold ${up ? "text-emerald-600" : "text-red-600"}`}>
                  {up ? "+" : ""}{b.change}%
                </span>
              </div>
            );
          })}
        </section>

        <Separator className="bg-stone-200" />

        {/* ── Featured + AI Grid (magazine layout) ── */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-8 py-12">
          {/* Featured Article - Large */}
          <Link href={`/redesign/12/${featured.id}`} className="lg:col-span-3 group">
            <div className="rounded-2xl border border-stone-200 bg-white p-8 hover:shadow-lg transition-shadow h-full flex flex-col">
              <Badge className="w-fit mb-4 bg-stone-100 text-stone-600 hover:bg-stone-100 border-0 text-xs">{featured.category}</Badge>
              <h2 className="text-3xl font-bold text-stone-900 tracking-tight mb-3 group-hover:text-stone-700 transition-colors">{featured.name}</h2>
              <p className="text-stone-500 text-sm leading-relaxed mb-6 flex-1">{featured.desc}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-bold text-stone-900">${featured.value.toLocaleString()}</p>
                  <div className={`flex items-center gap-1 mt-2 ${featured.change >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {featured.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span className="font-semibold">{featured.change >= 0 ? "+" : ""}{featured.pct.toFixed(2)}%</span>
                    <span className="text-stone-400 text-sm ml-1">{featured.assets} assets</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-stone-400 group-hover:text-stone-900 transition-colors">
                  Read more <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </div>
          </Link>

          {/* AI Pull Quote */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="rounded-2xl bg-stone-900 p-8 flex-1 relative overflow-hidden">
              <div className="absolute top-4 right-4 opacity-10"><Quote className="h-16 w-16 text-white" /></div>
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span className="text-xs text-stone-400 font-semibold uppercase tracking-[0.2em]">AI Analyst</span>
                </div>
                <p className="text-white/90 text-sm leading-relaxed italic">{`"${AI_QUOTE}"`}</p>
              </div>
            </div>
            {/* Mini allocation */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6">
              <p className="text-xs text-stone-400 font-semibold uppercase tracking-[0.15em] mb-4">Allocation</p>
              <div className="flex flex-col gap-3">
                {PORTFOLIOS.map((p, i) => {
                  const w = (p.value / TOTAL) * 100;
                  const colors = ["#16a34a", "#2563eb", "#d97706", "#7c3aed", "#dc2626"];
                  return (
                    <div key={p.id} className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colors[i] }} />
                      <span className="text-xs text-stone-600 flex-1 truncate">{p.name}</span>
                      <span className="text-xs font-semibold text-stone-900">{w.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <Separator className="bg-stone-200" />

        {/* ── Portfolio Articles Grid ── */}
        <section className="py-12">
          <p className="text-xs text-stone-400 font-semibold uppercase tracking-[0.25em] mb-8">All Portfolios</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rest.map((p) => {
              const up = p.change >= 0;
              return (
                <Link key={p.id} href={`/redesign/12/${p.id}`} className="group">
                  <div className="rounded-xl border border-stone-200 bg-white p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <Badge className="bg-stone-100 text-stone-500 hover:bg-stone-100 border-0 text-xs">{p.category}</Badge>
                      <Badge variant="outline" className={`border-0 text-xs ${up ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                        {up ? "+" : ""}{p.pct.toFixed(2)}%
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-stone-900 mb-2 group-hover:text-stone-700 transition-colors">{p.name}</h3>
                    <p className="text-stone-500 text-sm leading-relaxed mb-4 line-clamp-2">{p.desc}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-bold text-stone-900">${p.value.toLocaleString()}</p>
                      <span className="text-xs text-stone-400">{p.assets} assets</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
