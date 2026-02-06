"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown,
  Sparkles, BarChart3, Globe, Shield, Zap, DollarSign,
  ChevronRight, Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

/* ─── Mock Data ─── */
const PORTFOLIOS = [
  { id: "p1", name: "Tech Growth Fund", value: 127450.82, change: 3420.15, pct: 2.76, assets: 12, icon: Zap, desc: "AI & Cloud leaders" },
  { id: "p2", name: "Dividend Kings", value: 89230.44, change: -1205.30, pct: -1.33, assets: 8, icon: Shield, desc: "Income stability" },
  { id: "p3", name: "Crypto Alpha", value: 45890.12, change: 5670.88, pct: 14.10, assets: 6, icon: Activity, desc: "Digital assets" },
  { id: "p4", name: "Global Macro", value: 62100.00, change: 890.50, pct: 1.45, assets: 15, icon: Globe, desc: "Cross-border allocation" },
  { id: "p5", name: "Real Estate REIT", value: 38400.60, change: -420.10, pct: -1.08, assets: 4, icon: BarChart3, desc: "Property income" },
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
const ACTIVITY = [
  { time: "2 min ago", text: "NVDA crossed $920 resistance level", type: "alert" },
  { time: "18 min ago", text: "Crypto Alpha portfolio up 14% today", type: "gain" },
  { time: "1 hr ago", text: "Fed minutes released - rates unchanged", type: "news" },
  { time: "2 hr ago", text: "JNJ ex-dividend date tomorrow", type: "dividend" },
  { time: "3 hr ago", text: "BTC broke $100k support level", type: "alert" },
  { time: "5 hr ago", text: "Portfolio rebalancing suggestion available", type: "ai" },
];
const AI_INSIGHT = "Your portfolio is outperforming the S&P 500 by 1.4% this quarter. The Tech Growth Fund is your strongest performer, driven by NVIDIA's 4.2% daily gain. Consider trimming your crypto exposure as volatility indices remain elevated. Dividend Kings underperformance is sector-wide -- no action needed.";

export default function Redesign11() {
  const [selected, setSelected] = useState<string | null>(null);
  const isUp = TOTAL_CHG >= 0;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: "#09090b" }}>
      {/* ─── Left Panel: Portfolio Overview ─── */}
      <div className="lg:w-[55%] lg:min-h-screen lg:sticky lg:top-10 border-r" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-semibold text-white">Stratton</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-white/10 text-zinc-500 text-xs">Live</Badge>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        {/* Net Worth Hero */}
        <div className="px-8 pt-12 pb-8">
          <p className="text-blue-400 text-xs font-semibold uppercase tracking-[0.2em] mb-3">Total Net Worth</p>
          <h1 className="text-6xl font-bold text-white tracking-tighter leading-none mb-3">
            ${TOTAL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h1>
          <div className={`flex items-center gap-2 ${isUp ? "text-emerald-400" : "text-red-400"}`}>
            {isUp ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
            <span className="text-lg font-semibold">{isUp ? "+" : ""}${Math.abs(TOTAL_CHG).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <span className="text-sm text-zinc-600">({isUp ? "+" : ""}{TOTAL_PCT.toFixed(2)}%)</span>
          </div>
        </div>

        <Separator className="bg-white/[0.06]" />

        {/* Portfolio List */}
        <div className="px-8 py-6">
          <p className="text-xs text-zinc-600 font-semibold uppercase tracking-[0.15em] mb-4">Your Portfolios</p>
          <div className="flex flex-col gap-2">
            {PORTFOLIOS.map((p) => {
              const up = p.change >= 0;
              const active = selected === p.id;
              return (
                <Link
                  key={p.id}
                  href={`/redesign/11/${p.id}`}
                  className={`group flex items-center gap-4 rounded-xl p-4 transition-all cursor-pointer ${active ? "bg-blue-600/10 border border-blue-600/20" : "hover:bg-white/[0.03] border border-transparent"}`}
                  onMouseEnter={() => setSelected(p.id)}
                  onMouseLeave={() => setSelected(null)}
                >
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${active ? "bg-blue-600/20" : "bg-white/[0.04]"}`}>
                    <p.icon className={`h-5 w-5 ${active ? "text-blue-400" : "text-zinc-500"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">{p.name}</p>
                      <p className="text-sm font-bold text-white">${p.value.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-zinc-600">{p.assets} assets</p>
                      <span className={`text-xs font-medium ${up ? "text-emerald-400" : "text-red-400"}`}>
                        {up ? "+" : ""}{p.pct.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 shrink-0 transition-colors ${active ? "text-blue-400" : "text-zinc-700"}`} />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Allocation bar */}
        <div className="px-8 pb-8">
          <div className="flex h-2 rounded-full overflow-hidden bg-white/[0.04]">
            {PORTFOLIOS.map((p, i) => {
              const w = (p.value / TOTAL) * 100;
              const c = ["#3b82f6", "#8b5cf6", "#f59e0b", "#22c55e", "#ef4444"][i];
              return <div key={p.id} style={{ width: `${w}%`, backgroundColor: c }} />;
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {PORTFOLIOS.map((p, i) => {
              const c = ["#3b82f6", "#8b5cf6", "#f59e0b", "#22c55e", "#ef4444"][i];
              return (
                <div key={p.id} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                  <span className="text-xs text-zinc-600">{((p.value / TOTAL) * 100).toFixed(0)}% {p.name.split(" ")[0]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Right Panel: Market Data + Activity ─── */}
      <div className="lg:w-[45%] lg:min-h-screen">
        {/* Markets Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <p className="text-xs text-zinc-600 font-semibold uppercase tracking-[0.15em]">Markets & Intelligence</p>
          <Badge variant="outline" className="border-white/10 text-zinc-500 text-xs">Feb 6, 2026</Badge>
        </div>

        {/* Benchmarks */}
        <div className="px-8 py-6">
          <p className="text-xs text-zinc-600 font-semibold uppercase tracking-[0.15em] mb-4">Benchmarks</p>
          <div className="grid grid-cols-2 gap-3">
            {BENCHMARKS.map((b) => {
              const up = b.change >= 0;
              return (
                <div key={b.name} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <p className="text-xs text-zinc-600 mb-1">{b.name}</p>
                  <p className="text-lg font-bold text-white">{b.value.toLocaleString()}</p>
                  <div className={`flex items-center gap-1 mt-1 ${up ? "text-emerald-400" : "text-red-400"}`}>
                    {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span className="text-xs font-semibold">{up ? "+" : ""}{b.change}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Separator className="bg-white/[0.06]" />

        {/* AI Insight */}
        <div className="px-8 py-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <p className="text-xs text-zinc-600 font-semibold uppercase tracking-[0.15em]">AI Intelligence</p>
          </div>
          <div className="rounded-xl border border-blue-600/20 bg-blue-600/5 p-5">
            <p className="text-sm text-zinc-300 leading-relaxed">{AI_INSIGHT}</p>
          </div>
        </div>

        <Separator className="bg-white/[0.06]" />

        {/* Activity Feed */}
        <div className="px-8 py-6">
          <p className="text-xs text-zinc-600 font-semibold uppercase tracking-[0.15em] mb-4">Activity Feed</p>
          <ScrollArea className="h-[280px]">
            <div className="flex flex-col gap-3">
              {ACTIVITY.map((a, i) => {
                const dotColor = a.type === "gain" ? "bg-emerald-500" : a.type === "alert" ? "bg-amber-500" : a.type === "ai" ? "bg-blue-500" : a.type === "dividend" ? "bg-purple-500" : "bg-zinc-600";
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1.5 shrink-0">
                      <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-zinc-300">{a.text}</p>
                      <p className="text-xs text-zinc-700 mt-0.5">{a.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
