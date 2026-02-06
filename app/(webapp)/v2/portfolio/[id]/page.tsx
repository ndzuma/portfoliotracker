"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { V2Header, V2HeroSplit, V2Tabs, V2PerformanceChart, V2StatsRow, V2AICard } from "@/components/v2";
import { AssetSection } from "@/app/(webapp)/portfolio/[id]/components/AssetSection";
import { PortfolioAnalytics } from "@/components/PortfolioAnalytics";
import { GoalTrackerCard, DocumentStorageCard, ArticleSaverCard } from "@/app/(webapp)/portfolio/[id]/components/bunker";
import { AddAssetDialog } from "@/app/(webapp)/portfolio/[id]/components/dialogs/AddAssetDialog";
import { EditAssetDialog } from "@/app/(webapp)/portfolio/[id]/components/dialogs/EditAssetDialog";
import { cleanMarkdownWrapper } from "@/lib/markdown-parser";
import { Id } from "@/convex/_generated/dataModel";
import type { Asset } from "@/app/(webapp)/portfolio/[id]/components/types";
import { useUser } from "@clerk/nextjs";

export default function V2PortfolioDetail() {
  const { user } = useUser();
  const routeParams = useParams();
  const portfolioId = routeParams.id as string;
  const [activeTab, setActiveTab] = useState("holdings");
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [chartDateRange, setChartDateRange] = useState("1Y");

  // Convex queries
  const convexUser = useQuery(api.users.getUserByClerkId, { clerkId: user?.id || "" });
  const canUserAccess = useQuery(api.portfolios.canUserAccessPortfolio, { portfolioId });
  const portfolio = useQuery(api.portfolios.getPortfolioById, { portfolioId });

  // Chart data
  const getDateRange = (range: string) => {
    const today = new Date();
    const startDate = new Date();
    switch (range) {
      case "1M": startDate.setMonth(today.getMonth() - 1); break;
      case "3M": startDate.setMonth(today.getMonth() - 3); break;
      case "6M": startDate.setMonth(today.getMonth() - 6); break;
      case "1Y": startDate.setFullYear(today.getFullYear() - 1); break;
      case "2Y": startDate.setFullYear(today.getFullYear() - 2); break;
      case "5Y": startDate.setFullYear(today.getFullYear() - 5); break;
      case "ALL":
      default: startDate.setFullYear(today.getFullYear() - 10); break;
    }
    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    };
  };

  const { startDate, endDate } = getDateRange(chartDateRange);
  const chartData = useQuery(api.marketData.getHistoricalData, { portfolioId, isForChart: true, startDate, endDate }) || [];

  // Mutations
  const deleteAsset = useMutation(api.assets.deleteAsset);

  // Filter assets by type
  const stockAssets = portfolio?.assets.filter((asset) => asset.type === "stock") || [];
  const cryptoAssets = portfolio?.assets.filter((asset) => asset.type === "crypto") || [];
  const propertyAssets = portfolio?.assets.filter((asset) => asset.type === "real estate") || [];
  const commodityAssets = portfolio?.assets.filter((asset) => asset.type === "commodity") || [];
  const bondAssets = portfolio?.assets.filter((asset) => asset.type === "bond") || [];
  const cashAssets = portfolio?.assets.filter((asset) => asset.type === "cash") || [];
  const otherAssets = portfolio?.assets.filter((asset) => asset.type === "other") || [];

  const handleEditAsset = (asset: Asset) => {
    if (asset.type === "cash" && !asset.currency) {
      asset.currency = "USD";
    }
    setEditingAsset(asset);
    setIsEditDialogOpen(true);
  };

  const handleDeleteAsset = (id: string) => {
    if (confirm("Are you sure you want to delete this asset?")) {
      deleteAsset({ assetId: id as Id<"assets"> });
    }
  };

  // Calculate cost basis and unrealized gain
  const costBasis = portfolio?.assets.reduce((sum, a) => sum + (a.purchasePrice || 0) * (a.quantity || 0), 0) || 0;
  const unrealizedGain = (portfolio?.currentValue || 0) - costBasis;
  const unrealizedGainPercent = costBasis > 0 ? (unrealizedGain / costBasis) * 100 : 0;

  const stats = [
    { label: "Total Value", value: `$${portfolio?.currentValue.toLocaleString() || 0}`, change: portfolio?.changePercent, changeLabel: "today" },
    { label: "Cost Basis", value: `$${costBasis.toLocaleString()}` },
    { label: "Unrealized Gain", value: `$${unrealizedGain.toLocaleString()}`, change: unrealizedGainPercent },
  ];

  const tabs = [
    { id: "holdings", label: "Holdings" },
    { id: "analytics", label: "Portfolio Analytics" },
    { id: "vault", label: "Vault" },
  ];

  const cleanAnalysis = cleanMarkdownWrapper(portfolio?.aiSummary || "Portfolio analysis will appear here once data is processed.");

  if (!canUserAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#09090b" }}>
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-white mb-4">Access Denied</h1>
          <p className="text-zinc-600 mb-6">You do not have permission to view this portfolio.</p>
          <Link href="/v2">
            <Button variant="ghost" className="text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portfolios
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#09090b" }}>
      {/* Header */}
      <V2Header activeTab="overview" />

      {/* Back Button + Title */}
      <div className="max-w-[1600px] mx-auto px-8 pt-8 pb-4">
        <Link href="/v2">
          <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Portfolios
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{portfolio?.name || "Loading..."}</h1>
            <p className="text-zinc-600 text-sm mt-1">{portfolio?.description || ""}</p>
          </div>
          <AddAssetDialog portfolioId={portfolioId} />
        </div>
      </div>

      {/* Hero Section: 60% Stats + 40% Performance Chart */}
      <V2HeroSplit
        leftContent={
          <div>
            <p className="text-zinc-600 text-sm font-medium tracking-widest uppercase mb-4">Portfolio Value</p>
            <div className="flex items-end gap-6 flex-wrap">
              <h1 className="text-6xl lg:text-7xl font-bold text-white tracking-tighter leading-none">
                ${portfolio?.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
              </h1>
              <div className={`flex items-center gap-2 pb-2 ${(portfolio?.change || 0) >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                {(portfolio?.change || 0) >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
                <span className="text-2xl font-semibold">
                  {(portfolio?.change || 0) >= 0 ? "+" : ""}
                  {portfolio?.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
            <p className="text-zinc-600 text-sm mt-3">
              {(portfolio?.change || 0) >= 0 ? "+" : ""}${Math.abs(portfolio?.change || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })} today • {portfolio?.assetsCount || 0} assets
            </p>
          </div>
        }
        rightContent={
          <div className="h-full flex flex-col">
            <p className="text-zinc-600 text-sm font-medium tracking-widest uppercase mb-4">Performance</p>
            <div className="flex-1">
              <V2PerformanceChart data={chartData} height={200} />
            </div>
          </div>
        }
      />

      {/* Stats Row */}
      <section className="max-w-[1600px] mx-auto px-8 py-8">
        <V2StatsRow stats={stats} />
      </section>

      {/* AI Summary */}
      <section className="max-w-[1600px] mx-auto px-8 pb-8">
        <V2AICard analysis={cleanAnalysis} />
      </section>

      {/* Tab Navigation */}
      <V2Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      {activeTab === "holdings" && (
        <section className="max-w-[1600px] mx-auto px-8 pb-12">
          {portfolio?.assets && portfolio.assets.length > 0 ? (
            <>
              <AssetSection title="Stocks" assets={stockAssets} onEdit={handleEditAsset} onDelete={handleDeleteAsset} />
              <AssetSection title="Cryptocurrencies" assets={cryptoAssets} onEdit={handleEditAsset} onDelete={handleDeleteAsset} />
              <AssetSection title="Real Estate & Properties" assets={propertyAssets} onEdit={handleEditAsset} onDelete={handleDeleteAsset} />
              <AssetSection title="Commodities" assets={commodityAssets} onEdit={handleEditAsset} onDelete={handleDeleteAsset} />
              <AssetSection title="Bonds" assets={bondAssets} onEdit={handleEditAsset} onDelete={handleDeleteAsset} />
              <AssetSection title="Cash" assets={cashAssets} onEdit={handleEditAsset} onDelete={handleDeleteAsset} />
              <AssetSection title="Other Assets" assets={otherAssets} onEdit={handleEditAsset} onDelete={handleDeleteAsset} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-zinc-600 mb-4">No assets in this portfolio yet.</p>
              <AddAssetDialog portfolioId={portfolioId} />
            </div>
          )}
        </section>
      )}

      {activeTab === "analytics" && (
        <section className="max-w-[1600px] mx-auto px-8 pb-12">
          <PortfolioAnalytics portfolioId={portfolioId} />
        </section>
      )}

      {activeTab === "vault" && (
        <section className="max-w-[1600px] mx-auto px-8 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GoalTrackerCard
              portfolioId={portfolioId}
              portfolioValue={portfolio?.currentValue || 0}
              annualReturn={portfolio?.changePercent || 0}
              monthlyContribution={0}
            />
            <ArticleSaverCard userId={convexUser?._id} portfolioId={portfolioId} />
            <DocumentStorageCard userId={convexUser?._id} portfolioId={portfolioId} />
          </div>
        </section>
      )}

      {/* Edit Asset Dialog */}
      <EditAssetDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        asset={editingAsset}
        onAssetUpdated={() => setEditingAsset(null)}
      />
    </div>
  );
}
