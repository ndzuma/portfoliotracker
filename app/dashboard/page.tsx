"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Briefcase,
  Loader2,
  MoreHorizontal,
  Edit,
  Trash2,
  Sparkles,
  Calendar,
} from "lucide-react";
import Link from "next/link";

interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  value: number;
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
  assets?: Asset[];
}

interface Benchmark {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

function BenchmarkCard({ benchmark }: { benchmark: Benchmark }) {
  const isPositive = benchmark.change >= 0;

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-foreground">{benchmark.name}</h3>
          <p className="text-2xl font-semibold text-foreground mt-1">
            {benchmark.value.toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <div
            className={`flex items-center gap-1 ${isPositive ? "text-primary" : "text-secondary"}`}
          >
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="font-medium">
              {isPositive ? "+" : ""}
              {benchmark.change.toFixed(2)}
            </span>
          </div>
          <div
            className={`text-sm ${isPositive ? "text-primary" : "text-secondary"}`}
          >
            ({isPositive ? "+" : ""}
            {benchmark.changePercent.toFixed(2)}%)
          </div>
        </div>
      </div>
    </Card>
  );
}

function MarketNewsCard({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
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

function AllocationCard({}) {
  return (
    <Card className="p-6 bg-card border-border h-full">
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium text-foreground">Allocation</h3>
        </div>

      </div>
    </Card>
  );
}

function PortfolioRow({
  portfolio,
  onEdit,
  onDelete,
}: {
  portfolio: Portfolio;
  onEdit: (portfolio: Portfolio) => void;
  onDelete: (portfolioId: string) => void;
}) {
  const isPositive = portfolio.change >= 0;

  return (
    <div className="flex items-center gap-4 py-3 px-4 hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <Link href={`/dashboard/portfolio/${portfolio.id}`} className="block">
          <h3 className="font-medium text-foreground hover:text-primary transition-colors">
            {portfolio.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {portfolio.description}
          </p>
        </Link>
      </div>

      <div className="flex items-center gap-2 min-w-0">
        {isPositive ? (
          <TrendingUp className="h-4 w-4 text-primary" />
        ) : (
          <TrendingDown className="h-4 w-4 text-secondary" />
        )}
        <div className="text-right">
          <div
            className={`font-medium ${isPositive ? "text-primary" : "text-secondary"}`}
          >
            ${Math.abs(portfolio.change).toLocaleString()} (
            {isPositive ? "+" : ""}
            {portfolio.changePercent.toFixed(2)}%)
          </div>
        </div>
      </div>

      <div className="text-right min-w-[100px]">
        <div className="font-semibold">${portfolio.value.toLocaleString()}</div>
      </div>

      <div className="text-center min-w-[80px]">
        <div className="text-muted-foreground">{portfolio.modified}</div>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(portfolio)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Portfolio
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(portfolio.id)}
              className="text-secondary focus:text-secondary"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Portfolio
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default function PortfoliosDashboard() {
  const [selectedPortfolios, setSelectedPortfolios] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(
    null,
  );
  const [portfolios, setPortfolios] = useState<{ personal: Portfolio[] }>({
    personal: [],
  });
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPortfolio, setNewPortfolio] = useState({
    name: "",
    description: "",
    type: "personal",
    initialInvestment: "",
  });
  const [newAsset, setNewAsset] = useState({
    symbol: "",
    quantity: "",
    avgBuyPrice: "",
    portfolioId: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [portfoliosResponse, benchmarksResponse] = await Promise.all([
          fetch("/api/portfolios"),
          fetch("/api/benchmarks"),
        ]);

        const portfoliosData = await portfoliosResponse.json();
        const benchmarksData = await benchmarksResponse.json();

        setPortfolios(portfoliosData);
        setBenchmarks(benchmarksData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalValue = portfolios.personal.reduce(
    (sum, portfolio) => sum + portfolio.value,
    0,
  );
  const totalChange = portfolios.personal.reduce(
    (sum, portfolio) => sum + portfolio.change,
    0,
  );
  const totalChangePercent =
    totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0;

  const handleCreatePortfolio = () => {
    console.log("Creating portfolio:", newPortfolio);
    setNewPortfolio({
      name: "",
      description: "",
      type: "personal",
      initialInvestment: "",
    });
    setIsCreateModalOpen(false);
  };

  const handleAddAsset = () => {
    console.log("Adding asset:", newAsset);
    setNewAsset({
      symbol: "",
      quantity: "",
      avgBuyPrice: "",
      portfolioId: "",
    });
    setIsAddAssetModalOpen(false);
  };

  const handleEditPortfolio = (portfolio: Portfolio) => {
    setEditingPortfolio(portfolio);
    setNewPortfolio({
      name: portfolio.name,
      description: portfolio.description,
      type: "personal",
      initialInvestment: portfolio.value.toString(),
    });
    setIsEditModalOpen(true);
  };

  const handleDeletePortfolio = (portfolioId: string) => {
    if (confirm("Are you sure you want to delete this portfolio?")) {
      setPortfolios((prev) => ({
        ...prev,
        personal: prev.personal.filter((p) => p.id !== portfolioId),
      }));
    }
  };

  const handleUpdatePortfolio = () => {
    if (!editingPortfolio) return;

    setPortfolios((prev) => ({
      ...prev,
      personal: prev.personal.map((p) =>
        p.id === editingPortfolio.id
          ? {
              ...p,
              name: newPortfolio.name,
              description: newPortfolio.description,
            }
          : p,
      ),
    }));

    setIsEditModalOpen(false);
    setEditingPortfolio(null);
    setNewPortfolio({
      name: "",
      description: "",
      type: "personal",
      initialInvestment: "",
    });
  };

  const getYahooFinanceUrl = (symbol: string, type: string) => {
    if (type === "real estate") return "#";
    return `https://finance.yahoo.com/quote/${symbol}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-foreground">Portfolios</h1>
          <div className="flex gap-3">
            <Dialog
              open={isAddAssetModalOpen}
              onOpenChange={setIsAddAssetModalOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Assets
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Asset</DialogTitle>
                  <DialogDescription>
                    Add a new asset to one of your portfolios.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="portfolio">Portfolio</Label>
                    <Select
                      value={newAsset.portfolioId}
                      onValueChange={(value) =>
                        setNewAsset({ ...newAsset, portfolioId: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select portfolio" />
                      </SelectTrigger>
                      <SelectContent>
                        {portfolios.personal.map((portfolio) => (
                          <SelectItem key={portfolio.id} value={portfolio.id}>
                            {portfolio.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="symbol">Symbol</Label>
                    <Input
                      id="symbol"
                      placeholder="e.g., AAPL"
                      value={newAsset.symbol}
                      onChange={(e) =>
                        setNewAsset({
                          ...newAsset,
                          symbol: e.target.value.toUpperCase(),
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="Number of shares"
                      value={newAsset.quantity}
                      onChange={(e) =>
                        setNewAsset({ ...newAsset, quantity: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="avgPrice">Average Buy Price</Label>
                    <Input
                      id="avgPrice"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newAsset.avgBuyPrice}
                      onChange={(e) =>
                        setNewAsset({
                          ...newAsset,
                          avgBuyPrice: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddAssetModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddAsset}
                    disabled={
                      !newAsset.symbol ||
                      !newAsset.quantity ||
                      !newAsset.avgBuyPrice ||
                      !newAsset.portfolioId
                    }
                  >
                    Add Asset
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isCreateModalOpen}
              onOpenChange={setIsCreateModalOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-foreground text-background hover:bg-foreground/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create portfolio
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Portfolio</DialogTitle>
                  <DialogDescription>
                    Set up a new portfolio to track your investments. You can
                    add assets after creation.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Portfolio Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., My Growth Portfolio"
                      value={newPortfolio.name}
                      onChange={(e) =>
                        setNewPortfolio({
                          ...newPortfolio,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of your investment strategy..."
                      value={newPortfolio.description}
                      onChange={(e) =>
                        setNewPortfolio({
                          ...newPortfolio,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Portfolio Type</Label>
                    <Select
                      value={newPortfolio.type}
                      onValueChange={(value) =>
                        setNewPortfolio({ ...newPortfolio, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select portfolio type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">
                          Personal Investment
                        </SelectItem>
                        <SelectItem value="retirement">
                          Retirement Fund
                        </SelectItem>
                        <SelectItem value="education">
                          Education Savings
                        </SelectItem>
                        <SelectItem value="emergency">
                          Emergency Fund
                        </SelectItem>
                        <SelectItem value="speculative">
                          Speculative Trading
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="initial">
                      Initial Investment (Optional)
                    </Label>
                    <Input
                      id="initial"
                      type="number"
                      placeholder="0.00"
                      value={newPortfolio.initialInvestment}
                      onChange={(e) =>
                        setNewPortfolio({
                          ...newPortfolio,
                          initialInvestment: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreatePortfolio}
                    disabled={!newPortfolio.name.trim()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Create Portfolio
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Portfolio</DialogTitle>
                  <DialogDescription>
                    Update your portfolio information.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">Portfolio Name</Label>
                    <Input
                      id="edit-name"
                      value={newPortfolio.name}
                      onChange={(e) =>
                        setNewPortfolio({
                          ...newPortfolio,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={newPortfolio.description}
                      onChange={(e) =>
                        setNewPortfolio({
                          ...newPortfolio,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpdatePortfolio}>
                    Update Portfolio
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <Card className="p-6 bg-card border-border h-full">
              <div className="flex items-center justify-between h-full">
                <div>
                  <h2 className="text-lg font-medium text-muted-foreground mb-2">
                    Total Portfolio Value
                  </h2>
                  <p className="text-4xl font-bold text-foreground">
                    ${totalValue.toLocaleString()}
                  </p>
                  <div
                    className={`flex items-center gap-2 text-lg font-medium mt-2 ${
                      totalChange >= 0 ? "text-primary" : "text-secondary"
                    }`}
                  >
                    {totalChange >= 0 ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                    <span>
                      {totalChange >= 0 ? "+" : ""}$
                      {Math.abs(totalChange).toLocaleString()} (
                      {totalChange >= 0 ? "+" : ""}
                      {totalChangePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          <div>
            <MarketNewsCard
              title="Market Summary"
              content="Stocks rallied today as investors reacted positively to economic data indicating a steady recovery. The S&P 500 closed up 1.2%, led by gains in the technology and consumer discretionary sectors. Analysts remain cautiously optimistic about the market outlook amid ongoing geopolitical tensions and inflation concerns."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:col-span-2">
            {benchmarks.map((benchmark) => (
              <BenchmarkCard key={benchmark.name} benchmark={benchmark} />
            ))}
          </div>
          <MarketNewsCard
            title="Market Summary"
            content="Stocks rallied today as investors reacted positively to economic data indicating a steady recovery. The S&P 500 closed up 1.2%, led by gains in the technology and consumer discretionary sectors."
          />
        </div>

        {/* My Portfolios Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-medium text-foreground">
              My Portfolios ({portfolios.personal.length})
            </h2>
          </div>

          <Card className="bg-card border-border">
            <div className="flex items-center gap-4 py-3 px-4 border-b border-border bg-muted/30">
              <div className="flex-1 font-medium text-foreground">Name</div>
              <div className="min-w-[120px] text-center font-medium text-foreground">
                Valuation
              </div>
              <div className="min-w-[100px] text-center font-medium text-foreground">
                Value
              </div>
              <div className="min-w-[80px] text-center font-medium text-foreground">
                Modified
              </div>
              <div className="w-20"></div>
            </div>

            {portfolios.personal.map((portfolio) => (
              <PortfolioRow
                key={portfolio.id}
                portfolio={portfolio}
                onEdit={handleEditPortfolio}
                onDelete={handleDeletePortfolio}
              />
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
