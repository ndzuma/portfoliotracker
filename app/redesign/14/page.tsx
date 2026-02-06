"use client";

import Link from "next/link";
import {
  ArrowUpRight, ArrowDownRight, Terminal, Sparkles,
  Cpu, Activity, Database,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

/* ─── Mock Data ─── */
const PORTFOLIOS = [
  { id: "p1", name: "tech_growth", label: "Tech Growth Fund", value: 127450.82, change: 3420.15, pct: 2.76, assets: 12, status: "ACTIVE" },
  { id: "p2", name: "div_kings", label: "Dividend Kings", value: 89230.44, change: -1205.30, pct: -1.33, assets: 8, status: "ACTIVE" },
  { id: "p3", name: "crypto_alpha", label: "Crypto Alpha", value: 45890.12, change: 5670.88, pct: 14.10, assets: 6, status: "VOLATILE" },
  { id: "p4", name: "global_macro", label: "Global Macro", value: 62100.00, change: 890.50, pct: 1.45, assets: 15, status: "ACTIVE" },
  { id: "p5", name: "reit_core", label: "Real Estate REIT", value: 38400.60, change: -420.10, pct: -1.08, assets: 4, status: "WATCH" },
];
const TOTAL = PORTFOLIOS.reduce((s, p) => s + p.value, 0);
const TOTAL_CHG = PORTFOLIOS.reduce((s, p) => s + p.change, 0);
const TOTAL_PCT = (TOTAL_CHG / (TOTAL - TOTAL_CHG)) * 100;

const SYSTEM_LOG = [
  { ts: "14:23:01", msg: "Market data refreshed -- 5 portfolios synced", level: "INFO" },
  { ts: "14:22:45", msg: "NVDA crossed $920 resistance -- alert triggered", level: "WARN" },
  { ts: "14:20:12", msg: "Crypto Alpha volatility index: 3.2x baseline", level: "WARN" },
  { ts: "14:18:30", msg: "Fed minutes released -- rates unchanged Q2 2026", level: "INFO" },
  { ts: "14:15:00", msg: "Portfolio rebalancing scan complete -- 1 suggestion", level: "INFO" },
  { ts: "14:10:22", msg: "JNJ ex-dividend date: 2026-02-07", level: "INFO" },
  { ts: "14:05:11", msg: "BTC support level breached at $100,240", level: "CRIT" },
];

const AI_OUTPUT = `> analyze --portfolio all --depth full
---
STATUS: Portfolio health assessment complete.
  - tech_growth:  OUTPERFORMING  (+2.76% vs SPX +0.87%)
  - div_kings:    UNDERPERFORM   (-1.33% -- sector-wide)
  - crypto_alpha: HIGH VOLATILITY (+14.10% -- 3.2x baseline)
  - global_macro: STABLE         (+1.45% -- within range)
  - reit_core:    WATCH          (-1.08% -- rate sensitive)

RECOMMENDATION: Trim NVDA above 25% weight. Rotate into
mid-cap software. Crypto exposure elevated -- set stop-loss.
Dividend decline is systemic, no action required.
---`;

export default function Redesign14() {
  return (
    <div className="min-h-screen font-mono" style={{ background: "#0a0a0a" }}>
      {/* ── Status Bar ── */}
      <header className="sticky top-10 z-40 border-b" style={{ borderColor: "#1a1a1a", background: "#0a0a0a" }}>
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 h-10">
          <div className="flex items-center gap-3">
            <Terminal className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs text-emerald-500 font-bold tracking-wider">FOLIO_TERM</span>
            <span className="text-xs text-zinc-700">v2.4.1</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Cpu className="h-3 w-3 text-zinc-600" />
              <span className="text-xs text-zinc-600">CPU 12%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className="h-3 w-3 text-zinc-600" />
              <span className="text-xs text-zinc-600">LATENCY 4ms</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Database className="h-3 w-3 text-zinc-600" />
              <span className="text-xs text-zinc-600">5 CONN</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-emerald-600">LIVE</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* ── Net Worth Block ── */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-zinc-700">$</span>
            <span className="text-xs text-emerald-600">net_worth</span>
            <span className="text-xs text-zinc-700">--format=usd --date=today</span>
          </div>
          <div className="rounded-lg border p-6" style={{ borderColor: "#1a1a1a", background: "#0d0d0d" }}>
            <div className="flex items-end gap-6 flex-wrap">
              <span className="text-5xl font-bold text-emerald-400 tracking-tight">
                ${TOTAL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <div className={`flex items-center gap-2 pb-1 ${TOTAL_CHG >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {TOTAL_CHG >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                <span className="text-lg font-bold">{TOTAL_CHG >= 0 ? "+" : ""}{TOTAL_PCT.toFixed(2)}%</span>
              </div>
              <span className="text-xs text-zinc-700 pb-1.5">{`// ${PORTFOLIOS.length} portfolios | ${PORTFOLIOS.reduce((s, p) => s + p.assets, 0)} assets`}</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left: Portfolio Table ── */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-zinc-700">$</span>
              <span className="text-xs text-emerald-600">ls</span>
              <span className="text-xs text-zinc-700">portfolios/ --sort=value --desc</span>
            </div>
            <div className="rounded-lg border" style={{ borderColor: "#1a1a1a", background: "#0d0d0d" }}>
              {/* Header row */}
              <div className="flex items-center gap-2 px-5 py-3 border-b text-xs text-zinc-600" style={{ borderColor: "#1a1a1a" }}>
                <span className="w-8">#</span>
                <span className="flex-1">NAME</span>
                <span className="w-28 text-right">VALUE</span>
                <span className="w-20 text-right">CHANGE</span>
                <span className="w-20 text-right">STATUS</span>
                <span className="w-8" />
              </div>
              {PORTFOLIOS.map((p, i) => {
                const up = p.change >= 0;
                const statusColor = p.status === "VOLATILE" ? "text-amber-500" : p.status === "WATCH" ? "text-red-500" : "text-emerald-500";
                return (
                  <Link key={p.id} href={`/redesign/14/${p.id}`} className="group">
                    <div className={`flex items-center gap-2 px-5 py-4 border-b transition-colors hover:bg-emerald-500/[0.03]`} style={{ borderColor: "#1a1a1a" }}>
                      <span className="text-xs text-zinc-700 w-8 font-mono">{String(i).padStart(2, "0")}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-zinc-300 font-medium">{p.name}</span>
                        <span className="text-xs text-zinc-700 ml-2">{p.assets} assets</span>
                      </div>
                      <span className="w-28 text-right text-sm text-white font-bold">${p.value.toLocaleString()}</span>
                      <span className={`w-20 text-right text-xs font-bold ${up ? "text-emerald-400" : "text-red-400"}`}>
                        {up ? "+" : ""}{p.pct.toFixed(2)}%
                      </span>
                      <Badge variant="outline" className={`w-20 justify-center border-0 text-[10px] ${statusColor} bg-transparent`}>
                        [{p.status}]
                      </Badge>
                      <span className="w-8 text-right text-zinc-700 group-hover:text-emerald-500 text-xs transition-colors">{"->"}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ── Right: System Log + AI ── */}
          <div className="flex flex-col gap-6">
            {/* System Log */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-zinc-700">$</span>
                <span className="text-xs text-emerald-600">tail</span>
                <span className="text-xs text-zinc-700">-f /var/log/market.log</span>
              </div>
              <div className="rounded-lg border p-4 max-h-[260px] overflow-y-auto" style={{ borderColor: "#1a1a1a", background: "#0d0d0d" }}>
                {SYSTEM_LOG.map((log, i) => {
                  const lc = log.level === "CRIT" ? "text-red-500" : log.level === "WARN" ? "text-amber-500" : "text-zinc-600";
                  return (
                    <div key={i} className="flex items-start gap-2 mb-2 last:mb-0">
                      <span className="text-[10px] text-zinc-700 shrink-0 mt-0.5">{log.ts}</span>
                      <span className={`text-[10px] font-bold shrink-0 mt-0.5 w-8 ${lc}`}>{log.level}</span>
                      <span className="text-xs text-zinc-500">{log.msg}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Analysis */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-3 w-3 text-emerald-500" />
                <span className="text-xs text-emerald-600">ai_analyst</span>
                <span className="text-xs text-zinc-700">--mode=full</span>
              </div>
              <div className="rounded-lg border p-4" style={{ borderColor: "#1a1a1a", background: "#0d0d0d" }}>
                <pre className="text-[11px] text-zinc-500 leading-relaxed whitespace-pre-wrap">{AI_OUTPUT}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Allocation bar */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-zinc-700">$</span>
            <span className="text-xs text-emerald-600">chart</span>
            <span className="text-xs text-zinc-700">allocation --style=bar</span>
          </div>
          <div className="rounded-lg border p-4" style={{ borderColor: "#1a1a1a", background: "#0d0d0d" }}>
            <div className="flex flex-col gap-2">
              {PORTFOLIOS.map((p) => {
                const w = (p.value / TOTAL) * 100;
                return (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="text-xs text-zinc-600 w-28 truncate">{p.name}</span>
                    <div className="flex-1 h-3 rounded-sm bg-zinc-900 overflow-hidden">
                      <div className="h-full rounded-sm bg-emerald-600/60" style={{ width: `${w}%` }} />
                    </div>
                    <span className="text-xs text-zinc-500 w-12 text-right">{w.toFixed(1)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 mt-6 pb-8">
          <span className="text-xs text-emerald-600 animate-pulse">_</span>
          <span className="text-xs text-zinc-700">Ready for input...</span>
        </div>
      </div>
    </div>
  );
}
