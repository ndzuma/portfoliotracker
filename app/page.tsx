"use client";

import { useState } from "react";
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
  Plus,
  TrendingUp,
  TrendingDown,
  Briefcase,
  MoreHorizontal,
  Edit,
  Trash2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { ChartRadialStacked } from "@/components/allocationRadial";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { formatCurrency, convertFromUSD } from "@/lib/currency";

interface Portfolio {
  _id: string;
  name: string;
  description: string;
  currentValue: number;
  change: number;
  changePercent: number;
  assetsCount: number;
}

interface Benchmark {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

function BenchmarkCard({ benchmark }: { benchmark }) {
  const isPositive = benchmark.percentageChange >= 0;
  const change = benchmark.close * (benchmark.percentageChange / 100);

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-foreground">{benchmark.name}</h3>
          <p className="text-2xl font-semibold text-foreground mt-1">
            {benchmark.close.toLocaleString()}
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
              {change.toFixed(2)}
            </span>
          </div>
          <div
            className={`text-sm ${isPositive ? "text-primary" : "text-secondary"}`}
          >
            ({isPositive ? "+" : ""}
            {benchmark.percentageChange.toFixed(2)}%)
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
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <Card className="p-6 bg-[radial-gradient(circle_at_top_left,_#8d745d_0%,_transparent_30%)] border-[#8d745d] h-full relative">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium text-foreground">{title}</h3>
          </div>
          <p className="text-sm font-medium mb-2 text-primary">
            Daily Market Insight
          </p>
          <div
            className="text-sm text-muted-foreground leading-relaxed flex-1 overflow-hidden"
            style={{
              maxHeight: "60px",
              position: "relative",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 60%, transparent 100%)",
            }}
          >
            <p>{content}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(true)}
            className="mt-2 opacity-70 hover:opacity-100 transition-opacity self-start flex items-center"
          >
            Expand
          </Button>
        </div>
      </Card>

      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <p className="text-primary mt-2">Daily Market Insight</p>
          </DialogHeader>
          <div className="mt-4 text-muted-foreground">{content}</div>
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground italic">
              <span className="font-semibold">AI Risk Warning:</span> This
              AI-generated market summary is for informational purposes only and
              should not be considered financial advice. Always consult with a
              qualified financial advisor before making investment decisions.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PortfolioRow({
  portfolio,
  onEdit,
  onDelete,
  userCurrency = "USD",
  fxRate = 1,
}: {
  portfolio: Portfolio;
  onEdit: (portfolio: Portfolio) => void;
  onDelete: (portfolioId: string) => void;
  userCurrency?: string;
  fxRate?: number;
}) {
  const isPositive = portfolio.change >= 0;

  // Helper function to convert USD values to user's currency
  const convertValue = (usdValue: number) => {
    return convertFromUSD(usdValue, userCurrency, fxRate);
  };

  return (
    <div className="flex items-center gap-4 py-3 px-4 hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <Link href={`/portfolio/${portfolio._id}`} className="block">
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
            {formatCurrency(Math.abs(convertValue(portfolio.change)), userCurrency)} (
            {isPositive ? "+" : ""}
            {portfolio.changePercent.toFixed(2)}%)
          </div>
        </div>
      </div>

      <div className="text-right min-w-[100px]">
        <div className="font-semibold">
          {formatCurrency(convertValue(portfolio.currentValue), userCurrency)}
        </div>
      </div>

      <div className="text-center min-w-[80px]">
        <div className="text-muted-foreground">{portfolio.assetsCount}</div>
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
              onClick={() => onDelete(portfolio._id)}
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newPortfolio, setNewPortfolio] = useState({
    name: "",
    description: "",
  });

  // convex operations
  const { user } = useUser();
  const convexUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id,
  });
  const userId = convexUser?._id;
  const userPreferences = useQuery(api.users.getUserPreferences, {
    userId: userId,
  });
  const usersName = user?.fullName;
  const userPortfolios =
    useQuery(api.portfolios.getUserPorfolios, { userId }) || [];
  const benchmarkData = useQuery(api.marketData.getBenchmarkData) || [];
  
  // Get user's preferred currency and FX rate for conversion
  const userCurrency = userPreferences?.currency || "USD";
  const fxRate = useQuery(api.fx.getLatestFxRate, {
    baseCurrency: "USD",
    targetCurrency: userCurrency,
  }) || 1;

  // Helper function to convert USD values to user's currency
  const convertValue = (usdValue: number) => {
    return convertFromUSD(usdValue, userCurrency, fxRate);
  };
  
  const createPortfolio = useMutation(api.portfolios.createPortfolio);
  const editPortfolio = useMutation(api.portfolios.updatePortfolio);
  const deletePortfolio = useMutation(api.portfolios.deletePortfolio);

  const totalValue = userPortfolios.reduce(
    (sum, portfolio) => sum + portfolio.currentValue,
    0,
  );
  const totalChange = userPortfolios.reduce(
    (sum, portfolio) => sum + portfolio.change,
    0,
  );
  const totalChangePercent =
    totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0;

  const handleCreatePortfolio = () => {
    if (userId) {
      createPortfolio({
        userId: userId,
        name: newPortfolio.name,
        description: newPortfolio.description,
      });
      setNewPortfolio({
        name: "",
        description: "",
      });
      setIsCreateModalOpen(false);
    }
  };

  const handleEditPortfolio = (portfolio: Portfolio) => {
    setNewPortfolio({
      id: portfolio._id,
      name: portfolio.name,
      description: portfolio.description,
    });
    setIsEditModalOpen(true);
  };

  const handleDeletePortfolio = (portfolioId: string) => {
    if (userId) {
      deletePortfolio({ portfolioId: portfolioId, userId: userId });
    }
  };

  const handleUpdatePortfolio = () => {
    if (userId) {
      editPortfolio({
        portfolioId: newPortfolio.id,
        userId: userId,
        name: newPortfolio.name,
        description: newPortfolio.description,
      });
      setIsEditModalOpen(false);
      setNewPortfolio({
        name: "",
        description: "",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-foreground">
            Hello, {usersName}
          </h1>
          <div className="flex gap-3">
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
                    Net Worth
                  </h2>
                  <p className="text-4xl font-bold text-foreground">
                    {formatCurrency(convertValue(totalValue), userCurrency)}
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
                      {totalChange >= 0 ? "+" : ""}
                      {formatCurrency(Math.abs(convertValue(totalChange)), userCurrency)} (
                      {totalChange >= 0 ? "+" : ""}
                      {totalChangePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          <div>
            <ChartRadialStacked Weightings={userPortfolios} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:col-span-2">
            {benchmarkData.length > 0 ? (
              benchmarkData.map((benchmark) => (
                <BenchmarkCard key={benchmark.ticker} benchmark={benchmark} />
              ))
            ) : (
              <div className="flex justify-center items-center col-span-2 py-8">
                <p className="text-muted-foreground">
                  No benchmark data found.
                </p>
              </div>
            )}
          </div>
          <MarketNewsCard
            title="AI Market Summary"
            content="Stocks rallied today as investors reacted positively to economic data indicating a steady recovery. The S&P 500 closed up 1.2%, led by gains in the technology and consumer discretionary sectors. Trading volumes were higher than average, suggesting strong conviction in this upward movement. Key resistance levels were broken, potentially indicating further upside in the coming sessions."
          />
        </div>

        {/* My Portfolios Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-medium text-foreground">
              My Portfolios ({userPortfolios.length})
            </h2>
          </div>

          <Card className="bg-card border-border gap-0 py-0">
            <div className="flex items-center gap-4 py-3 px-4 border-b border-border bg-muted/30">
              <div className="flex-1 font-medium text-foreground">Name</div>
              <div className="min-w-[120px] text-center font-medium text-foreground">
                Change
              </div>
              <div className="min-w-[80px] text-center font-medium text-foreground">
                Value
              </div>
              <div className="min-w-[80px] text-center font-medium text-foreground">
                Assets
              </div>
              <div className="w-10"></div>
            </div>

            {userPortfolios.length > 0 ? (
              userPortfolios.map((portfolio) => (
                <PortfolioRow
                  key={portfolio._id}
                  portfolio={portfolio}
                  onEdit={handleEditPortfolio}
                  onDelete={handleDeletePortfolio}
                  userCurrency={userCurrency}
                  fxRate={fxRate}
                />
              ))
            ) : (
              <div className="flex justify-center items-center py-8">
                <p className="text-muted-foreground">
                  No portfolios found. Create one to get started.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
