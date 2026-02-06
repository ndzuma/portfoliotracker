"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase, Newspaper, Settings, TrendingUp, TrendingDown,
  Plus, MoreHorizontal, Edit, Trash2, Sparkles,
  BarChart3, BookmarkIcon, LayoutDashboard, User,
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

/* ─── Left Sidebar (Investa-style) ─── */
function InvestaSidebar() {
  const { user } = useUser();
  const pathname = usePathname();
  const mainNav = [
    { name: "Overview", href: "/redesign/6", icon: LayoutDashboard },
    { name: "News", href: "/news", icon: Newspaper },
    { name: "Portfolio", href: "/redesign/6", icon: Briefcase, active: true },
    { name: "Analytics", href: "/watchlist", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-border bg-card/50 h-full flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Briefcase className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground text-lg">PulsePortfolio</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {mainNav.map((item) => {
            const isActive = item.active || pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary border-l-2 border-primary ml-0 pl-2.5"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-3">
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-9 h-9" }, baseTheme: dark }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user?.fullName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.emailAddresses[0]?.emailAddress}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ─── Horizontal Scrolling Portfolio Cards ─── */
function PortfolioCardStrip({ portfolios }: { portfolios: any[] }) {
  if (!portfolios.length) return null;
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {portfolios.map((p) => {
        const isPos = p.change >= 0;
        return (
          <Link key={p._id} href={`/redesign/6/${p._id}`} className="shrink-0">
            <Card className="p-4 w-56 hover:border-primary/50 transition-colors cursor-pointer bg-card border-border">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xs font-bold text-foreground">{p.name?.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground truncate max-w-[140px]">{p.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">{p.description}</p>
                </div>
              </div>
              <p className="text-lg font-bold text-foreground">${p.currentValue.toLocaleString()}</p>
              <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${isPos ? "text-primary" : "text-secondary"}`}>
                {isPos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{isPos ? "+" : ""}{p.changePercent?.toFixed(2)}% vs last month</span>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

/* ─── AI Market Card ─── */
function AIMarketCard({ data }: { data: any }) {
  const [expanded, setExpanded] = useState(false);
  const clean = cleanMarkdownWrapper(data?.analysis || "");
  return (
    <>
      <Card className="p-5 bg-[radial-gradient(circle_at_top_left,_#8d745d_0%,_transparent_30%)] border-[#8d745d]">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">AI Insights</span>
        </div>
        <div className="text-xs text-muted-foreground leading-relaxed overflow-hidden" style={{ maxHeight: "80px", WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)" }}>
          {parseMarkdown(clean)}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setExpanded(true)} className="mt-3 text-xs">Read more</Button>
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

/* ─── Statistics / Benchmark Section ─── */
function StatisticsSection({ benchmarks }: { benchmarks: any[] }) {
  if (!benchmarks.length) return null;
  return (
    <Card className="p-5 bg-card border-border">
      <h3 className="text-sm font-semibold text-foreground mb-4">Market Statistics</h3>
      <div className="space-y-3">
        {benchmarks.map((b) => {
          const isPos = b.percentageChange >= 0;
          return (
            <div key={b.ticker} className="flex items-center justify-between">
              <span className="text-sm text-foreground font-medium">{b.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{b.close?.toLocaleString()}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isPos ? "text-primary bg-primary/10" : "text-secondary bg-secondary/10"}`}>
                  {isPos ? "+" : ""}{b.percentageChange?.toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ─── Portfolio Table (Investa style with stock icons) ─── */
function PortfolioStockTable({ portfolios, onEdit, onDelete }: { portfolios: any[]; onEdit: (p: any) => void; onDelete: (id: string) => void }) {
  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="px-5 py-3 border-b border-border">
        <h3 className="font-semibold text-foreground">My Portfolios</h3>
      </div>
      <div className="flex items-center gap-4 py-2 px-5 border-b border-border bg-muted/20 text-xs font-medium text-muted-foreground">
        <div className="flex-1">Name</div>
        <div className="w-28 text-right">Value</div>
        <div className="w-24 text-right">Change</div>
        <div className="w-16 text-center">Assets</div>
        <div className="w-8" />
      </div>
      {portfolios.length > 0 ? portfolios.map((p) => {
        const isPos = p.change >= 0;
        return (
          <div key={p._id} className="flex items-center gap-4 py-3 px-5 border-b border-border/30 hover:bg-muted/20 transition-colors">
            <div className="flex-1 flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">{p.name?.charAt(0)}</span>
              </div>
              <Link href={`/redesign/6/${p._id}`} className="min-w-0">
                <p className="text-sm font-medium text-foreground hover:text-primary transition-colors">{p.name}</p>
                <p className="text-xs text-muted-foreground truncate">{p.description}</p>
              </Link>
            </div>
            <div className="w-28 text-right font-semibold text-sm text-foreground">${p.currentValue.toLocaleString()}</div>
            <div className={`w-24 text-right text-sm font-medium flex items-center justify-end gap-1 ${isPos ? "text-primary" : "text-secondary"}`}>
              {isPos ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isPos ? "+" : ""}{p.changePercent?.toFixed(2)}%
            </div>
            <div className="w-16 text-center text-sm text-muted-foreground">{p.assetsCount}</div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-7 w-7 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(p)}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(p._id)} className="text-secondary"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      }) : (
        <div className="flex justify-center items-center py-12"><p className="text-muted-foreground text-sm">No portfolios yet.</p></div>
      )}
    </Card>
  );
}

/* ─── Main Page ─── */
export default function Redesign6() {
  const { user } = useUser();
  const convexUser = useQuery(api.users.getUserByClerkId, { clerkId: user?.id });
  const userId = convexUser?._id;
  const userPortfolios = useQuery(api.portfolios.getUserPorfolios, { userId }) || [];
  const aiSummaryData = useQuery(api.ai.getAiNewsSummary) || {};
  const benchmarkData = useQuery(api.marketData.getBenchmarkData) || [];

  const totalValue = userPortfolios.reduce((s, p) => s + p.currentValue, 0);
  const totalChange = userPortfolios.reduce((s, p) => s + p.change, 0);
  const totalChangePercent = totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0;
  const isPositive = totalChange >= 0;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newPortfolio, setNewPortfolio] = useState({ name: "", description: "", id: "" });
  const createPortfolio = useMutation(api.portfolios.createPortfolio);
  const editPortfolio = useMutation(api.portfolios.updatePortfolio);
  const deletePortfolio = useMutation(api.portfolios.deletePortfolio);

  const handleCreate = () => { if (userId) { createPortfolio({ userId, name: newPortfolio.name, description: newPortfolio.description }); setNewPortfolio({ name: "", description: "", id: "" }); setIsCreateModalOpen(false); } };
  const handleEdit = (p: any) => { setNewPortfolio({ id: p._id, name: p.name, description: p.description }); setIsEditModalOpen(true); };
  const handleDelete = (id: string) => { if (userId) deletePortfolio({ portfolioId: id, userId }); };
  const handleUpdate = () => { if (userId) { editPortfolio({ portfolioId: newPortfolio.id, userId, name: newPortfolio.name, description: newPortfolio.description }); setIsEditModalOpen(false); setNewPortfolio({ name: "", description: "", id: "" }); } };

  return (
    <div className="flex h-[calc(100vh-40px)] bg-background">
      <InvestaSidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1100px] mx-auto p-6">
          {/* Portfolio Cards Strip */}
          <PortfolioCardStrip portfolios={userPortfolios} />

          {/* Portfolio Value + Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-muted-foreground">Portfolio Values</span>
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                  <DialogTrigger asChild><Button size="sm" variant="outline" className="h-7 text-xs"><Plus className="h-3 w-3 mr-1" />New</Button></DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader><DialogTitle>Create Portfolio</DialogTitle><DialogDescription>Set up a new portfolio to track investments.</DialogDescription></DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2"><Label>Name</Label><Input placeholder="e.g., Growth Portfolio" value={newPortfolio.name} onChange={(e) => setNewPortfolio({ ...newPortfolio, name: e.target.value })} /></div>
                      <div className="grid gap-2"><Label>Description</Label><Textarea placeholder="Brief description..." value={newPortfolio.description} onChange={(e) => setNewPortfolio({ ...newPortfolio, description: e.target.value })} rows={3} /></div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button><Button onClick={handleCreate} disabled={!newPortfolio.name.trim()} className="bg-primary text-primary-foreground">Create</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-bold text-foreground">${totalValue.toLocaleString()}</p>
                <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${isPositive ? "text-primary bg-primary/10" : "text-secondary bg-secondary/10"}`}>
                  {isPositive ? "+" : ""}{totalChangePercent.toFixed(2)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Your profit is ${Math.abs(totalChange).toLocaleString()} across {userPortfolios.length} portfolios.
              </p>
            </Card>
            <StatisticsSection benchmarks={benchmarkData} />
          </div>

          {/* AI + Table */}
          <div className="mt-6">
            <AIMarketCard data={aiSummaryData} />
          </div>
          <div className="mt-6">
            <PortfolioStockTable portfolios={userPortfolios} onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        </div>
      </main>

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
