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
import { use } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect } from "react";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Plus,
  MoreHorizontal,
  ExternalLink,
  Edit,
  Trash2,
  Calendar,
  Target,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: "stock" | "property" | "commodity" | "bond";
  value: number;
  change: number;
  changePercent: number;
  allocation: number;
  shares?: number;
  avgBuyPrice: number;
  currentPrice: number;
}

interface ChartConfig {
  value: { label: string; color: string };
  name: { label: string; color: string };
}

interface Portfolio {
  id: string;
  name: string;
  description: string;
  value: number;
  change: number;
  changePercent: number;
  stocks: number;
  modified: string;
  assets: any[]; // Using any[] to accommodate API response format
}

const mockAssets: Asset[] = [
  {
    id: "1",
    symbol: "AAPL",
    name: "Apple Inc.",
    type: "stock",
    value: 8500.0,
    change: 250.0,
    changePercent: 3.03,
    allocation: 31.5,
    shares: 50,
    avgBuyPrice: 165.0,
    currentPrice: 170.0,
  },
  {
    id: "2",
    symbol: "MSFT",
    name: "Microsoft Corporation",
    type: "stock",
    value: 6200.0,
    change: -120.0,
    changePercent: -1.9,
    allocation: 23.0,
    shares: 25,
    avgBuyPrice: 252.0,
    currentPrice: 248.0,
  },
  {
    id: "3",
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    type: "stock",
    value: 4800.0,
    change: 180.0,
    changePercent: 3.9,
    allocation: 17.8,
    shares: 20,
    avgBuyPrice: 235.0,
    currentPrice: 240.0,
  },
  {
    id: "4",
    symbol: "REIT-1",
    name: "Real Estate Investment Trust",
    type: "property",
    value: 3200.0,
    change: 45.0,
    changePercent: 1.43,
    allocation: 11.9,
    shares: 100,
    avgBuyPrice: 31.55,
    currentPrice: 32.0,
  },
  {
    id: "5",
    symbol: "GOLD",
    name: "Gold Commodity Fund",
    type: "commodity",
    value: 2800.0,
    change: -85.0,
    changePercent: -2.95,
    allocation: 10.4,
    shares: 150,
    avgBuyPrice: 19.23,
    currentPrice: 18.67,
  },
  {
    id: "6",
    symbol: "BOND-1",
    name: "Government Bond Fund",
    type: "bond",
    value: 1450.0,
    change: 12.0,
    changePercent: 0.83,
    allocation: 5.4,
    shares: 75,
    avgBuyPrice: 19.17,
    currentPrice: 19.33,
  },
];

const performanceData = [
  { month: "Jan", value: 24500 },
  { month: "Feb", value: 25200 },
  { month: "Mar", value: 24800 },
  { month: "Apr", value: 26100 },
  { month: "May", value: 25900 },
  { month: "Jun", value: 26950 },
];

const allocationData = mockAssets.map((asset) => ({
  name: asset.symbol,
  value: asset.allocation,
  fill:
    asset.type === "stock"
      ? "#4caf50"
      : asset.type === "property"
        ? "#2196f3"
        : asset.type === "commodity"
          ? "#ffc107"
          : "#9c27b0",
}));

const chartConfig = {
  value: {
    label: "Portfolio Value ($)",
    color: "hsl(var(--chart-1))",
  },
  name: {
    label: "Asset",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

function AISummaryCard({ title, content }: { title: string; content: string }) {
  return (
    <Card className="p-6 bg-card border-border h-full">
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium text-foreground">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed flex-1">
          {content}
        </p>
      </div>
    </Card>
  );
}

function AssetRow({
  asset,
  onEdit,
  onDelete,
}: {
  asset: Asset;
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
}) {
  const isPositive = asset.change >= 0;

  const getYahooFinanceLink = (symbol: string, type: string) => {
    if (type === "property") return null;
    return `https://finance.yahoo.com/quote/${symbol}`;
  };

  const yahooLink = getYahooFinanceLink(asset.symbol, asset.type);

  return (
    <div className="flex items-center gap-4 py-4 px-6 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{asset.symbol}</h3>
              {yahooLink && (
                <a
                  href={yahooLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{asset.name}</p>
          </div>
        </div>
      </div>

      <div className="text-right min-w-[100px]">
        <div className="font-semibold">${asset.value.toLocaleString()}</div>
        <div className="text-sm text-muted-foreground">
          {asset.shares} shares
        </div>
      </div>

      <div className="text-right min-w-[100px]">
        <div className="font-medium">${asset.avgBuyPrice.toFixed(2)}</div>
        <div className="text-sm text-muted-foreground">Avg Buy</div>
      </div>

      <div className="text-right min-w-[100px]">
        <div className="font-medium">${asset.currentPrice.toFixed(2)}</div>
        <div className="text-sm text-muted-foreground">Current</div>
      </div>

      <div className="text-right min-w-[120px]">
        <div
          className={`font-medium ${isPositive ? "text-primary" : "text-secondary"}`}
        >
          {isPositive ? "+" : ""}${Math.abs(asset.change).toLocaleString()}
        </div>
        <div
          className={`text-sm ${isPositive ? "text-primary" : "text-secondary"}`}
        >
          ({isPositive ? "+" : ""}
          {asset.changePercent.toFixed(2)}%)
        </div>
      </div>

      <div className="text-right min-w-[80px]">
        <div className="font-medium">{asset.allocation.toFixed(1)}%</div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(asset)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Asset
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(asset.id)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Asset
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function AssetSection({
  title,
  assets,
  onEdit,
  onDelete,
}: {
  title: string;
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
}) {
  if (assets.length === 0) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>
          {title} ({assets.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex items-center gap-4 py-3 px-6 border-b border-border bg-muted/30">
          <div className="flex-1 font-medium text-foreground">Asset</div>
          <div className="min-w-[100px] text-right font-medium text-foreground">
            Value
          </div>
          <div className="min-w-[100px] text-right font-medium text-foreground">
            Avg Buy
          </div>
          <div className="min-w-[100px] text-right font-medium text-foreground">
            Current
          </div>
          <div className="min-w-[120px] text-right font-medium text-foreground">
            Change
          </div>
          <div className="min-w-[80px] text-right font-medium text-foreground">
            Allocation
          </div>
          <div className="w-10"></div>
        </div>

        {assets.map((asset) => (
          <AssetRow
            key={asset.id}
            asset={asset}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </CardContent>
    </Card>
  );
}

export default function PortfolioDetail({
  params,
}: {
  params: { id: string };
}) {
  // Properly unwrap params using React.use()
  const unwrappedParams = use(params);
  const portfolioId = unwrappedParams.id;
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [portfolioGoal, setPortfolioGoal] = useState(
    "Achieve 15% annual returns through diversified growth investments",
  );
  const [tempGoal, setTempGoal] = useState(portfolioGoal);
  const [newAsset, setNewAsset] = useState({
    symbol: "",
    name: "",
    type: "stock" as Asset["type"],
    shares: "",
    avgBuyPrice: "",
    currentPrice: "",
  });
  const [loading, setLoading] = useState(true);

  // Fetch portfolio data
  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const response = await fetch("/api/portfolios");
        const data = await response.json();

        // Find the portfolio with matching ID
        const foundPortfolio = data.personal.find(
          (p: Portfolio) => p.id === portfolioId,
        );

        if (foundPortfolio) {
          setPortfolio(foundPortfolio);

          // Transform API assets to match our component's Asset interface
          const transformedAssets = foundPortfolio.assets.map((asset: any) => ({
            ...asset,
            shares: asset.quantity,
            type: mapAssetType(asset.type),
            // Calculate derived values if not present
            change:
              asset.change ||
              (asset.currentPrice - asset.avgBuyPrice) * asset.quantity,
            changePercent:
              asset.changePercent ||
              ((asset.currentPrice - asset.avgBuyPrice) / asset.avgBuyPrice) *
                100,
            allocation:
              asset.allocation || (asset.value / foundPortfolio.value) * 100,
          }));

          setAssets(transformedAssets);
        }
      } catch (error) {
        console.error("Failed to fetch portfolio data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPortfolio();
  }, [portfolioId]);

  // Map API asset types to our component types
  const mapAssetType = (type: string): Asset["type"] => {
    const typeMap: Record<string, Asset["type"]> = {
      stocks: "stock",
      bonds: "bond",
      commodities: "commodity",
      "real estate": "property",
    };
    return typeMap[type] || (type as Asset["type"]);
  };

  const totalValue =
    portfolio?.value || assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalChange =
    portfolio?.change ||
    assets.reduce((sum, asset) => sum + (asset.change || 0), 0);
  const totalChangePercent =
    portfolio?.changePercent ||
    (totalChange / (totalValue - totalChange)) * 100;

  const stockAssets = assets.filter((asset) => asset.type === "stock");
  const propertyAssets = assets.filter((asset) => asset.type === "property");
  const commodityAssets = assets.filter((asset) => asset.type === "commodity");
  const bondAssets = assets.filter((asset) => asset.type === "bond");

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

    const value = shares * currentPrice;
    const change = shares * (currentPrice - avgPrice);
    const changePercent = ((currentPrice - avgPrice) / avgPrice) * 100;

    const asset: Asset = {
      id: Date.now().toString(),
      symbol: newAsset.symbol.toUpperCase(),
      name: newAsset.name,
      type: newAsset.type,
      shares,
      avgBuyPrice: avgPrice,
      currentPrice,
      value,
      change,
      changePercent,
      allocation: 0,
    };

    const newAssets = [...assets, asset];
    const newTotalValue = newAssets.reduce((sum, a) => sum + a.value, 0);

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
    const updatedAssets = assets.filter((a) => a.id !== id);
    const newTotalValue = updatedAssets.reduce((sum, a) => sum + a.value, 0);

    const finalAssets = updatedAssets.map((a) => ({
      ...a,
      allocation: newTotalValue > 0 ? (a.value / newTotalValue) * 100 : 0,
    }));

    setAssets(finalAssets);
  };

  // For demonstration only, can be removed if not used elsewhere
  console.log(`Editing portfolio ${portfolioId}`);

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
                        <SelectItem value="property">
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
                ${loading ? "..." : totalValue.toLocaleString()}
              </div>
              <div
                className={`text-sm flex items-center gap-2 mt-2 ${totalChange >= 0 ? "text-primary" : "text-secondary"}`}
              >
                {totalChange >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {totalChange >= 0 ? "+" : ""}$
                {loading ? "..." : Math.abs(totalChange).toLocaleString()} (
                {totalChange >= 0 ? "+" : ""}
                {loading ? "..." : totalChangePercent.toFixed(2)}%)
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Assets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : assets.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Different holdings
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={performanceData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis
                      dataKey="month"
                      className="text-xs fill-muted-foreground"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      className="text-xs fill-muted-foreground"
                      tick={{ fontSize: 12 }}
                    />

                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={{
                        fill: "hsl(var(--chart-1))",
                        strokeWidth: 2,
                        r: 4,
                      }}
                      activeDot={{
                        r: 6,
                        stroke: "hsl(var(--chart-1))",
                        strokeWidth: 2,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <Pie
                      data={assets.map((asset) => ({
                        name: asset.symbol,
                        value:
                          asset.allocation || (asset.value / totalValue) * 100,
                        fill:
                          asset.type === "stock"
                            ? "#4caf50"
                            : asset.type === "property"
                              ? "#2196f3"
                              : asset.type === "commodity"
                                ? "#ffc107"
                                : "#9c27b0",
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value }) =>
                        `${name} ${value?.toFixed(1)}%`
                      }
                      labelLine={false}
                    >
                      {allocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
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
        </div>
      </div>
    </div>
  );
}
