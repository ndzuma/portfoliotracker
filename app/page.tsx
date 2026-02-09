"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { ArrowUpRight, ArrowDownRight } from "@phosphor-icons/react";
import { V2Header } from "@/components/header";
import { V2HeroSplit, NetWorthHero } from "@/components/hero-split";
import { V2Ticker } from "@/components/ticker";
import { V2Tabs } from "@/components/tabs";
import { V2AICard } from "@/components/ai-card";
import { V2PortfolioCard } from "@/components/portfolio-card";
import { V2AllocationBar } from "@/components/allocation-bar";
import { V2CreatePortfolioDialog } from "@/components/create-portfolio-dialog";
import { parseMarkdown } from "@/lib/markdown-parser";

export default function V2Dashboard() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("portfolios");

  const convexUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });
  const userId = convexUser?._id;
  const userPortfolios =
    useQuery(api.portfolios.getUserPorfolios, { userId }) || [];
  const benchmarkData = useQuery(api.marketData.getBenchmarkData) || [];
  const aiSummaryData = useQuery(api.ai.getAiNewsSummary) || {};

  const totalValue = userPortfolios.reduce(
    (sum: number, p: any) => sum + p.currentValue,
    0,
  );
  const totalChange = userPortfolios.reduce(
    (sum: number, p: any) => sum + p.change,
    0,
  );
  const totalChangePercent =
    totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0;

  const tabs = [
    { id: "portfolios", label: "Portfolios" },
    { id: "markets", label: "Markets" },
  ];

  const cleanAnalysis = parseMarkdown(
    (aiSummaryData as any)?.analysis || "Analyzing market conditions...",
  );

  const aiHeadline = parseMarkdown((aiSummaryData as any)?.headline || "");
  const aiTimestamp = (aiSummaryData as any)?.timestamp;

  const isPositive = totalChange >= 0;

  return (
    <div className="min-h-screen relative" style={{ background: "#09090b" }}>
      {isPositive ? (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,197,94,0.06),transparent)]" />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(239,68,68,0.06),transparent)]" />
      )}
      <div className="relative">
        <V2Header />

        {/* Hero: 60% Net Worth | line | 40% AI Intelligence */}
        <V2HeroSplit
          leftContent={
            <NetWorthHero
              value={totalValue}
              change={totalChange}
              changePercent={totalChangePercent}
              portfolioCount={userPortfolios.length}
            />
          }
          rightContent={
            <V2AICard
              headline={aiHeadline}
              analysis={cleanAnalysis}
              timestamp={aiTimestamp}
            />
          }
        />

        {/* Ticker Strip */}
        <V2Ticker benchmarks={benchmarkData as any} />

        {/* Tab Navigation */}
        <V2Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Portfolios Tab */}
        {activeTab === "portfolios" && (
          <section className="max-w-[1600px] mx-auto px-8 pt-8 pb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-semibold text-white tracking-tight">
                  Your Portfolios
                </h2>
                <p className="text-zinc-600 text-xs mt-1">
                  {userPortfolios.length} active
                </p>
              </div>
              {/* Show traditional button after 4 portfolios */}
              {userPortfolios.length >= 4 && (
                <V2CreatePortfolioDialog
                  userId={userId}
                  triggerLabel="Add Portfolio"
                />
              )}
            </div>

            {/* Portfolio Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-12">
              {userPortfolios.length > 0 ? (
                <>
                  {userPortfolios.map((portfolio: any) => (
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
                  ))}
                  {/* Show new portfolio card if less than 4 portfolios */}
                  {userPortfolios.length < 4 && (
                    <V2CreatePortfolioDialog
                      userId={userId}
                      triggerLabel="Create a new portfolio"
                      triggerClassName="relative rounded-2xl border border-white/[0.06] bg-zinc-950/60 p-5 hover:border-white/[0.12] transition-all hover:bg-zinc-900/50 min-h-[200px] flex flex-col items-center justify-center group cursor-pointer text-zinc-500 group-hover:text-white text-sm font-medium"
                    />
                  )}
                </>
              ) : (
                <div className="col-span-4 flex flex-col items-center justify-center py-20 text-center">
                  <p className="text-zinc-600 text-sm mb-6">
                    No portfolios yet. Create one to begin tracking.
                  </p>
                  <V2CreatePortfolioDialog
                    userId={userId}
                    triggerLabel="Create Your First Portfolio"
                  />
                </div>
              )}
            </div>

            {/* Allocation */}
            {userPortfolios.length > 0 && (
              <V2AllocationBar
                portfolios={userPortfolios}
                totalValue={totalValue}
              />
            )}
          </section>
        )}

        {/* Markets Tab */}
        {activeTab === "markets" && (
          <section className="max-w-[1600px] mx-auto px-8 pt-8 pb-16">
            <h2 className="text-xl font-semibold text-white tracking-tight mb-8">
              Market Benchmarks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {benchmarkData.length > 0 ? (
                benchmarkData.map((b: any) => {
                  const up = b.percentageChange >= 0;
                  return (
                    <div
                      key={b.ticker}
                      className="rounded-xl border border-white/[0.06] bg-zinc-950/80 p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-white font-semibold">{b.name}</h3>
                          <p className="text-zinc-600 text-xs mt-0.5">
                            {b.ticker}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${up ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}
                        >
                          {up ? (
                            <ArrowUpRight className="h-3 w-3 inline mr-0.5" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 inline mr-0.5" />
                          )}
                          {up ? "+" : ""}
                          {b.percentageChange.toFixed(2)}%
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-white tracking-tight">
                        {b.close.toLocaleString()}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-3 text-center py-16">
                  <p className="text-zinc-600 text-sm">
                    No market data available.
                  </p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
