"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  V2Header,
  V2HeroSplit,
  NetWorthHero,
  V2Ticker,
  V2Tabs,
  V2AICard,
  V2PortfolioCard,
  V2AllocationBar,
} from "@/components/v2";
import { cleanMarkdownWrapper } from "@/lib/markdown-parser";

export default function V2Dashboard() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("portfolios");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });

  // Convex queries
  const convexUser = useQuery(api.users.getUserByClerkId, { clerkId: user?.id });
  const userId = convexUser?._id;
  const userPortfolios = useQuery(api.portfolios.getUserPorfolios, { userId }) || [];
  const benchmarkData = useQuery(api.marketData.getBenchmarkData) || [];
  const aiSummaryData = useQuery(api.ai.getAiNewsSummary) || {};

  // Mutations
  const createPortfolio = useMutation(api.portfolios.createPortfolio);

  // Calculate totals
  const totalValue = userPortfolios.reduce((sum, p) => sum + p.currentValue, 0);
  const totalChange = userPortfolios.reduce((sum, p) => sum + p.change, 0);
  const totalChangePercent = totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0;

  const handleCreatePortfolio = () => {
    if (userId && formData.name.trim()) {
      createPortfolio({
        userId,
        name: formData.name,
        description: formData.description,
      });
      setFormData({ name: "", description: "" });
      setIsCreateModalOpen(false);
    }
  };

  const tabs = [
    { id: "portfolios", label: "Portfolios" },
    { id: "markets", label: "Markets" },
  ];

  const cleanAnalysis = cleanMarkdownWrapper(aiSummaryData?.analysis || "Markets are showing resilience. Your portfolio continues to perform well. Monitor key indicators for any significant changes.");

  return (
    <div className="min-h-screen" style={{ background: "#09090b" }}>
      {/* Header */}
      <V2Header activeTab="overview" />

      {/* Hero Section: 60% Net Worth + 40% AI */}
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

      {/* Tab Content */}
      {activeTab === "portfolios" && (
        <section className="max-w-[1600px] mx-auto px-8 pb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Your Portfolios</h2>
              <p className="text-zinc-600 text-sm mt-1">{userPortfolios.length} active portfolios</p>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-primary text-black hover:bg-primary/90 font-medium"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Portfolio
            </Button>
          </div>

          {/* Portfolio Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {userPortfolios.length > 0 ? (
              userPortfolios.map((portfolio) => (
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
              <div className="col-span-3 flex flex-col items-center justify-center py-16 text-center">
                <p className="text-zinc-600 mb-4">No portfolios yet. Create one to begin tracking your investments.</p>
                <Button onClick={() => setIsCreateModalOpen(true)} className="bg-primary text-black hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Portfolio
                </Button>
              </div>
            )}
          </div>

          {/* Allocation Bar */}
          {userPortfolios.length > 0 && (
            <V2AllocationBar portfolios={userPortfolios} totalValue={totalValue} />
          )}
        </section>
      )}

      {activeTab === "markets" && (
        <section className="max-w-[1600px] mx-auto px-8 pb-12">
          <h2 className="text-2xl font-bold text-white tracking-tight mb-8">Market Benchmarks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {benchmarkData.length > 0 ? (
              benchmarkData.map((benchmark) => {
                const isPositive = benchmark.percentageChange >= 0;
                return (
                  <div
                    key={benchmark.ticker}
                    className="rounded-2xl border border-white/[0.06] bg-zinc-950 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-semibold text-lg">{benchmark.name}</h3>
                        <p className="text-zinc-600 text-sm mt-0.5">{benchmark.ticker}</p>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-white tracking-tight">
                      {benchmark.close.toLocaleString()}
                    </p>
                    <p className={`text-sm mt-1 ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
                      {isPositive ? "+" : ""}
                      {benchmark.percentageChange.toFixed(2)}%
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-16">
                <p className="text-zinc-600">No market data available.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Create Portfolio Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Portfolio</DialogTitle>
            <DialogDescription>
              Set up a new portfolio to track your investments.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Portfolio Name</Label>
              <Input
                id="name"
                placeholder="e.g., Growth Portfolio"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePortfolio} disabled={!formData.name.trim()} className="bg-primary text-black">
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
