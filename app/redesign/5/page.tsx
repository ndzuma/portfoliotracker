"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Link from "next/link";
import {
  Briefcase, Newspaper, Settings, TrendingUp, TrendingDown,
  Plus, MoreHorizontal, Edit, Trash2, Sparkles, Search,
  Bell, BarChart3, BookmarkIcon,
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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { parseMarkdown, cleanMarkdownWrapper } from "@/lib/markdown-parser";
import { ChartRadialStacked } from "@/components/allocationRadial";

/* ─── Top Navbar ─── */
function TopNavbar() {
  const { user } = useUser();
  const navItems = [
    { name: "Overview", href: "/redesign/5", icon: BarChart3, active: true },
    { name: "News", href: "/news", icon: Newspaper },
    { name: "Watchlist", href: "/watchlist", icon: BookmarkIcon },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <nav className="border-b border-border bg-card/60 backdrop-blur-md sticky top-10 z-40">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 h-14">
        <div className="flex items-center gap-1">
          <Briefcase className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground tracking-tight text-lg ml-1">PulsePortfolio</span>
          <span className="text-border mx-4">|</span>
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  item.active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Find Something..."
              className="w-52 h-8 pl-8 text-xs bg-muted/50 border-border"
            />
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground">
            <Bell className="h-4 w-4" />
          </Button>
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" }, baseTheme: dark }} />
        </div>
      </div>
    </nav>
  );
}

/* ─── Ticker Strip ─── */
function TickerStrip({ benchmarks }: { benchmarks: any[] }) {
  if (!benchmarks.length) return null;
  return (
    <div className="border-b border-border bg-card/40 backdrop-blur-sm">
      <div className="max-w-[1400px] mx-auto flex items-center gap-2 px-6 py-2 overflow-x-auto">
        {benchmarks.map((b) => {
          const isPositive = b.percentageChange >= 0;
          return (
            <div key={b.ticker} className="flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted/30 shrink-0">
              <span className="text-xs font-semibold text-foreground">{b.name}</span>
              <span className="text-xs text-muted-foreground">{b.close?.toLocaleString()}</span>
              <span className={`text-xs font-medium ${isPositive ? "text-primary" : "text-secondary"}`}>
                {isPositive ? "+" : ""}{b.percentageChange?.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Wallet Balance Hero ─── */
function WalletHero({
  totalValue, totalChange, totalChangePercent, bestPortfolio, worstPortfolio,
}: {
  totalValue: number; totalChange: number; totalChangePercent: number;
  bestPortfolio: any; worstPortfolio: any;
}) {
  const isPositive = totalChange >= 0;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-6 md:col-span-1 bg-card border-border">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-muted-foreground font-medium">Net Worth</span>
        </div>
        <p className="text-3xl font-bold text-foreground tracking-tight">${totalValue.toLocaleString()}</p>
        <div className={`flex items-center gap-1.5 mt-2 text-sm font-medium ${isPositive ? "text-primary" : "text-secondary"}`}>
          {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          <span>{isPositive ? "+" : ""}${Math.abs(totalChange).toLocaleString()}</span>
          <span className="text-muted-foreground">({isPositive ? "+" : ""}{totalChangePercent.toFixed(2)}%)</span>
        </div>
      </Card>
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-4 rounded-full bg-primary" />
          <span className="text-sm font-medium text-muted-foreground">Best Performer</span>
        </div>
        {bestPortfolio ? (
          <>
            <p className="font-semibold text-foreground text-lg">{bestPortfolio.name}</p>
            <p className="text-primary text-sm font-medium mt-1">
              +{bestPortfolio.changePercent?.toFixed(2)}%
            </p>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">No data</p>
        )}
      </Card>
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-4 rounded-full bg-secondary" />
          <span className="text-sm font-medium text-muted-foreground">Worst Performer</span>
        </div>
        {worstPortfolio ? (
          <>
            <p className="font-semibold text-foreground text-lg">{worstPortfolio.name}</p>
            <p className="text-secondary text-sm font-medium mt-1">
              {worstPortfolio.changePercent?.toFixed(2)}%
            </p>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">No data</p>
        )}
      </Card>
    </div>
  );
}

/* ─── AI Card ─── */
function AICard({ data }: { data: any }) {
  const [expanded, setExpanded] = useState(false);
  const clean = cleanMarkdownWrapper(data?.analysis || "");
  return (
    <>
      <Card className="p-5 bg-[radial-gradient(circle_at_top_left,_#8d745d_0%,_transparent_30%)] border-[#8d745d] h-full">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Market Intelligence</span>
        </div>
        <div className="text-xs text-muted-foreground leading-relaxed overflow-hidden" style={{ maxHeight: "60px", WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)" }}>
          {parseMarkdown(clean)}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setExpanded(true)} className="mt-2 text-xs opacity-70 hover:opacity-100">
          Expand
        </Button>
      </Card>
      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="max-h-[80vh] max-w-4xl">
          <DialogHeader>
            <DialogTitle>Market Intelligence</DialogTitle>
          </DialogHeader>
          <div className="mt-4 overflow-auto max-h-[60vh]">{parseMarkdown(clean)}</div>
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground italic">
              <span className="font-semibold">AI Risk Warning:</span> For informational purposes only.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ─── Portfolio Table ─── */
function PortfolioTable({
  portfolios, onEdit, onDelete, redesignId,
}: {
  portfolios: any[]; onEdit: (p: any) => void; onDelete: (id: string) => void; redesignId: string;
}) {
  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="flex items-center gap-4 py-3 px-5 border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <div className="flex-1">Portfolio</div>
        <div className="w-28 text-right">Value</div>
        <div className="w-32 text-right">Change</div>
        <div className="w-16 text-center">Assets</div>
        <div className="w-10" />
      </div>
      {portfolios.length > 0 ? portfolios.map((p) => {
        const isPos = p.change >= 0;
        return (
          <div key={p._id} className="flex items-center gap-4 py-3 px-5 border-b border-border/50 hover:bg-muted/30 transition-colors">
            <div className="flex-1 min-w-0">
              <Link href={`/redesign/${redesignId}/${p._id}`} className="block">
                <p className="font-medium text-foreground hover:text-primary transition-colors text-sm">{p.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{p.description}</p>
              </Link>
            </div>
            <div className="w-28 text-right font-semibold text-sm text-foreground">${p.currentValue.toLocaleString()}</div>
            <div className={`w-32 text-right text-sm font-medium ${isPos ? "text-primary" : "text-secondary"}`}>
              {isPos ? "+" : ""}{p.changePercent?.toFixed(2)}%
            </div>
            <div className="w-16 text-center text-sm text-muted-foreground">{p.assetsCount}</div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(p)}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(p._id)} className="text-secondary focus:text-secondary"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      }) : (
        <div className="flex justify-center items-center py-12">
          <p className="text-muted-foreground text-sm">No portfolios found. Create one to get started.</p>
        </div>
      )}
    </Card>
  );
}

/* ─── Main Page ─── */
export default function Redesign5() {
  const { user } = useUser();
  const convexUser = useQuery(api.users.getUserByClerkId, { clerkId: user?.id });
  const userId = convexUser?._id;
  const userPortfolios = useQuery(api.portfolios.getUserPorfolios, { userId }) || [];
  const aiSummaryData = useQuery(api.ai.getAiNewsSummary) || {};
  const benchmarkData = useQuery(api.marketData.getBenchmarkData) || [];

  const totalValue = userPortfolios.reduce((s, p) => s + p.currentValue, 0);
  const totalChange = userPortfolios.reduce((s, p) => s + p.change, 0);
  const totalChangePercent = totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0;

  const sorted = [...userPortfolios].sort((a, b) => b.changePercent - a.changePercent);
  const bestPortfolio = sorted[0] || null;
  const worstPortfolio = sorted[sorted.length - 1] || null;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newPortfolio, setNewPortfolio] = useState({ name: "", description: "", id: "" });
  const createPortfolio = useMutation(api.portfolios.createPortfolio);
  const editPortfolio = useMutation(api.portfolios.updatePortfolio);
  const deletePortfolio = useMutation(api.portfolios.deletePortfolio);

  const handleCreate = () => {
    if (userId) { createPortfolio({ userId, name: newPortfolio.name, description: newPortfolio.description }); setNewPortfolio({ name: "", description: "", id: "" }); setIsCreateModalOpen(false); }
  };
  const handleEdit = (p: any) => { setNewPortfolio({ id: p._id, name: p.name, description: p.description }); setIsEditModalOpen(true); };
  const handleDelete = (id: string) => { if (userId) deletePortfolio({ portfolioId: id, userId }); };
  const handleUpdate = () => {
    if (userId) { editPortfolio({ portfolioId: newPortfolio.id, userId, name: newPortfolio.name, description: newPortfolio.description }); setIsEditModalOpen(false); setNewPortfolio({ name: "", description: "", id: "" }); }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopNavbar />
      <TickerStrip benchmarks={benchmarkData} />

      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Hero */}
        <WalletHero totalValue={totalValue} totalChange={totalChange} totalChangePercent={totalChangePercent} bestPortfolio={bestPortfolio} worstPortfolio={worstPortfolio} />

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
          <div className="lg:col-span-2">
            <ChartRadialStacked Weightings={userPortfolios} />
          </div>
          <AICard data={aiSummaryData} />
        </div>

        {/* Portfolios */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">My Portfolios ({userPortfolios.length})</h2>
            </div>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-1.5" />New Portfolio
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader><DialogTitle>Create Portfolio</DialogTitle><DialogDescription>Set up a new portfolio to track your investments.</DialogDescription></DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2"><Label htmlFor="n5">Name</Label><Input id="n5" placeholder="e.g., Growth Portfolio" value={newPortfolio.name} onChange={(e) => setNewPortfolio({ ...newPortfolio, name: e.target.value })} /></div>
                  <div className="grid gap-2"><Label htmlFor="d5">Description</Label><Textarea id="d5" placeholder="Brief description..." value={newPortfolio.description} onChange={(e) => setNewPortfolio({ ...newPortfolio, description: e.target.value })} rows={3} /></div>
                </div>
                <DialogFooter><Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button><Button onClick={handleCreate} disabled={!newPortfolio.name.trim()} className="bg-primary text-primary-foreground">Create</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <PortfolioTable portfolios={userPortfolios} onEdit={handleEdit} onDelete={handleDelete} redesignId="5" />
        </div>
      </div>

      {/* Edit modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Edit Portfolio</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Name</Label><Input value={newPortfolio.name} onChange={(e) => setNewPortfolio({ ...newPortfolio, name: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Description</Label><Textarea value={newPortfolio.description} onChange={(e) => setNewPortfolio({ ...newPortfolio, description: e.target.value })} rows={3} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button><Button onClick={handleUpdate}>Update</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
