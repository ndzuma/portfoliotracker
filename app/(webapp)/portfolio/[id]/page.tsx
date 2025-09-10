"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
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
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { AssetSection } from "./components/AssetSection";
import { Asset } from "./components/types";
import { AssetAllocationPie } from "@/components/assetAllocationPie";
import { PorfolioPerformanceChart } from "@/components/PortfolioPerformance";
import { CircleSlash, Calendar, ChevronRight, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddAssetDialog } from "./components/dialogs/AddAssetDialog";
import { EditPortfolioDialog } from "./components/dialogs/EditPortfolioDialog";
import { EditAssetDialog } from "./components/dialogs/EditAssetDialog";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { PortfolioAnalytics } from "@/components/PortfolioAnalytics";

export default function PortfolioDetail({
  params,
}: {
  params: { id: string };
}) {
  const { user } = useUser();
  const routeParams = useParams();
  const portfolioId = routeParams.id as string;
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBunkerCollapsed, setIsBunkerCollapsed] = useState(true);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);

  // Temporary investing calendar data
  const investingCalendarEvents = [
    { date: "Dec 15", description: "AAPL Dividend Ex-Date" },
    { date: "Dec 20", description: "MSFT Earnings Call" },
    { date: "Jan 05", description: "AMZN Quarterly Report" },
    { date: "Jan 12", description: "GOOGL Board Meeting" },
    { date: "Jan 15", description: "TSLA Product Announcement" },
    { date: "Jan 28", description: "NVDA Dividend Payment" },
  ];

  // convex operations
  const convexUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });
  const canUserAccess = useQuery(api.portfolios.canUserAccessPortfolio, {
    portfolioId: portfolioId,
  });
  const portfolio = useQuery(api.portfolios.getPortfolioById, {
    portfolioId: portfolioId,
  });
  const deleteAsset = useMutation(api.assets.deleteAsset);
  const [chartDateRange, setChartDateRange] = useState("1Y"); // 1M, 3M, 6M, 1Y, 2Y, 5Y, ALL

  const getDateRange = (range: string) => {
    const today = new Date();
    const startDate = new Date();

    switch (range) {
      case "1M":
        startDate.setMonth(today.getMonth() - 1);
        break;
      case "3M":
        startDate.setMonth(today.getMonth() - 3);
        break;
      case "6M":
        startDate.setMonth(today.getMonth() - 6);
        break;
      case "1Y":
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      case "2Y":
        startDate.setFullYear(today.getFullYear() - 2);
        break;
      case "5Y":
        startDate.setFullYear(today.getFullYear() - 5);
        break;
      case "ALL":
      default:
        startDate.setFullYear(today.getFullYear() - 10); // Default to 10 years for "ALL"
        break;
    }

    return {
      startDate: startDate.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    };
  };

  const { startDate, endDate } = getDateRange(chartDateRange);

  const chartData =
    useQuery(api.marketData.getHistoricalData, {
      portfolioId: portfolioId,
      isForChart: true,
      startDate,
      endDate,
    }) || [];

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

  if (!canUserAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-4">
            Access Denied
          </h1>
          <p className="text-muted-foreground mb-6">
            You do not have permission to view this portfolio.
          </p>
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Portfolios
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
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
              <CardTitle>Total Value</CardTitle>
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
              <CardTitle>Investing Calendar</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              <div className="flex-grow space-y-3">
                {investingCalendarEvents.length > 0 ? (
                  <div className="text-sm">
                    <div className="text-2xl font-bold">
                      {investingCalendarEvents[0].date}
                    </div>
                    <div className="text-muted-foreground">
                      {investingCalendarEvents[0].description}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm">
                    <p className="text-muted-foreground">No available events</p>
                  </div>
                )}
              </div>
              {investingCalendarEvents.length > 0 && (
                <div
                  onClick={() => setIsCalendarModalOpen(true)}
                  className="mt-auto pt-3 text-sm text-muted-foreground hover:text-foreground cursor-pointer self-start flex items-center transition-colors"
                >
                  <span>See all events</span>
                  <ArrowRight className="h-3 w-3 ml-1" />
                </div>
              )}
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
          <div className="md:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <CardTitle>Historical Performance</CardTitle>
                  <CardDescription>
                    Portfolio performance over time
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={chartDateRange}
                    onValueChange={setChartDateRange}
                  >
                    <SelectTrigger className="w-36">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1M">1 Mmonth</SelectItem>
                      <SelectItem value="3M">3 Months</SelectItem>
                      <SelectItem value="6M">6 Months</SelectItem>
                      <SelectItem value="1Y">1 Year</SelectItem>
                      <SelectItem value="2Y">2 Years</SelectItem>
                      <SelectItem value="5Y">5 Years</SelectItem>
                      <SelectItem value="ALL">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <PorfolioPerformanceChart data={chartData} />
            </Card>
          </div>
          <AssetAllocationPie
            value={portfolio?.currentValue || 0}
            assets={portfolio?.assets || []}
          />
        </div>

        <Separator className="mb-0" />

        <PortfolioAnalytics portfolioId={portfolioId} />

        <Separator className="mb-0" />

        <div className="mb-6">
          <div
            className={`flex items-center justify-between mb-6 pt-6 ${!isBunkerCollapsed ? "sticky top-0 bg-background z-10 pb-6 border-b" : ""}`}
          >
            <h2 className="text-2xl font-semibold text-foreground">Vault</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBunkerCollapsed(!isBunkerCollapsed)}
              className="flex items-center gap-2"
            >
              {!isBunkerCollapsed ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  <span>Collapse</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  <span>Expand</span>
                </>
              )}
            </Button>
          </div>

          {!isBunkerCollapsed && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {/* Goal Tracker Card - spans 2 rows */}
              <GoalTrackerCard
                portfolioId={portfolioId}
                portfolioValue={portfolio?.currentValue || 0}
                annualReturn={portfolio?.changePercent || 0}
                monthlyContribution={0} // TODO: Calculate from recent transactions
              />

              {/* Article Saver Card */}
              <ArticleSaverCard
                userId={convexUser?._id}
                portfolioId={portfolioId}
              />

              {/* Document Storage Card */}
              <DocumentStorageCard
                userId={convexUser?._id}
                portfolioId={portfolioId}
              />
            </div>
          )}
        </div>

        <Separator className="mb-6" />

        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            Holdings
          </h2>
          {portfolio?.assets && portfolio.assets.length > 0 ? (
            <>
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
            </>
          ) : (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Assets (0)</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <CircleSlash className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">
                  No asset data available
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Add your first asset using the button above
                </p>
                <AddAssetDialog portfolioId={portfolioId} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Investing Calendar Dialog */}
      <Dialog open={isCalendarModalOpen} onOpenChange={setIsCalendarModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Investing Calendar
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {investingCalendarEvents.length > 0 ? (
              investingCalendarEvents.map((event, index) => (
                <div
                  key={index}
                  className="flex items-start pb-4 border-b border-border last:border-0 last:pb-0"
                >
                  <div className="text-center bg-muted/50 rounded px-2 py-1 min-w-[80px]">
                    <div className="font-medium">{event.date}</div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="font-medium">{event.description}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No events available</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
