"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown,
  ChevronRight, ChevronLeft, Wallet, Search, Bell,
  Sparkles, Plus, BarChart3, Newspaper, Star, Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/* ─── Mock Data ─── */
const PORTFOLIOS = [
  { id: "p1", name: "Tech Growth Fund", value: 127450.82, change: 3420.15, pct: 2.76, assets: 12, desc: "Large-cap tech focused on AI & cloud" },
  { id: "p2", name: "Dividend Kings", value: 89230.44, change: -1205.30, pct: -1.33, assets: 8, desc: "High-yield dividend aristocrats" },
  { id: "p3", name: "Crypto Alpha", value: 45890.12, change: 5670.88, pct: 14.10, assets: 6, desc: "BTC, ETH & DeFi blue chips" },
  { id: "p4", name: "Global Macro", value: 62100.00, change: 890.50, pct: 1.45, assets: 15, desc: "Multi-asset global macro strategy" },
  { id: "p5", name: "Real Estate REIT", value: 38400.60, change: -420.10, pct: -1.08, assets: 4, desc: "Commercial & residential REITs" },
];
const BENCHMARKS = [
  { name: "S&P 500", ticker: "SPX", value: 5892.34, change: 0.87 },
  { name: "NASDAQ", ticker: "IXIC", value: 19234.78, change: 1.23 },
  { name: "DOW", ticker: "DJI", value: 43567.12, change: -0.32 },
  { name: "Russell 2000", ticker: "RUT", value: 2156.89, change: 0.45 },
  { name: "VIX", ticker: "VIX", value: 14.23, change: -2.10 },
];
const TOTAL = PORTFOLIOS.reduce((s, p) => s + p.value, 0);
const TOTAL_CHG = PORTFOLIOS.reduce((s, p) => s + p.change, 0);
const TOTAL_PCT = (TOTAL_CHG / (TOTAL - TOTAL_CHG)) * 100;
const AI_INSIGHT = "Markets are showing resilience despite mixed signals from the Fed. Tech sector continues to lead, driven by AI spending momentum. Your portfolio is outperforming the S&P 500 by 1.4% this quarter. Consider rebalancing toward defensive positions as rate uncertainty persists through Q2.";

/* ─── Sparkline ─── */
function Spark({ up, className = "" }: { up: boolean; className?: string }) {
  const pts = up
    ? "0,20 10,18 20,22 30,15 40,17 50,12 60,14 70,8 80,7"
    : "0,5 10,8 20,4 30,10 40,12 50,18 60,13 70,20 80,22";
  return (
    <svg viewBox="0 0 80 25" className={className} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={up ? "#22c55e" : "#ef4444"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Redesign10() {
  return (
    <div className="min-h-screen" style={{ background: "#09090b" }}>
      {/* ── Nav ── */}
      <nav className="sticky top-10 z-40 backdrop-blur-xl border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(9,9,11,0.9)" }}>
        <div className="max-w-[1600px] mx-auto flex items-center justify-between px-8 h-16">
          <div className="flex items-center gap-8">
            <Link href="/redesign/10" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <Wallet className="h-4 w-4 text-black" />
              </div>
              <span className="text-lg font-semibold text-white tracking-tight">Meridian</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {[{ l: "Overview", icon: BarChart3, a: true }, { l: "Markets", icon: TrendingUp }, { l: "News", icon: Newspaper }, { l: "Settings", icon: Settings }].map((n) => (
                <button key={n.l} className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${n.a ? "bg-white/[0.08] text-white" : "text-zinc-500 hover:text-white hover:bg-white/[0.04]"}`}>
                  <n.icon className="h-4 w-4" />{n.l}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.04]"><Search className="h-4 w-4" /></button>
            <button className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.04] relative"><Bell className="h-4 w-4" /><span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" /></button>
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10" />
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,197,94,0.06),transparent)]" />
        <div className="relative max-w-[1600px] mx-auto px-8 pt-20 pb-14">
          <p className="text-zinc-600 text-sm font-medium tracking-widest uppercase mb-4">Total Net Worth</p>
          <div className="flex items-end gap-6 flex-wrap">
            <h1 className="text-7xl lg:text-[88px] font-bold text-white tracking-tighter leading-none">
              ${TOTAL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h1>
            <div className={`flex items-center gap-2 pb-3 ${TOTAL_CHG >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              {TOTAL_CHG >= 0 ? <ArrowUpRight className="h-6 w-6" /> : <ArrowDownRight className="h-6 w-6" />}
              <span className="text-2xl font-semibold">+{TOTAL_PCT.toFixed(2)}%</span>
            </div>
          </div>
          <p className="text-zinc-600 text-sm mt-3">+${TOTAL_CHG.toLocaleString(undefined, { minimumFractionDigits: 2 })} today across {PORTFOLIOS.length} portfolios</p>
        </div>
      </section>

      {/* ── Ticker ── */}
      <div className="border-y" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="max-w-[1600px] mx-auto flex items-center overflow-x-auto">
          {BENCHMARKS.map((b, i) => (
            <div key={b.ticker} className={`flex items-center gap-4 px-6 py-3 shrink-0 ${i < BENCHMARKS.length - 1 ? "border-r" : ""}`} style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div>
                <p className="text-xs text-zinc-600 font-medium">{b.ticker}</p>
                <p className="text-sm text-white font-semibold">{b.value.toLocaleString()}</p>
              </div>
              <Spark up={b.change >= 0} className="w-16 h-6" />
              <span className={`text-xs font-semibold ${b.change >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {b.change >= 0 ? "+" : ""}{b.change}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Portfolio Carousel ── */}
      <section className="max-w-[1600px] mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Portfolios</h2>
            <p className="text-zinc-600 text-sm mt-1">{PORTFOLIOS.length} active portfolios</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-transparent border-white/10 text-white hover:bg-white/[0.06] hover:text-white h-9">
              <Plus className="h-4 w-4 mr-2" />New
            </Button>
            <button className="p-2 rounded-lg border border-white/10 text-zinc-500 hover:text-white"><ChevronLeft className="h-4 w-4" /></button>
            <button className="p-2 rounded-lg border border-white/10 text-zinc-500 hover:text-white"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-2 snap-x snap-mandatory">
          {PORTFOLIOS.map((p) => {
            const up = p.change >= 0;
            return (
              <Link key={p.id} href={`/redesign/10/${p.id}`} className="group min-w-[310px] flex-1 snap-start">
                <div className="relative rounded-2xl border border-white/[0.06] bg-zinc-950 p-6 hover:border-white/[0.12] transition-all hover:bg-zinc-900/50">
                  <div className="absolute bottom-0 left-0 right-0 h-20 opacity-[0.06] overflow-hidden rounded-b-2xl">
                    <Spark up={up} className="w-full h-full" />
                  </div>
                  <div className="relative">
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <p className="text-white font-semibold text-lg">{p.name}</p>
                        <p className="text-zinc-600 text-sm mt-0.5">{p.assets} assets</p>
                      </div>
                      <Badge variant="outline" className={`border-0 text-xs ${up ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                        {up ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                        {up ? "+" : ""}{p.pct.toFixed(2)}%
                      </Badge>
                    </div>
                    <p className="text-3xl font-bold text-white tracking-tight">${p.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <p className={`text-sm mt-1 ${up ? "text-emerald-500" : "text-red-500"}`}>
                      {up ? "+" : ""}${Math.abs(p.change).toLocaleString(undefined, { minimumFractionDigits: 2 })} today
                    </p>
                    <div className="flex items-center gap-1 mt-5 text-xs text-zinc-600 group-hover:text-zinc-400 transition-colors">
                      View details <ArrowUpRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── AI Insight ── */}
      <section className="max-w-[1600px] mx-auto px-8 pb-10">
        <div className="rounded-2xl border border-white/[0.06] bg-zinc-950 p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(34,197,94,0.04),transparent_50%)]" />
          <div className="relative flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-zinc-600 font-semibold uppercase tracking-widest mb-2">AI Market Intelligence</p>
              <p className="text-zinc-400 text-sm leading-relaxed">{AI_INSIGHT}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Allocation ── */}
      <section className="max-w-[1600px] mx-auto px-8 pb-20">
        <h3 className="text-lg font-semibold text-white mb-5">Allocation</h3>
        <div className="flex h-3 rounded-full overflow-hidden bg-white/[0.04] mb-6">
          {PORTFOLIOS.map((p, i) => {
            const w = (p.value / TOTAL) * 100;
            const c = ["#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"][i];
            return <div key={p.id} style={{ width: `${w}%`, backgroundColor: c }} />;
          })}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {PORTFOLIOS.map((p, i) => {
            const c = ["#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444"][i];
            return (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c }} />
                <div>
                  <p className="text-sm text-white font-medium">{p.name}</p>
                  <p className="text-xs text-zinc-600">{((p.value / TOTAL) * 100).toFixed(1)}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
