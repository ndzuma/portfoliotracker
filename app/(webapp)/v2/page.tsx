"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { V2Header } from "@/components/v2/v2-header";
import { V2HeroSplit, NetWorthHero } from "@/components/v2/v2-hero-split";
import { V2Ticker } from "@/components/v2/v2-ticker";
import { V2Tabs } from "@/components/v2/v2-tabs";
import { V2AICard } from "@/components/v2/v2-ai-card";
import { V2PortfolioCard } from "@/components/v2/v2-portfolio-card";
import { V2AllocationBar } from "@/components/v2/v2-allocation-bar";
import { cleanMarkdownWrapper } from "@/lib/markdown-parser";

export default function V2Dashboard() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("portfolios");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const convexUser = useQuery(api.users.getUserByClerkId, { clerkId: user?.id });
  const userId = convexUser?._id;
  const userPortfolios = useQuery(api.portfolios.getUserPorfolios, { userId }) || [];
  const benchmarkData = useQuery(api.marketData.getBenchmarkData) || [];
  const aiSummaryData = useQuery(api.ai.getAiNewsSummary) || {};

  const createPortfolio = useMutation(api.portfolios.createPortfolio);

  const totalValue = userPortfolios.reduce((sum: number, p: any) => sum + p.currentValue, 0);
  const totalChange = userPortfolios.reduce((sum: number, p: any) => sum + p.change, 0);
  const totalChangePercent = totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0;

  const handleCreatePortfolio = () => {
    if (userId && formData.name.trim()) {
      createPortfolio({ userId, name: formData.name, description: formData.description });
      setFormData({ name: "", description: "" });
      setIsCreateModalOpen(false);
    }
  };

  const tabs = [
    { id: "portfolios", label: "Portfolios" },
    { id: "markets", label: "Markets" },
  ];

  const cleanAnalysis = cleanMarkdownWrapper(
    aiSummaryData?.analysis || "Analyzing market conditions..."
  );

  return (
    <div className="min-h-screen" style={{ background: "#09090b" }}>
      <V2Header />

      {/* Hero: 60% Net Worth | 40% AI Intelligence */}
      <V2HeroSplit
        leftContent={
          <NetWorthHero
            value={totalValue}
            change={totalChange}
            changePercent={totalChangePercent}
            portfolioCount={userPortfolios.length}
          />
        }
        rightContent={<V2AICard analysis={cleanAnalysis} />}
      />

      {/* Ticker Strip */}
      <V2Ticker benchmarks={benchmarkData} />

      {/* Tab Navigation */}
      <V2Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Portfolios Tab */}
      {activeTab === "portfolios" && (
        <section className="max-w-[1600px] mx-auto px-8 pb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-semibold text-white tracking-tight">Your Portfolios</h2>
              <p className="text-zinc-600 text-xs mt-1">{userPortfolios.length} active</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Portfolio
            </button>
          </div>

          {/* Portfolio Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {userPortfolios.length > 0 ? (
              userPortfolios.map((portfolio: any) => (
                <V2PortfolioCard
                  key={portfolio._id}
                  id={portfolio._id}
                  name={portfolio.name}
                  value={portfolio.currentValue}
                  change={portfolio.change}
                  changePercent={portfolio.changePercent}
                  assetsCount={portfolio.assetsCount}
                  description={portfolio.description}
                />
              ))
            ) : (
              <div className="col-span-3 flex flex-col items-center justify-center py-20 text-center">
                <p className="text-zinc-600 text-sm mb-6">No portfolios yet. Create one to begin tracking.</p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Portfolio
                </button>
              </div>
            )}
          </div>

          {/* Allocation */}
          {userPortfolios.length > 0 && (
            <V2AllocationBar portfolios={userPortfolios} totalValue={totalValue} />
          )}
        </section>
      )}

      {/* Markets Tab */}
      {activeTab === "markets" && (
        <section className="max-w-[1600px] mx-auto px-8 pb-16">
          <h2 className="text-xl font-semibold text-white tracking-tight mb-8">Market Benchmarks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {benchmarkData.length > 0 ? (
              benchmarkData.map((b: any) => {
                const up = b.percentageChange >= 0;
                return (
                  <div key={b.ticker} className="rounded-xl border border-white/[0.06] bg-zinc-950/80 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-semibold">{b.name}</h3>
                        <p className="text-zinc-600 text-xs mt-0.5">{b.ticker}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${up ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                        {up ? <ArrowUpRight className="h-3 w-3 inline mr-0.5" /> : <ArrowDownRight className="h-3 w-3 inline mr-0.5" />}
                        {up ? "+" : ""}{b.percentageChange.toFixed(2)}%
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-white tracking-tight">{b.close.toLocaleString()}</p>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-16">
                <p className="text-zinc-600 text-sm">No market data available.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[420px] bg-zinc-950 border-white/[0.06]">
          <DialogHeader>
            <DialogTitle className="text-white">Create Portfolio</DialogTitle>
            <DialogDescription className="text-zinc-500">
              Set up a new portfolio to track your investments.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-zinc-400 text-sm">Name</Label>
              <Input
                id="name"
                placeholder="e.g., Growth Portfolio"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-zinc-900 border-white/[0.06] text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc" className="text-zinc-400 text-sm">Description</Label>
              <Textarea
                id="desc"
                placeholder="Brief description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="bg-zinc-900 border-white/[0.06] text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreatePortfolio}
              disabled={!formData.name.trim()}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Create
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
