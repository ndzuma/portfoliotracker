"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useState } from "react";
import { useParams } from "next/navigation";
import { AISummaryCard } from "@/components/AISummaryCard";
import { Input } from "@/components/ui/input";
import {
  GoalTrackerCard,
  DocumentStorageCard,
  ArticleSaverCard,
  PerformanceMetricsCard,
  TemplatesCard,
} from "./components/bunker";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit,
  Calendar,
  Target,
  FileIcon,
  BookIcon,
  BarChart3,
  PieChart,
  FileDown,
  LinkIcon,
  PlusCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { AssetSection } from "./components/AssetSection";
import { Asset } from "./components/types";
import { AssetAllocationPie } from "@/components/assetAllocationPie";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { PorfolioPerformanceChart } from "@/components/PortfolioPerformance";

export default function PortfolioDetail({
  params,
}: {
  params: { id: string };
}) {
  const routeParams = useParams();
  const portfolioId = routeParams.id as string;

  const [assets, setAssets] = useState<Asset[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isBunkerCollapsed, setIsBunkerCollapsed] = useState(true);
  const [newAsset, setNewAsset] = useState({
    symbol: "",
    name: "",
    type: "stock" as Asset["type"],
    shares: "",
    avgBuyPrice: "",
    currentPrice: "",
  });

  // convex operations
  const portfolio = useQuery(api.portfolios.getPortfolioById, {
    portfolioId: portfolioId,
  });

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

  const handleAddAsset = () => {
    const shares = Number.parseFloat(newAsset.shares);
    const avgPrice = Number.parseFloat(newAsset.avgBuyPrice);
    const currentPrice = Number.parseFloat(newAsset.currentPrice);

    if (
      !newAsset.symbol ||
      !newAsset.name ||
      !shares ||
      !avgPrice ||
      !currentPrice
    )
      return;

    const currentValue = shares * currentPrice;
    const change = shares * (currentPrice - avgPrice);
    const changePercent = ((currentPrice - avgPrice) / avgPrice) * 100;

    const asset: Asset = {
      _id: Date.now().toString(),
      symbol: newAsset.symbol.toUpperCase(),
      name: newAsset.name,
      type: newAsset.type,
      quantity: shares,
      avgBuyPrice: avgPrice,
      currentPrice,
      currentValue,
      change,
      changePercent,
      allocation: 0,
    };

    const newAssets = [...assets, asset];
    const newTotalValue = newAssets.reduce((sum, a) => sum + a.currentValue, 0);

    const updatedAssets = newAssets.map((a) => ({
      ...a,
      allocation: (a.value / newTotalValue) * 100,
    }));

    setAssets(updatedAssets);
    setNewAsset({
      symbol: "",
      name: "",
      type: "stock",
      shares: "",
      avgBuyPrice: "",
      currentPrice: "",
    });
    setIsAddDialogOpen(false);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setIsEditDialogOpen(true);
  };

  const handleDeleteAsset = (id: string) => {
    const updatedAssets = assets.filter((a) => a._id !== id);
    const newTotalValue = updatedAssets.reduce(
      (sum, a) => sum + a.currentValue,
      0,
    );

    const finalAssets = updatedAssets.map((a) => ({
      ...a,
      allocation:
        newTotalValue > 0 ? (a.currentValue / newTotalValue) * 100 : 0,
    }));

    setAssets(finalAssets);
  };

  // For demonstration only, can be removed if not used elsewhere
  console.log(`Editing portfolio ${portfolioId}`);

  // Helper function to map API asset to our Asset type
  const mapApiAssetToAsset = (a: any, portfolioValue: number) => ({
    ...a,
    currentValue: a.currentPrice * (a.quantity || 1),
    avgBuyPrice: a.avgBuyPrice || 0,
    change: a.currentPrice
      ? (a.currentPrice - (a.avgBuyPrice || 0)) * (a.quantity || 1)
      : 0,
    changePercent: a.avgBuyPrice
      ? (((a.currentPrice || 0) - a.avgBuyPrice) / a.avgBuyPrice) * 100
      : 0,
    allocation: portfolioValue
      ? ((a.currentPrice * (a.quantity || 1)) / portfolioValue) * 100
      : 0,
  });

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
            <Button variant="outline" onClick={() => setIsGoalDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Portfolio
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Asset
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Asset</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="symbol">Symbol</Label>
                    <Input
                      id="symbol"
                      value={newAsset.symbol}
                      onChange={(e) =>
                        setNewAsset({ ...newAsset, symbol: e.target.value })
                      }
                      placeholder="e.g., AAPL, MSFT"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newAsset.name}
                      onChange={(e) =>
                        setNewAsset({ ...newAsset, name: e.target.value })
                      }
                      placeholder="e.g., Apple Inc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Asset Type</Label>
                    <Select
                      value={newAsset.type}
                      onValueChange={(value: Asset["type"]) =>
                        setNewAsset({ ...newAsset, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stock">Stock</SelectItem>
                        <SelectItem value="bond">Bond</SelectItem>
                        <SelectItem value="commodity">Commodity</SelectItem>
                        <SelectItem value="real estate">
                          Real Estate/Property
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="shares">Shares/Quantity</Label>
                    <Input
                      id="shares"
                      type="number"
                      value={newAsset.shares}
                      onChange={(e) =>
                        setNewAsset({ ...newAsset, shares: e.target.value })
                      }
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="avgPrice">Average Buy Price</Label>
                    <Input
                      id="avgPrice"
                      type="number"
                      step="0.01"
                      value={newAsset.avgBuyPrice}
                      onChange={(e) =>
                        setNewAsset({
                          ...newAsset,
                          avgBuyPrice: e.target.value,
                        })
                      }
                      placeholder="150.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currentPrice">Current Price</Label>
                    <Input
                      id="currentPrice"
                      type="number"
                      step="0.01"
                      value={newAsset.currentPrice}
                      onChange={(e) =>
                        setNewAsset({
                          ...newAsset,
                          currentPrice: e.target.value,
                        })
                      }
                      placeholder="155.00"
                    />
                  </div>
                  <Button onClick={handleAddAsset} className="w-full">
                    Add Asset
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
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
            title="Stocks"
            assets={stockAssets}
            onEdit={handleEditAsset}
            onDelete={handleDeleteAsset}
          />
          <AssetSection
            title="Cryptocurrencies"
            assets={cryptoAssets}
            onEdit={handleEditAsset}
            onDelete={handleDeleteAsset}
          />
          <AssetSection
            title="Real Estate & Properties"
            assets={propertyAssets}
            onEdit={handleEditAsset}
            onDelete={handleDeleteAsset}
          />
          <AssetSection
            title="Commodities"
            assets={commodityAssets}
            onEdit={handleEditAsset}
            onDelete={handleDeleteAsset}
          />
          <AssetSection
            title="Bonds"
            assets={bondAssets}
            onEdit={handleEditAsset}
            onDelete={handleDeleteAsset}
          />
          <AssetSection
            title="Cash"
            assets={cashAssets}
            onEdit={handleEditAsset}
            onDelete={handleDeleteAsset}
          />
          <AssetSection
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
