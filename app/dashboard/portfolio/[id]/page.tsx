"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Id } from "../../../../convex/_generated/dataModel";
import { useParams } from "next/navigation";
import { AISummaryCard } from "@/components/AISummaryCard";
import {
  GoalTrackerCard,
  DocumentStorageCard,
  ArticleSaverCard,
  PerformanceMetricsCard,
  TemplatesCard,
} from "./components/bunker";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { AssetSection } from "./components/AssetSection";
import { Asset } from "./components/types";
import { AssetAllocationPie } from "@/components/assetAllocationPie";
import { api } from "../../../../convex/_generated/api";
import { PorfolioPerformanceChart } from "@/components/PortfolioPerformance";
import { AddAssetDialog } from "./components/dialogs/AddAssetDialog";
import { EditPortfolioDialog } from "./components/dialogs/EditPortfolioDialog";
import { EditAssetDialog } from "./components/dialogs/EditAssetDialog";

export default function PortfolioDetail({
  params,
}: {
  params: { id: string };
}) {
  const routeParams = useParams();
  const portfolioId = routeParams.id as string;

  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBunkerCollapsed, setIsBunkerCollapsed] = useState(true);
  const deleteAsset = useMutation(api.assets.deleteAsset);

  // convex operations
  const portfolio = useQuery(api.portfolios.getPortfolioById, {
    portfolioId: portfolioId,
  });

  // Filter assets by type
  const stockAssets =
    portfolio?.assets.filter((asset) => asset.type === "stock") || [];
  const propertyAssets =
    portfolio?.assets.filter((asset) => asset.type === "real estate") || [];
  const commodityAssets =
    portfolio?.assets.filter((asset) => asset.type === "commodity") || [];
  const bondAssets =
    portfolio?.assets.filter((asset) => asset.type === "bond") || [];
  const cashAssets =
    portfolio?.assets.filter((asset) => asset.type === "cash") || [];
  const cryptoAssets =
    portfolio?.assets.filter((asset) => asset.type === "crypto") || [];
  const otherAssets =
    portfolio?.assets.filter((asset) => asset.type === "other") || [];

  const handleEditAsset = (asset: Asset) => {
    // Convert asset to properly handle currency for cash
    if (asset.type === "cash" && !asset.currency) {
      asset.currency = "USD";
    }
    setEditingAsset(asset);
    setIsEditDialogOpen(true);
  };

  const handleDeleteAsset = (id: string) => {
    if (confirm("Are you sure you want to delete this asset?")) {
      deleteAsset({
        assetId: id as Id<"assets">,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portfolios
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-foreground mb-2">
              {portfolio?.name || "Loading portfolio..."}
            </h1>
            <p className="text-muted-foreground">
              {portfolio?.description || ""}
            </p>
          </div>
          <div className="flex gap-3">
            {portfolio && (
              <EditPortfolioDialog
                portfolioId={portfolioId}
                userId={portfolio.userId}
                initialName={portfolio.name}
                initialDescription={portfolio.description}
              />
            )}
            <AddAssetDialog portfolioId={portfolioId} />

            {/* Edit Asset Dialog */}
            <EditAssetDialog
              isOpen={isEditDialogOpen}
              onOpenChange={setIsEditDialogOpen}
              asset={editingAsset}
              onAssetUpdated={() => setEditingAsset(null)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${portfolio?.currentValue.toLocaleString()}
              </div>
              <div
                className={`text-sm flex items-center gap-2 mt-2 ${portfolio?.change || 0 >= 0 ? "text-primary" : "text-secondary"}`}
              >
                {portfolio?.change || 0 >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {portfolio?.change || 0 >= 0 ? "+" : ""}$
                {Math.abs(portfolio?.change || 0).toLocaleString()} (
                {portfolio?.change || 0 >= 0 ? "+" : ""}
                {portfolio?.changePercent.toFixed(2)}%)
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Investing Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="text-2xl font-bold">Dec 15</div>
                  <div className="text-muted-foreground">
                    AAPL Dividend Ex-Date
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <AISummaryCard
            title="AI Summary"
            headline={portfolio?.aiHeadline || "Portfolio Analysis"}
            content={
              portfolio?.aiSummary ||
              "Analysis will appear here once portfolio data is processed."
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <PorfolioPerformanceChart />
          <AssetAllocationPie
            value={portfolio?.currentValue || 0}
            assets={portfolio?.assets || []}
          />
        </div>

        <Separator className="mb-6" />

        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-foreground">Bunker</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBunkerCollapsed(!isBunkerCollapsed)}
              className="flex items-center gap-2"
            >
              {isBunkerCollapsed ? (
                <>
                  <ChevronDown className="h-4 w-4" />
                  <span>Expand</span>
                </>
              ) : (
                <>
                  <ChevronUp className="h-4 w-4" />
                  <span>Collapse</span>
                </>
              )}
            </Button>
          </div>

          {!isBunkerCollapsed && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Goal Tracker Card - spans 2 rows */}
              <GoalTrackerCard
                portfolioValue={25000}
                targetValue={100000}
                annualReturn={5.8}
                targetReturn={8}
                monthlyContribution={500}
                targetContribution={500}
              />

              {/* Document Storage Card */}
              <DocumentStorageCard />

              {/* Article Saver Card */}
              <ArticleSaverCard />

              {/* Performance Metrics Card */}
              <PerformanceMetricsCard />

              {/* Templates Card */}
              <TemplatesCard />
            </div>
          )}
        </div>

        <Separator className="mb-6" />

        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Holdings
          </h2>
          <AssetSection
            key={`stocks-${stockAssets.length}-${portfolio?._id}`}
            title="Stocks"
            assets={stockAssets}
            onEdit={handleEditAsset}
            onDelete={handleDeleteAsset}
          />
          <AssetSection
            key={`crypto-${cryptoAssets.length}-${portfolio?._id}`}
            title="Cryptocurrencies"
            assets={cryptoAssets}
            onEdit={handleEditAsset}
            onDelete={handleDeleteAsset}
          />
          <AssetSection
            key={`property-${propertyAssets.length}-${portfolio?._id}`}
            title="Real Estate & Properties"
            assets={propertyAssets}
            onEdit={handleEditAsset}
            onDelete={handleDeleteAsset}
          />
          <AssetSection
            key={`commodity-${commodityAssets.length}-${portfolio?._id}`}
            title="Commodities"
            assets={commodityAssets}
            onEdit={handleEditAsset}
            onDelete={handleDeleteAsset}
          />
          <AssetSection
            key={`bonds-${bondAssets.length}-${portfolio?._id}`}
            title="Bonds"
            assets={bondAssets}
            onEdit={handleEditAsset}
            onDelete={handleDeleteAsset}
          />
          <AssetSection
            key={`cash-${cashAssets.length}-${portfolio?._id}`}
            title="Cash"
            assets={cashAssets}
            onEdit={handleEditAsset}
            onDelete={handleDeleteAsset}
          />
          <AssetSection
            key={`other-${otherAssets.length}-${portfolio?._id}`}
            title="Other Assets"
            assets={otherAssets}
            onEdit={handleEditAsset}
            onDelete={handleDeleteAsset}
          />
        </div>
      </div>
    </div>
  );
}
