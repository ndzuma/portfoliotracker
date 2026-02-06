"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown,
  Wallet, Sparkles, PieChart, BarChart3, DollarSign, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const DATA: Record<string, any> = {
  p1: {
    name: "Tech Growth Fund", value: 127450.82, change: 3420.15, pct: 2.76, desc: "Large-cap tech focused on AI & cloud",
    holdings: [
      { name: "NVIDIA", ticker: "NVDA", value: 32400, change: 4.2, weight: 25.4, shares: 24 },
      { name: "Apple", ticker: "AAPL", value: 28900, change: 1.1, weight: 22.7, shares: 130 },
      { name: "Microsoft", ticker: "MSFT", value: 25200, change: 0.8, weight: 19.8, shares: 60 },
      { name: "Alphabet", ticker: "GOOGL", value: 18500, change: -0.4, weight: 14.5, shares: 105 },
      { name: "Amazon", ticker: "AMZN", value: 14200, change: 2.3, weight: 11.1, shares: 72 },
      { name: "Meta", ticker: "META", value: 8250, change: 3.1, weight: 6.5, shares: 14 },
    ],
  },
  p2: {
    name: "Dividend Kings", value: 89230.44, change: -1205.30, pct: -1.33, desc: "High-yield dividend aristocrats",
    holdings: [
      { name: "Johnson & Johnson", ticker: "JNJ", value: 22300, change: -0.8, weight: 25.0, shares: 140 },
      { name: "Procter & Gamble", ticker: "PG", value: 19800, change: -1.2, weight: 22.2, shares: 120 },
      { name: "Coca-Cola", ticker: "KO", value: 18100, change: -0.5, weight: 20.3, shares: 290 },
      { name: "PepsiCo", ticker: "PEP", value: 15200, change: -2.1, weight: 17.0, shares: 88 },
      { name: "3M Company", ticker: "MMM", value: 13830, change: -1.8, weight: 15.5, shares: 110 },
    ],
  },
  p3: {
    name: "Crypto Alpha", value: 45890.12, change: 5670.88, pct: 14.10, desc: "BTC, ETH & DeFi blue chips",
    holdings: [
      { name: "Bitcoin", ticker: "BTC", value: 22000, change: 12.5, weight: 47.9, shares: 0.22 },
      { name: "Ethereum", ticker: "ETH", value: 12500, change: 18.3, weight: 27.2, shares: 3.4 },
      { name: "Solana", ticker: "SOL", value: 6200, change: 8.7, weight: 13.5, shares: 30 },
      { name: "Chainlink", ticker: "LINK", value: 3100, change: 5.2, weight: 6.8, shares: 180 },
      { name: "Aave", ticker: "AAVE", value: 2090, change: 22.1, weight: 4.6, shares: 6 },
    ],
  },
  p4: {
    name: "Global Macro", value: 62100.00, change: 890.50, pct: 1.45, desc: "Multi-asset global macro strategy",
    holdings: [
      { name: "iShares MSCI World", ticker: "URTH", value: 18600, change: 0.9, weight: 30.0, shares: 145 },
      { name: "Vanguard Total Bond", ticker: "BND", value: 12400, change: 0.2, weight: 20.0, shares: 170 },
      { name: "SPDR Gold Trust", ticker: "GLD", value: 9300, change: 1.8, weight: 15.0, shares: 38 },
      { name: "iShares Emerging Mkts", ticker: "EEM", value: 8700, change: 2.1, weight: 14.0, shares: 200 },
      { name: "US Dollar Index", ticker: "UUP", value: 6500, change: -0.3, weight: 10.5, shares: 220 },
      { name: "iShares TIPS", ticker: "TIP", value: 6600, change: 0.4, weight: 10.5, shares: 58 },
    ],
  },
  p5: {
    name: "Real Estate REIT", value: 38400.60, change: -420.10, pct: -1.08, desc: "Commercial & residential REITs",
    holdings: [
      { name: "Prologis", ticker: "PLD", value: 11500, change: -0.9, weight: 29.9, shares: 90 },
      { name: "American Tower", ticker: "AMT", value: 10200, change: -1.5, weight: 26.6, shares: 48 },
      { name: "Realty Income", ticker: "O", value: 9400, change: -0.3, weight: 24.5, shares: 160 },
      { name: "Digital Realty", ticker: "DLR", value: 7300, change: -1.8, weight: 19.0, shares: 42 },
    ],
  },
};

function Spark({ up }: { up: boolean }) {
  const pts = up ? "0,18 8,15 16,19 24,12 32,14 40,9 48,11 56,6 64,8 72,4" : "0,4 8,7 16,5 24,10 32,14 40,11 48,16 56,18 64,15 72,19";
  return (
    <svg viewBox="0 0 72 22" className="w-20 h-5" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={up ? "#22c55e" : "#ef4444"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Redesign10Portfolio() {
  const { id } = useParams();
  const port = DATA[id as string] || DATA.p1;
  const up = port.change >= 0;
  const allTypes = [...new Set(port.holdings.map(() => "Equity"))];

  return (
    <div className="min-h-screen" style={{ background: "#09090b" }}>
      {/* Nav */}
      <nav className="sticky top-10 z-40 backdrop-blur-xl border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(9,9,11,0.9)" }}>
        <div className="max-w-[1600px] mx-auto flex items-center justify-between px-8 h-16">
          <div className="flex items-center gap-4">
            <Link href="/redesign/10" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center"><Wallet className="h-4 w-4 text-black" /></div>
              <span className="text-lg font-semibold text-white tracking-tight">Meridian</span>
            </Link>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10" />
        </div>
      </nav>

      <div className="max-w-[1600px] mx-auto px-8 py-8">
        <Link href="/redesign/10">
          <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white mb-8"><ArrowLeft className="h-4 w-4 mr-2" />All Portfolios</Button>
        </Link>

        {/* Hero */}
        <div className="mb-12">
          <p className="text-zinc-600 text-sm tracking-widest uppercase mb-3">{port.desc}</p>
          <h1 className="text-5xl lg:text-6xl font-bold text-white tracking-tighter">{port.name}</h1>
          <div className="flex items-end gap-6 mt-4 flex-wrap">
            <span className="text-4xl font-bold text-white">${port.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <div className={`flex items-center gap-2 pb-1 ${up ? "text-emerald-500" : "text-red-500"}`}>
              {up ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
              <span className="text-xl font-semibold">{up ? "+" : ""}{port.pct.toFixed(2)}%</span>
              <span className="text-sm text-zinc-600">(${Math.abs(port.change).toLocaleString(undefined, { minimumFractionDigits: 2 })})</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: DollarSign, label: "Total Value", val: `$${port.value.toLocaleString()}` },
            { icon: Layers, label: "Holdings", val: port.holdings.length },
            { icon: PieChart, label: "Top Holding", val: port.holdings[0]?.ticker },
            { icon: BarChart3, label: "Top Weight", val: `${port.holdings[0]?.weight}%` },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/[0.06] bg-zinc-950 p-5">
              <div className="flex items-center gap-2 mb-3">
                <s.icon className="h-4 w-4 text-zinc-600" />
                <span className="text-xs text-zinc-600 font-medium uppercase tracking-wider">{s.label}</span>
              </div>
              <p className="text-xl font-bold text-white">{s.val}</p>
            </div>
          ))}
        </div>

        {/* AI Insight */}
        <div className="rounded-2xl border border-white/[0.06] bg-zinc-950 p-6 mb-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,rgba(34,197,94,0.03),transparent_50%)]" />
          <div className="relative flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-zinc-600 font-semibold uppercase tracking-widest mb-2">AI Analysis</p>
              <p className="text-zinc-400 text-sm leading-relaxed">This portfolio is heavily weighted toward {port.holdings[0]?.name} at {port.holdings[0]?.weight}%. Consider diversifying to reduce single-stock risk. Overall performance is {up ? "positive" : "negative"} with a {Math.abs(port.pct)}% {up ? "gain" : "loss"} this period.</p>
            </div>
          </div>
        </div>

        {/* Holdings */}
        <Tabs defaultValue="table" className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">Holdings</h2>
            <TabsList className="bg-white/[0.04]">
              <TabsTrigger value="table" className="text-xs">Table</TabsTrigger>
              <TabsTrigger value="cards" className="text-xs">Cards</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="table">
            <div className="rounded-xl border border-white/[0.06] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableHead className="text-zinc-600">Asset</TableHead>
                    <TableHead className="text-zinc-600 text-right">Value</TableHead>
                    <TableHead className="text-zinc-600 text-right">Change</TableHead>
                    <TableHead className="text-zinc-600 text-right">Weight</TableHead>
                    <TableHead className="text-zinc-600 text-right">Shares</TableHead>
                    <TableHead className="text-zinc-600 w-20">Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {port.holdings.map((h: any) => (
                    <TableRow key={h.ticker} className="border-white/[0.06] hover:bg-white/[0.02]">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-xs font-bold text-white">{h.ticker.slice(0, 2)}</div>
                          <div><p className="text-white font-medium text-sm">{h.name}</p><p className="text-zinc-600 text-xs">{h.ticker}</p></div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-white font-semibold text-sm">${h.value.toLocaleString()}</TableCell>
                      <TableCell className={`text-right text-sm font-medium ${h.change >= 0 ? "text-emerald-500" : "text-red-500"}`}>{h.change >= 0 ? "+" : ""}{h.change}%</TableCell>
                      <TableCell className="text-right text-zinc-400 text-sm">{h.weight}%</TableCell>
                      <TableCell className="text-right text-zinc-400 text-sm">{h.shares}</TableCell>
                      <TableCell><Spark up={h.change >= 0} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          <TabsContent value="cards">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {port.holdings.map((h: any) => (
                <div key={h.ticker} className="rounded-xl border border-white/[0.06] bg-zinc-950 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center text-sm font-bold text-white">{h.ticker.slice(0, 2)}</div>
                      <div><p className="text-white font-semibold">{h.name}</p><p className="text-zinc-600 text-xs">{h.ticker}</p></div>
                    </div>
                    <Badge variant="outline" className={`border-0 text-xs ${h.change >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                      {h.change >= 0 ? "+" : ""}{h.change}%
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-white">${h.value.toLocaleString()}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-zinc-600">{h.weight}% of portfolio</span>
                    <span className="text-xs text-zinc-600">{h.shares} shares</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
