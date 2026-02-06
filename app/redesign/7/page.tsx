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
  Plus, MoreHorizontal, Edit, Trash2, Sparkles, ArrowUpRight,
  BookmarkIcon,
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

/* ─── Floating Top Bar ─── */
function FloatingTopBar() {
  const { user } = useUser();
  return (
    <header className="sticky top-10 z-40 bg-background/80 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <span className="font-bold text-foreground text-xl tracking-tight">PulsePortfolio</span>
        </div>
        <nav className="hidden md:flex items-center gap-1">
          {[
            { name: "Dashboard", href: "/redesign/7" },
            { name: "News", href: "/news" },
            { name: "Watchlist", href: "/watchlist" },
            { name: "Settings", href: "/settings" },
          ].map((item) => (
            <Link key={item.name} href={item.href} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" }, baseTheme: dark }} />
        </div>
      </div>
    </header>
  );
}

/* ─── Hero Section with Bold Type ─── */
function HeroSection({ totalValue, totalChange, totalChangePercent, userName }: { totalValue: number; totalChange: number; totalChangePercent: number; userName: string }) {
  const isPositive = totalChange >= 0;
  return (
    <section className="px-8 py-12 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-2 uppercase tracking-widest">Portfolio Overview</p>
          <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight text-balance">
            ${totalValue.toLocaleString()}
          </h1>
          <div className={`flex items-center gap-2 mt-4 text-lg font-medium ${isPositive ? "text-primary" : "text-secondary"}`}>
            {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            <span>{isPositive ? "+" : ""}${Math.abs(totalChange).toLocaleString()}</span>
            <span className="text-muted-foreground text-sm">({isPositive ? "+" : ""}{totalChangePercent.toFixed(2)}%)</span>
          </div>
        </div>
        <div className="text-right hidden lg:block">
          <p className="text-sm text-muted-foreground">Welcome back, {userName}</p>
        </div>
      </div>
      <div className="h-px bg-border mt-8" />
    </section>
  );
}

/* ─── Tab Navigation (like Bloc Trusted bottom nav) ─── */
function ContentTabs({ portfolios, benchmarks, aiData, onEdit, onDelete, onCreate }: any) {
  const [tab, setTab] = useState<"portfolios" | "markets" | "intelligence">("portfolios");
  return (
    <section className="px-8 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-6 mb-6 border-b border-border">
        {(["portfolios", "markets", "intelligence"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 ${
              tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "portfolios" && <PortfoliosTab portfolios={portfolios} onEdit={onEdit} onDelete={onDelete} onCreate={onCreate} />}
      {tab === "markets" && <MarketsTab benchmarks={benchmarks} />}
      {tab === "intelligence" && <IntelligenceTab data={aiData} />}
    </section>
  );
}

function PortfoliosTab({ portfolios, onEdit, onDelete, onCreate }: any) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Your Portfolios</h2>
        <Button onClick={onCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />Create Portfolio
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {portfolios.length > 0 ? portfolios.map((p: any) => {
          const isPos = p.change >= 0;
          return (
            <Card key={p._id} className="p-6 bg-card border-border hover:border-primary/40 transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <Link href={`/redesign/7/${p._id}`}>
                    <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors">{p.name}</h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mt-1 truncate">{p.description}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(p)}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(p._id)} className="text-secondary"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="text-2xl font-bold text-foreground">${p.currentValue.toLocaleString()}</p>
              <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${isPos ? "text-primary" : "text-secondary"}`}>
                {isPos ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                <span>{isPos ? "+" : ""}{p.changePercent?.toFixed(2)}%</span>
                <span className="text-muted-foreground ml-1">| {p.assetsCount} assets</span>
              </div>
              <Link href={`/redesign/7/${p._id}`} className="flex items-center gap-1 mt-4 text-xs text-muted-foreground hover:text-primary transition-colors">
                View details <ArrowUpRight className="h-3 w-3" />
              </Link>
            </Card>
          );
        }) : (
          <div className="col-span-3 flex justify-center items-center py-16"><p className="text-muted-foreground">No portfolios yet. Create one to begin.</p></div>
        )}
      </div>
    </div>
  );
}

function MarketsTab({ benchmarks }: { benchmarks: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {benchmarks.length > 0 ? benchmarks.map((b) => {
        const isPos = b.percentageChange >= 0;
        return (
          <Card key={b.ticker} className="p-5 bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{b.name}</h3>
                <p className="text-2xl font-bold text-foreground mt-1">{b.close?.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <div className={`flex items-center gap-1 ${isPos ? "text-primary" : "text-secondary"}`}>
                  {isPos ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span className="font-medium">{isPos ? "+" : ""}{(b.close * (b.percentageChange / 100)).toFixed(2)}</span>
                </div>
                <p className={`text-sm ${isPos ? "text-primary" : "text-secondary"}`}>({isPos ? "+" : ""}{b.percentageChange?.toFixed(2)}%)</p>
              </div>
            </div>
          </Card>
        );
      }) : (
        <div className="col-span-2 text-center py-8"><p className="text-muted-foreground">No market data available.</p></div>
      )}
    </div>
  );
}

function IntelligenceTab({ data }: { data: any }) {
  const clean = cleanMarkdownWrapper(data?.analysis || "");
  return (
    <Card className="p-6 bg-[radial-gradient(circle_at_top_left,_#8d745d_0%,_transparent_30%)] border-[#8d745d]">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Market Intelligence</h3>
      </div>
      <div className="text-sm text-muted-foreground leading-relaxed">
        {parseMarkdown(clean)}
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground italic"><span className="font-semibold">AI Risk Warning:</span> For informational purposes only.</p>
      </div>
    </Card>
  );
}

/* ─── Allocation Section ─── */
function AllocationSection({ portfolios }: { portfolios: any[] }) {
  return (
    <section className="px-8 max-w-[1400px] mx-auto mt-8 mb-12">
      <ChartRadialStacked Weightings={portfolios} />
    </section>
  );
}

/* ─── Main Page ─── */
export default function Redesign7() {
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
      <FloatingTopBar />
      <HeroSection totalValue={totalValue} totalChange={totalChange} totalChangePercent={totalChangePercent} userName={user?.fullName || ""} />
      <ContentTabs portfolios={userPortfolios} benchmarks={benchmarkData} aiData={aiSummaryData} onEdit={handleEdit} onDelete={handleDelete} onCreate={() => setIsCreateModalOpen(true)} />
      <AllocationSection portfolios={userPortfolios} />

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Create Portfolio</DialogTitle><DialogDescription>Set up a new portfolio.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Name</Label><Input placeholder="e.g., Growth Portfolio" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Description</Label><Textarea placeholder="Brief description..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} /></div>
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
