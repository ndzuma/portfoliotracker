"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Link from "next/link";
import {
  Briefcase, TrendingUp, TrendingDown, Plus, MoreHorizontal,
  Edit, Trash2, Sparkles, Search, Bell, Newspaper, Settings,
  BarChart3, Wallet, ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { parseMarkdown, cleanMarkdownWrapper } from "@/lib/markdown-parser";
import { ChartRadialStacked } from "@/components/allocationRadial";

/* ─── Full-width Top Bar ─── */
function FullNavbar({ totalValue }: { totalValue: number }) {
  const { user } = useUser();
  return (
    <nav className="sticky top-10 z-40 border-b border-border bg-card/70 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 h-12">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            <span className="font-bold text-foreground text-sm tracking-tight">PulsePortfolio</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-0.5">
            {[
              { n: "Overview", h: "/redesign/9", active: true },
              { n: "Wallet", h: "/redesign/9", icon: Wallet },
              { n: "News", h: "/news", icon: Newspaper },
              { n: "Analytics", h: "/watchlist", icon: BarChart3 },
              { n: "Settings", h: "/settings", icon: Settings },
            ].map((item) => (
              <Link
                key={item.n}
                href={item.h}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                  item.active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.n}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input placeholder="Find Something..." className="w-44 h-7 pl-7 text-xs bg-muted/40 border-border" />
          </div>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground"><Bell className="h-3.5 w-3.5" /></Button>
          <div className="flex items-center gap-2 border border-border rounded-md px-2.5 py-1">
            <Wallet className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">${totalValue.toLocaleString()}</span>
          </div>
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-7 h-7" }, baseTheme: dark }} />
        </div>
      </div>
    </nav>
  );
}

/* ─── Benchmark Ticker Row ─── */
function TickerRow({ benchmarks }: { benchmarks: any[] }) {
  if (!benchmarks.length) return null;
  return (
    <div className="border-b border-border bg-muted/20">
      <div className="flex items-center gap-3 px-6 py-1.5 overflow-x-auto">
        {benchmarks.map((b) => {
          const isPos = b.percentageChange >= 0;
          return (
            <div key={b.ticker} className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-semibold text-foreground uppercase">{b.ticker || b.name}</span>
              <span className="text-[10px] text-muted-foreground">{b.close?.toLocaleString()}</span>
              <span className={`text-[10px] font-medium ${isPos ? "text-primary" : "text-secondary"}`}>
                {isPos ? "+" : ""}{b.percentageChange?.toFixed(2)}%
              </span>
              <div className="h-3 w-px bg-border" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── 3-panel Dashboard Layout ─── */
function DashboardGrid({
  totalValue, totalChange, totalChangePercent, portfolios,
  benchmarks, aiData, onEdit, onDelete, onCreate,
}: any) {
  const isPositive = totalChange >= 0;
  const [aiExpanded, setAiExpanded] = useState(false);
  const clean = cleanMarkdownWrapper(aiData?.analysis || "");

  return (
    <div className="px-6 py-5">
      {/* Top stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Card className="p-4 bg-card border-border">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">Net Worth</p>
          <p className="text-xl font-bold text-foreground">${totalValue.toLocaleString()}</p>
          <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${isPositive ? "text-primary" : "text-secondary"}`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isPositive ? "+" : ""}{totalChangePercent.toFixed(2)}%
          </div>
        </Card>
        <Card className="p-4 bg-card border-border">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">Portfolios</p>
          <p className="text-xl font-bold text-foreground">{portfolios.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Active portfolios</p>
        </Card>
        <Card className="p-4 bg-card border-border">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">Total P&L</p>
          <p className={`text-xl font-bold ${isPositive ? "text-primary" : "text-secondary"}`}>
            {isPositive ? "+" : ""}${Math.abs(totalChange).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Unrealized gain</p>
        </Card>
        <Card className="p-4 bg-card border-border">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">Best Performer</p>
          {portfolios.length > 0 ? (
            <>
              <p className="text-sm font-bold text-foreground truncate">{[...portfolios].sort((a: any, b: any) => b.changePercent - a.changePercent)[0]?.name}</p>
              <p className="text-xs text-primary font-medium mt-1">+{[...portfolios].sort((a: any, b: any) => b.changePercent - a.changePercent)[0]?.changePercent?.toFixed(2)}%</p>
            </>
          ) : <p className="text-xs text-muted-foreground">No data</p>}
        </Card>
      </div>

      {/* Main 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Allocation chart */}
        <div className="lg:col-span-4">
          <ChartRadialStacked Weightings={portfolios} />
        </div>

        {/* Center: Portfolio list */}
        <div className="lg:col-span-5">
          <Card className="bg-card border-border overflow-hidden h-full">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Portfolios</h3>
              <Button size="sm" onClick={onCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 h-7 text-xs">
                <Plus className="h-3 w-3 mr-1" />New
              </Button>
            </div>
            <div className="divide-y divide-border/50">
              {portfolios.length > 0 ? portfolios.map((p: any, i: number) => {
                const isPos = p.change >= 0;
                return (
                  <div key={p._id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/20 transition-colors">
                    <span className="text-[10px] font-mono text-muted-foreground w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <Link href={`/redesign/9/${p._id}`} className="block">
                        <p className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate">{p.name}</p>
                      </Link>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-foreground">${p.currentValue.toLocaleString()}</p>
                      <p className={`text-[10px] font-medium ${isPos ? "text-primary" : "text-secondary"}`}>
                        {isPos ? "+" : ""}{p.changePercent?.toFixed(2)}%
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-6 w-6 p-0"><MoreHorizontal className="h-3.5 w-3.5" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(p)}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(p._id)} className="text-secondary"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              }) : (
                <div className="flex justify-center items-center py-12"><p className="text-muted-foreground text-xs">No portfolios yet.</p></div>
              )}
            </div>
          </Card>
        </div>

        {/* Right: AI + Benchmarks */}
        <div className="lg:col-span-3 space-y-4">
          {/* AI card */}
          <Card className="p-4 bg-[radial-gradient(circle_at_top_left,_#8d745d_0%,_transparent_30%)] border-[#8d745d]">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">Market Intelligence</span>
            </div>
            <div className="text-[11px] text-muted-foreground leading-relaxed overflow-hidden" style={{ maxHeight: "60px", WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)" }}>
              {parseMarkdown(clean)}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setAiExpanded(true)} className="mt-1 text-[10px] h-6 px-2">Read more</Button>
          </Card>

          {/* Benchmark list */}
          <Card className="p-4 bg-card border-border">
            <h4 className="text-xs font-semibold text-foreground mb-3">Market Data</h4>
            <div className="space-y-2.5">
              {benchmarks.map((b: any) => {
                const isPos = b.percentageChange >= 0;
                return (
                  <div key={b.ticker} className="flex items-center justify-between">
                    <span className="text-xs text-foreground font-medium">{b.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{b.close?.toLocaleString()}</span>
                      <span className={`text-[10px] font-semibold ${isPos ? "text-primary" : "text-secondary"}`}>
                        {isPos ? "+" : ""}{b.percentageChange?.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* AI expanded modal */}
      <Dialog open={aiExpanded} onOpenChange={setAiExpanded}>
        <DialogContent className="max-h-[80vh] max-w-4xl">
          <DialogHeader><DialogTitle>Market Intelligence</DialogTitle></DialogHeader>
          <div className="mt-4 overflow-auto max-h-[60vh]">{parseMarkdown(clean)}</div>
          <div className="mt-6 pt-4 border-t border-border"><p className="text-xs text-muted-foreground italic"><span className="font-semibold">AI Risk Warning:</span> For informational purposes only.</p></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── Main Page ─── */
export default function Redesign9() {
  const { user } = useUser();
  const convexUser = useQuery(api.users.getUserByClerkId, { clerkId: user?.id });
  const userId = convexUser?._id;
  const userPortfolios = useQuery(api.portfolios.getUserPorfolios, { userId }) || [];
  const aiSummaryData = useQuery(api.ai.getAiNewsSummary) || {};
  const benchmarkData = useQuery(api.marketData.getBenchmarkData) || [];

  const totalValue = userPortfolios.reduce((s, p) => s + p.currentValue, 0);
  const totalChange = userPortfolios.reduce((s, p) => s + p.change, 0);
  const totalChangePercent = totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", id: "" });
  const createPortfolio = useMutation(api.portfolios.createPortfolio);
  const editPortfolio = useMutation(api.portfolios.updatePortfolio);
  const deletePortfolio = useMutation(api.portfolios.deletePortfolio);

  const handleCreate = () => { if (userId) { createPortfolio({ userId, name: formData.name, description: formData.description }); setFormData({ name: "", description: "", id: "" }); setIsCreateModalOpen(false); } };
  const handleEdit = (p: any) => { setFormData({ id: p._id, name: p.name, description: p.description }); setIsEditModalOpen(true); };
  const handleDelete = (id: string) => { if (userId) deletePortfolio({ portfolioId: id, userId }); };
  const handleUpdate = () => { if (userId) { editPortfolio({ portfolioId: formData.id, userId, name: formData.name, description: formData.description }); setIsEditModalOpen(false); setFormData({ name: "", description: "", id: "" }); } };

  return (
    <div className="min-h-screen bg-background">
      <FullNavbar totalValue={totalValue} />
      <TickerRow benchmarks={benchmarkData} />
      <DashboardGrid
        totalValue={totalValue} totalChange={totalChange} totalChangePercent={totalChangePercent}
        portfolios={userPortfolios} benchmarks={benchmarkData} aiData={aiSummaryData}
        onEdit={handleEdit} onDelete={handleDelete} onCreate={() => setIsCreateModalOpen(true)}
      />

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Create Portfolio</DialogTitle><DialogDescription>Set up a new portfolio.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Name</Label><Input placeholder="e.g., Growth" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Description</Label><Textarea placeholder="Brief..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button><Button onClick={handleCreate} disabled={!formData.name.trim()} className="bg-primary text-primary-foreground">Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Edit Portfolio</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Name</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button><Button onClick={handleUpdate}>Update</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
