"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  Sparkle,
  Trash,
} from "@phosphor-icons/react";

import { V2HeroSplit } from "@/components/hero-split";
import { V2Tabs } from "@/components/tabs";
import { V2PerformanceChart } from "@/components/performance-chart";
import { V2AICard } from "@/components/ai-card";
import { V2AssetAllocationBar } from "@/components/allocation-bar";
import { V2Holdings } from "@/components/holdings";
import { V2Analytics } from "@/components/analytics";
import { V2Vault } from "@/components/vault";
import { V2PortfolioGoals } from "@/components/portfolio-goals";
import { V2AddAssetDialog } from "@/components/add-asset-dialog";
import { V2EditAssetDialog } from "@/components/edit-asset-dialog";
import { V2EditPortfolioDialog } from "@/components/edit-portfolio-dialog";
import { Id } from "@/convex/_generated/dataModel";
import type { Asset } from "@/components/types";
import { useUser } from "@clerk/nextjs";
import { parseMarkdown } from "@/lib/markdown-parser";

export default function V2PortfolioDetail() {
  const { user } = useUser();
  const router = useRouter();
  const routeParams = useParams();
  const portfolioId = routeParams.id as string;
  const [activeTab, setActiveTab] = useState("holdings");
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [chartDateRange, setChartDateRange] = useState("1Y");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const generatePortfolioAI = useAction(api.ai.generateAiPortfolioSummary);

  const deletePortfolio = useMutation(api.portfolios.deletePortfolio);

  const convexUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });
  const canUserAccess = useQuery(api.portfolios.canUserAccessPortfolio, {
    portfolioId,
  });
  const portfolioAI = useQuery(api.ai.getPortfolioAiSummary, {
    portfolioId,
  });
  const portfolio = useQuery(api.portfolios.getPortfolioById, { portfolioId });
  const analytics = useQuery(api.portfolios.getPortfolioAnalytics, {
    portfolioId,
  });

  const getDateRange = (range: string) => {
    const today = new Date();
    const start = new Date();
    switch (range) {
      case "1M":
        start.setMonth(today.getMonth() - 1);
        break;
      case "3M":
        start.setMonth(today.getMonth() - 3);
        break;
      case "6M":
        start.setMonth(today.getMonth() - 6);
        break;
      case "1Y":
        start.setFullYear(today.getFullYear() - 1);
        break;
      case "ALL":
        start.setFullYear(today.getFullYear() - 10);
        break;
      default:
        start.setFullYear(today.getFullYear() - 1);
    }
    return {
      startDate: start.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    };
  };

  const { startDate, endDate } = getDateRange(chartDateRange);
  const chartData =
    useQuery(api.marketData.getHistoricalData, {
      portfolioId,
      isForChart: true,
      startDate,
      endDate,
    }) || [];

  const deleteAsset = useMutation(api.assets.deleteAsset);

  const handleEditAsset = (asset: Asset) => {
    if (asset.type === "cash" && !asset.currency) asset.currency = "USD";
    setEditingAsset(asset);
    setIsEditDialogOpen(true);
  };

  const handleDeleteAsset = (id: string) => {
    if (confirm("Are you sure you want to delete this asset?")) {
      deleteAsset({ assetId: id as Id<"assets"> });
    }
  };

  const handleDeletePortfolio = async () => {
    if (!convexUser) return;
    const confirmed = confirm(
      "Are you sure you want to delete this portfolio? This will permanently remove all assets, transactions, and associated data. This action cannot be undone.",
    );
    if (!confirmed) return;
    try {
      setIsDeleting(true);
      await deletePortfolio({
        portfolioId: portfolioId as Id<"portfolios">,
        userId: convexUser._id,
      });
      router.push("/");
    } catch (error) {
      console.error("Failed to delete portfolio:", error);
      setIsDeleting(false);
    }
  };

  // Compute stats
  const holdingsCount = portfolio?.assets?.length || 0;
  const topHolding = portfolio?.assets?.reduce<Asset | null>(
    (top: Asset | null, a: Asset) =>
      !top || a.currentValue > top.currentValue ? a : top,
    null,
  );
  const ytdReturn = analytics?.performanceMetrics?.ytdReturn;
  const annualizedReturn = analytics?.performanceMetrics?.annualizedReturn;
  const volatility = analytics?.riskMetrics?.volatility;

  const tabs = [
    { id: "holdings", label: "Holdings" },
    { id: "analytics", label: "Portfolio Analytics" },
    { id: "goals", label: "Goals" },
    { id: "vault", label: "Vault" },
  ];

  const dateRanges = ["1M", "3M", "6M", "1Y", "ALL"];

  const cleanAnalysis = parseMarkdown(
    portfolioAI?.analysis || "Analysis will appear once data is processed.",
  );

  const aiHeadline = parseMarkdown(portfolioAI?.headline);
  const portfolioTimestamp = portfolioAI?.timestamp;

  const handleGenerateAI = async () => {
    if (!portfolioId || isGeneratingAI) return;

    try {
      setIsGeneratingAI(true);
      const result = await generatePortfolioAI({ portfolioId });
      console.log("AI generation completed:", result);
    } catch (error) {
      console.error("Failed to generate AI analysis:", error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Handle deleted portfolio — redirect home gracefully
  useEffect(() => {
    if (portfolio === null) {
      router.push("/");
    }
  }, [portfolio, router]);

  if (portfolio === null) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#09090b" }}
      >
        <div className="text-center">
          <p className="text-sm text-zinc-500">Redirecting…</p>
        </div>
      </div>
    );
  }

  if (canUserAccess === false) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#09090b" }}
      >
        <div className="text-center">
          <h1 className="text-xl font-semibold text-white mb-3">
            Access Denied
          </h1>
          <p className="text-zinc-600 text-sm mb-6">
            You don't have permission to view this portfolio.
          </p>
          <Link
            href="/"
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 inline mr-1" />
            Back
          </Link>
        </div>
      </div>
    );
  }

  const isPositive = (portfolio?.change || 0) >= 0;

  return (
    <div className="relative">
      {isPositive ? (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(34,197,94,0.06),transparent)]" />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(239,68,68,0.06),transparent)]" />
      )}
      <div className="relative">
        {/* Back + Edit */}
        <div className="max-w-[1600px] mx-auto px-8 pt-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Link>
            {portfolio && convexUser && (
              <>
                <div className="w-px h-3 bg-white/[0.1]" />
                <V2EditPortfolioDialog
                  portfolioId={portfolioId}
                  userId={convexUser._id}
                  initialName={portfolio.name}
                  initialDescription={portfolio.description}
                  initialRiskTolerance={portfolio.riskTolerance}
                  initialTimeHorizon={portfolio.timeHorizon}
                  initialIncludeInNetworth={portfolio.includeInNetworth ?? true}
                  initialAllowSubscriptions={
                    portfolio.allowSubscriptions ?? false
                  }
                />
                <div className="w-px h-3 bg-white/[0.1]" />
                <button
                  onClick={handleDeletePortfolio}
                  disabled={isDeleting}
                  className="text-xs text-zinc-500 hover:text-red-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <Trash className="h-3 w-3" />
                  {isDeleting ? "Deleting..." : "Delete Portfolio"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Hero: 60% Portfolio Value + 40% Performance Chart */}
        <V2HeroSplit
          leftContent={
            <div>
              <div className="flex items-end gap-6 flex-wrap mb-3">
                <h1 className="text-4xl lg:text-[56px] font-bold text-white tracking-tighter leading-none">
                  {portfolio?.name || "Loading..."}
                </h1>
                <div
                  className={`flex items-center gap-1.5 pb-2 ${(portfolio?.change || 0) >= 0 ? "text-emerald-500" : "text-red-500"}`}
                >
                  {(portfolio?.change || 0) >= 0 ? (
                    <ArrowUpRight className="h-5 w-5" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5" />
                  )}
                  <span className="text-xl font-semibold">
                    {(portfolio?.change || 0) >= 0 ? "+" : ""}
                    {portfolio?.changePercent?.toFixed(2) || "0.00"}%
                  </span>
                </div>
              </div>
              <p className="text-2xl lg:text-3xl text-zinc-400 mb-2">
                $
                {portfolio?.currentValue?.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) || "0.00"}
              </p>
              {portfolio?.description && (
                <p className="text-sm text-zinc-600 mb-3">
                  {portfolio.description}
                </p>
              )}
              <p className="text-zinc-600 text-sm">
                {(portfolio?.change || 0) >= 0 ? "+" : ""}$
                {Math.abs(portfolio?.change || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}{" "}
                today
              </p>
            </div>
          }
          rightContent={
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-[0.15em]">
                  Performance
                </p>
                <div className="flex items-center gap-0.5">
                  {dateRanges.map((r) => (
                    <button
                      key={r}
                      onClick={() => setChartDateRange(r)}
                      className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
                        chartDateRange === r
                          ? "bg-white/[0.08] text-white"
                          : "text-zinc-600 hover:text-zinc-400"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 min-h-[180px]">
                <V2PerformanceChart data={chartData} height={180} />
              </div>
            </div>
          }
        />

        {/* Stats Row: Holdings, Top Holding, YTD Return, Volatility */}
        <section className="max-w-[1600px] mx-auto px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-white/[0.06] bg-zinc-950/60 p-4">
              <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider mb-1.5">
                Holdings
              </p>
              <p className="text-2xl font-bold text-white">{holdingsCount}</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-zinc-950/60 p-4">
              <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider mb-1.5">
                Top Holding
              </p>
              <p className="text-lg font-bold text-white truncate">
                {topHolding?.symbol || topHolding?.name || "--"}
              </p>
              {topHolding && (
                <p className="text-xs text-zinc-600">
                  ${topHolding.currentValue.toLocaleString()}
                </p>
              )}
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-zinc-950/60 p-4">
              <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider mb-1.5">
                YTD Return
              </p>
              <p
                className={`text-2xl font-bold ${ytdReturn !== undefined && ytdReturn >= 0 ? "text-emerald-500" : "text-red-500"}`}
              >
                {ytdReturn !== undefined
                  ? `${(ytdReturn * 100).toFixed(2)}%`
                  : "--"}
              </p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-zinc-950/60 p-4">
              <p className="text-[11px] text-zinc-500 font-medium uppercase tracking-wider mb-1.5">
                Volatility
              </p>
              <p className="text-2xl font-bold text-white">
                {volatility !== undefined
                  ? `${(volatility * 100).toFixed(2)}%`
                  : "--"}
              </p>
            </div>
          </div>
        </section>

        {/* AI Summary + Allocation */}
        <section className="max-w-[1600px] mx-auto px-8 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/[0.06] bg-zinc-950/60 p-5">
              <V2AICard
                label="AI Portfolio Insight"
                headline={aiHeadline}
                analysis={cleanAnalysis}
                timestamp={portfolioTimestamp}
                maxDisplayLength={80}
                onRefresh={handleGenerateAI}
                isRefreshing={isGeneratingAI}
                showRefresh={true}
              />
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-zinc-950/60 p-5 flex flex-col justify-center">
              <V2AssetAllocationBar assets={portfolio?.assets || []} />
            </div>
          </div>
        </section>

        {/* Divider — top line for tabs, matching ticker strip DNA */}
        <div
          className="border-b"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        />

        {/* Tabs */}
        <V2Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <section className="max-w-[1600px] mx-auto px-8 pt-8 pb-16">
          {activeTab === "holdings" && (
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-semibold text-white tracking-tight">
                  Holdings
                </h2>
                <p className="text-zinc-600 text-xs mt-1">
                  {portfolio?.assets?.length || 0} assets
                </p>
              </div>
              <V2AddAssetDialog portfolioId={portfolioId} />
            </div>
          )}

          {activeTab === "holdings" && (
            <V2Holdings
              assets={portfolio?.assets || []}
              onEdit={handleEditAsset}
              onDelete={handleDeleteAsset}
            />
          )}

          {activeTab === "analytics" && (
            <V2Analytics portfolioId={portfolioId} />
          )}

          {activeTab === "goals" && (
            <V2PortfolioGoals
              portfolioId={portfolioId}
              portfolioValue={portfolio?.currentValue || 0}
              annualizedReturn={
                annualizedReturn !== undefined
                  ? annualizedReturn * 100
                  : portfolio?.changePercent || 0
              }
              ytdReturn={ytdReturn !== undefined ? ytdReturn * 100 : 0}
              analytics={analytics as any}
            />
          )}

          {activeTab === "vault" && (
            <V2Vault portfolioId={portfolioId} userId={convexUser?._id} />
          )}
        </section>

        {/* Edit Dialog */}
        <V2EditAssetDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          asset={editingAsset}
          onAssetUpdated={() => setEditingAsset(null)}
        />
      </div>
    </div>
  );
}
