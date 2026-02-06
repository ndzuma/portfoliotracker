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
  Edit, Trash2, Sparkles, ArrowRight, Newspaper, Settings,
  BarChart3, DollarSign, Percent,
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

/* ─── Minimal Top Nav ─── */
function MinimalNav() {
  const { user } = useUser();
  return (
    <nav className="sticky top-10 z-40 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <span className="font-bold text-foreground text-lg">PulsePortfolio</span>
          </div>
          <div className="hidden md:flex items-center gap-1 ml-4">
            {[{ n: "Dashboard", h: "/redesign/8", active: true }, { n: "News", h: "/news" }, { n: "Analytics", h: "/watchlist" }, { n: "Settings", h: "/settings" }].map((item) => (
              <Link key={item.n} href={item.h} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${item.active ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {item.n}
              </Link>
            ))}
          </div>
        </div>
        <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" }, baseTheme: dark }} />
      </div>
    </nav>
  );
}

/* ─── Value Hero Card (Stockz-style large number) ─── */
function ValueHeroCard({ totalValue, totalChange, totalChangePercent }: { totalValue: number; totalChange: number; totalChangePercent: number }) {
  const isPositive = totalChange >= 0;
  const [displayMode, setDisplayMode] = useState<"dollar" | "percent">("dollar");
  return (
    <Card className="p-8 bg-card border-border relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="relative">
        <p className="text-sm text-muted-foreground font-medium mb-1">Account Value</p>
        <p className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
          ${totalValue.toLocaleString()}
        </p>
        <div className="flex items-center gap-4 mt-3">
          <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? "text-primary" : "text-secondary"}`}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{isPositive ? "+" : ""}{displayMode === "dollar" ? `$${Math.abs(totalChange).toLocaleString()}` : `${totalChangePercent.toFixed(2)}%`}</span>
          </div>
          <span className="text-xs text-muted-foreground">Market Gain / Loss</span>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Button size="sm" variant={displayMode === "dollar" ? "default" : "outline"} onClick={() => setDisplayMode("dollar")} className={`text-xs h-7 ${displayMode === "dollar" ? "bg-foreground text-background" : ""}`}>
            <DollarSign className="h-3 w-3 mr-1" />Dollar
          </Button>
          <Button size="sm" variant={displayMode === "percent" ? "default" : "outline"} onClick={() => setDisplayMode("percent")} className={`text-xs h-7 ${displayMode === "percent" ? "bg-foreground text-background" : ""}`}>
            <Percent className="h-3 w-3 mr-1" />Percentage
          </Button>
        </div>
      </div>
    </Card>
  );
}

/* ─── Value Breakdown Section ─── */
function ValueBreakdown({ portfolios }: { portfolios: any[] }) {
  if (!portfolios.length) return null;
  const total = portfolios.reduce((s, p) => s + p.currentValue, 0);
  return (
    <Card className="p-6 bg-card border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">{"Value Breakdown"}</h3>
      <div className="space-y-4">
        {portfolios.map((p) => {
          const pct = total > 0 ? (p.currentValue / total) * 100 : 0;
          const isPos = p.change >= 0;
          return (
            <div key={p._id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex-1 min-w-0">
                  <Link href={`/redesign/8/${p._id}`}>
                    <p className="text-sm font-medium text-foreground hover:text-primary transition-colors">{p.name}</p>
                  </Link>
                  <p className="text-xs text-muted-foreground truncate">{p.description}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-semibold text-foreground">${p.currentValue.toLocaleString()}</p>
                  <p className={`text-xs font-medium ${isPos ? "text-primary" : "text-secondary"}`}>
                    {isPos ? "+" : ""}{p.changePercent?.toFixed(2)}%
                  </p>
                </div>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ─── Benchmark Compact Cards ─── */
function BenchmarkCompactGrid({ benchmarks }: { benchmarks: any[] }) {
  if (!benchmarks.length) return null;
  return (
    <div className="grid grid-cols-2 gap-3">
      {benchmarks.map((b) => {
        const isPos = b.percentageChange >= 0;
        return (
          <Card key={b.ticker} className="p-4 bg-card border-border">
            <p className="text-xs text-muted-foreground font-medium mb-1">{b.name}</p>
            <p className="text-lg font-bold text-foreground">{b.close?.toLocaleString()}</p>
            <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${isPos ? "text-primary" : "text-secondary"}`}>
              {isPos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isPos ? "+" : ""}{b.percentageChange?.toFixed(2)}%
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ─── AI Insight Strip ─── */
function AIInsightStrip({ data }: { data: any }) {
  const [expanded, setExpanded] = useState(false);
  const clean = cleanMarkdownWrapper(data?.analysis || "");
  return (
    <>
      <Card className="p-5 bg-[radial-gradient(circle_at_top_left,_#8d745d_0%,_transparent_30%)] border-[#8d745d] cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setExpanded(true)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Daily Market Insight</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="text-xs text-muted-foreground leading-relaxed mt-2 overflow-hidden" style={{ maxHeight: "40px", WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)" }}>
          {parseMarkdown(clean)}
        </div>
      </Card>
      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="max-h-[80vh] max-w-4xl">
          <DialogHeader><DialogTitle>Market Intelligence</DialogTitle></DialogHeader>
          <div className="mt-4 overflow-auto max-h-[60vh]">{parseMarkdown(clean)}</div>
          <div className="mt-6 pt-4 border-t border-border"><p className="text-xs text-muted-foreground italic"><span className="font-semibold">AI Risk Warning:</span> For informational purposes only.</p></div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ─── Portfolio List ─── */
function PortfolioList({ portfolios, onEdit, onDelete }: { portfolios: any[]; onEdit: (p: any) => void; onDelete: (id: string) => void }) {
  return (
    <div className="space-y-3">
      {portfolios.map((p, i) => {
        const isPos = p.change >= 0;
        return (
          <Card key={p._id} className="p-4 bg-card border-border hover:border-primary/40 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-foreground">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/redesign/8/${p._id}`}>
                  <p className="text-sm font-semibold text-foreground hover:text-primary transition-colors">{p.name}</p>
                </Link>
                <p className="text-xs text-muted-foreground truncate">{p.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">${p.currentValue.toLocaleString()}</p>
                <p className={`text-xs font-medium ${isPos ? "text-primary" : "text-secondary"}`}>
                  {isPos ? "+" : ""}{p.changePercent?.toFixed(2)}%
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-7 w-7 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(p)}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(p._id)} className="text-secondary"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ─── Main Page ─── */
export default function Redesign8() {
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
      <MinimalNav />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left column - hero + breakdown */}
          <div className="lg:col-span-3 space-y-6">
            <ValueHeroCard totalValue={totalValue} totalChange={totalChange} totalChangePercent={totalChangePercent} />
            <AIInsightStrip data={aiSummaryData} />
            <ValueBreakdown portfolios={userPortfolios} />
          </div>

          {/* Right column - benchmarks + portfolio list */}
          <div className="lg:col-span-2 space-y-6">
            <BenchmarkCompactGrid benchmarks={benchmarkData} />
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Portfolios</h3>
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                  <DialogTrigger asChild><Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 h-7 text-xs"><Plus className="h-3 w-3 mr-1" />New</Button></DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader><DialogTitle>Create Portfolio</DialogTitle><DialogDescription>Set up a new portfolio.</DialogDescription></DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2"><Label>Name</Label><Input placeholder="e.g., Growth" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                      <div className="grid gap-2"><Label>Description</Label><Textarea placeholder="Brief..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} /></div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button><Button onClick={handleCreate} disabled={!formData.name.trim()} className="bg-primary text-primary-foreground">Create</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              {userPortfolios.length > 0 ? (
                <PortfolioList portfolios={userPortfolios} onEdit={handleEdit} onDelete={handleDelete} />
              ) : (
                <Card className="p-8 text-center"><p className="text-muted-foreground text-sm">No portfolios yet.</p></Card>
              )}
            </div>
          </div>
        </div>
      </div>

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
