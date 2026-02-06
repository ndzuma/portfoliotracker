"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Link from "next/link";
import {
  Plus, TrendingUp, TrendingDown, MoreHorizontal, Edit, Trash2,
  ArrowUpRight, Sparkles, Search, LayoutDashboard, Newspaper,
  Star, Settings, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { parseMarkdown, cleanMarkdownWrapper } from "@/lib/markdown-parser";

export default function Redesign10() {
  const { user } = useUser();
  const convexUser = useQuery(api.users.getUserByClerkId, { clerkId: user?.id });
  const userId = convexUser?._id;
  const portfolios = useQuery(api.portfolios.getUserPorfolios, { userId }) || [];
  const aiData = useQuery(api.ai.getAiNewsSummary) || {};
  const benchmarks = useQuery(api.marketData.getBenchmarkData) || [];

  const totalValue = portfolios.reduce((s, p) => s + p.currentValue, 0);
  const totalChange = portfolios.reduce((s, p) => s + p.change, 0);
  const totalPct = totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0;
  const isUp = totalChange >= 0;

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", id: "" });
  const create = useMutation(api.portfolios.createPortfolio);
  const update = useMutation(api.portfolios.updatePortfolio);
  const remove = useMutation(api.portfolios.deletePortfolio);

  const doCreate = () => { if (userId) { create({ userId, name: form.name, description: form.description }); setForm({ name: "", description: "", id: "" }); setCreateOpen(false); } };
  const doEdit = (p: any) => { setForm({ id: p._id, name: p.name, description: p.description }); setEditOpen(true); };
  const doDelete = (id: string) => { if (userId) remove({ portfolioId: id, userId }); };
  const doUpdate = () => { if (userId) { update({ portfolioId: form.id, userId, name: form.name, description: form.description }); setEditOpen(false); setForm({ name: "", description: "", id: "" }); } };

  const cleanAi = cleanMarkdownWrapper(aiData?.analysis || "");

  return (
    <div className="min-h-screen" style={{ background: "#0a0f0d" }}>
      {/* ── Navbar ── */}
      <nav className="sticky top-10 z-40 backdrop-blur-xl border-b" style={{ borderColor: "#1a2a20", background: "rgba(10,15,13,0.85)" }}>
        <div className="max-w-[1440px] mx-auto flex items-center justify-between px-8 h-14">
          <div className="flex items-center gap-6">
            <span className="font-bold text-lg tracking-tight" style={{ color: "#e8ece9" }}>Pulse<span style={{ color: "#4ade80" }}>.</span></span>
            <div className="hidden md:flex items-center gap-1">
              {[
                { label: "Dashboard", icon: LayoutDashboard, active: true },
                { label: "News", icon: Newspaper },
                { label: "Watchlist", icon: Star },
                { label: "Settings", icon: Settings },
              ].map((n) => (
                <button key={n.label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${n.active ? "text-white" : "hover:text-white"}`} style={{ color: n.active ? "#e8ece9" : "#6b7f73", background: n.active ? "#1a2a20" : "transparent" }}>
                  <n.icon className="h-4 w-4" />
                  {n.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: "#6b7f73" }} />
              <Input placeholder="Search..." className="w-48 h-8 pl-9 text-xs rounded-lg border-0" style={{ background: "#1a2a20", color: "#e8ece9" }} />
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg" style={{ background: "#1a2a20" }}>
              <span className="text-xs font-medium" style={{ color: "#6b7f73" }}>Balance</span>
              <span className="text-sm font-bold" style={{ color: "#e8ece9" }}>${totalValue.toLocaleString()}</span>
            </div>
            <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" }, baseTheme: dark }} />
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-[1440px] mx-auto px-8 pt-16 pb-12">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest mb-3" style={{ color: "#4ade80" }}>Net Worth</p>
            <h1 className="text-6xl lg:text-7xl font-bold tracking-tighter leading-none" style={{ color: "#e8ece9" }}>
              ${totalValue.toLocaleString()}
            </h1>
            <div className={`flex items-center gap-2 mt-4 text-lg font-semibold`} style={{ color: isUp ? "#4ade80" : "#f87171" }}>
              {isUp ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              <span>{isUp ? "+" : ""}${Math.abs(totalChange).toLocaleString()}</span>
              <span className="text-sm" style={{ color: "#6b7f73" }}>({isUp ? "+" : ""}{totalPct.toFixed(2)}%)</span>
            </div>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl px-6 h-11 text-sm font-semibold" style={{ background: "#4ade80", color: "#0a0f0d" }}>
                <Plus className="h-4 w-4 mr-2" />New Portfolio
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Portfolio</DialogTitle><DialogDescription>Track a new set of investments.</DialogDescription></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2"><Label>Name</Label><Input placeholder="Growth Portfolio" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="grid gap-2"><Label>Description</Label><Textarea placeholder="Strategy notes..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button><Button onClick={doCreate} disabled={!form.name.trim()} style={{ background: "#4ade80", color: "#0a0f0d" }}>Create</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* ── Benchmark Ticker ── */}
      <section className="border-y" style={{ borderColor: "#1a2a20" }}>
        <div className="max-w-[1440px] mx-auto flex items-center gap-6 px-8 py-3 overflow-x-auto">
          {benchmarks.map((b) => {
            const up = b.percentageChange >= 0;
            return (
              <div key={b.ticker} className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-semibold" style={{ color: "#e8ece9" }}>{b.name}</span>
                <span className="text-sm" style={{ color: "#6b7f73" }}>{b.close?.toLocaleString()}</span>
                <span className="text-xs font-semibold" style={{ color: up ? "#4ade80" : "#f87171" }}>
                  {up ? "+" : ""}{b.percentageChange?.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Portfolios Grid ── */}
      <section className="max-w-[1440px] mx-auto px-8 py-12">
        <h2 className="text-2xl font-bold mb-8" style={{ color: "#e8ece9" }}>Portfolios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {portfolios.length > 0 ? portfolios.map((p, i) => {
            const pos = p.change >= 0;
            return (
              <div key={p._id} className="group rounded-2xl p-6 border transition-all hover:border-opacity-60" style={{ background: "#111a15", borderColor: "#1a2a20" }}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background: "#1a2a20", color: "#4ade80" }}>
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <Link href={`/redesign/10/${p._id}`}>
                        <h3 className="font-semibold transition-colors hover:opacity-80" style={{ color: "#e8ece9" }}>{p.name}</h3>
                      </Link>
                      <p className="text-xs mt-0.5 truncate max-w-[180px]" style={{ color: "#6b7f73" }}>{p.description}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#6b7f73" }}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => doEdit(p)}><Edit className="h-4 w-4 mr-2" />Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => doDelete(p._id)} className="text-red-400"><Trash2 className="h-4 w-4 mr-2" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-3xl font-bold mb-2" style={{ color: "#e8ece9" }}>${p.currentValue.toLocaleString()}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5" style={{ color: pos ? "#4ade80" : "#f87171" }}>
                    {pos ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    <span className="text-sm font-medium">{pos ? "+" : ""}{p.changePercent?.toFixed(2)}%</span>
                  </div>
                  <Badge variant="outline" className="text-xs border-0" style={{ background: "#1a2a20", color: "#6b7f73" }}>{p.assetsCount} assets</Badge>
                </div>
                <Link href={`/redesign/10/${p._id}`} className="flex items-center gap-1 mt-5 text-xs font-medium transition-colors" style={{ color: "#4ade80" }}>
                  View portfolio <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            );
          }) : (
            <div className="col-span-3 flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed" style={{ borderColor: "#1a2a20" }}>
              <p className="mb-4" style={{ color: "#6b7f73" }}>No portfolios yet</p>
              <Button onClick={() => setCreateOpen(true)} style={{ background: "#4ade80", color: "#0a0f0d" }}><Plus className="h-4 w-4 mr-2" />Create your first</Button>
            </div>
          )}
        </div>
      </section>

      {/* ── AI Intelligence Strip ── */}
      <section className="max-w-[1440px] mx-auto px-8 pb-12">
        <div className="rounded-2xl p-8 border relative overflow-hidden" style={{ background: "linear-gradient(135deg, #111a15 0%, #0a0f0d 100%)", borderColor: "#1a2a20" }}>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: "#4ade80" }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5" style={{ color: "#4ade80" }} />
              <h3 className="text-lg font-semibold" style={{ color: "#e8ece9" }}>Market Intelligence</h3>
            </div>
            <div className="text-sm leading-relaxed max-h-16 overflow-hidden" style={{ color: "#6b7f73", WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)" }}>
              {parseMarkdown(cleanAi)}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setAiOpen(true)} className="mt-3 text-xs font-medium" style={{ color: "#4ade80" }}>
              Read full analysis <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* AI Dialog */}
      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="max-h-[80vh] max-w-3xl">
          <DialogHeader><DialogTitle>Market Intelligence</DialogTitle></DialogHeader>
          <div className="mt-4 overflow-auto max-h-[60vh] text-sm leading-relaxed">{parseMarkdown(cleanAi)}</div>
          <div className="mt-4 pt-4 border-t"><p className="text-xs italic" style={{ color: "#6b7f73" }}><span className="font-semibold">AI Risk Warning:</span> For informational purposes only.</p></div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Portfolio</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid gap-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button><Button onClick={doUpdate}>Update</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
