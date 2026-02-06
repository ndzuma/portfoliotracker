"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Newspaper,
  Settings,
  BookmarkIcon,
  BinocularsIcon,
  CalendarDaysIcon,
  Plus,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Edit,
  Trash2,
  Sparkles,
  LayoutDashboard,
  ArrowRight,
  Wallet,
  BarChart3,
  Globe,
} from "lucide-react";
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
import { UserButton, useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { dark } from "@clerk/themes";
import { isFeatureEnabled } from "@/lib/featureFlags";
import { parseMarkdown, cleanMarkdownWrapper } from "@/lib/markdown-parser";
import { ChartRadialStacked } from "@/components/allocationRadial";
import Image from "next/image";

/* ─── Floating Dock Sidebar ─── */
function DockSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "News", href: "/news", icon: Newspaper },
    ...(isFeatureEnabled("watchlist")
      ? [{ name: "Watchlist", href: "/watchlist", icon: BookmarkIcon }]
      : []),
    ...(isFeatureEnabled("research")
      ? [{ name: "Research", href: "/research", icon: BinocularsIcon }]
      : []),
    ...(isFeatureEnabled("earningsCalendar")
      ? [{ name: "Earnings", href: "/earnings", icon: CalendarDaysIcon }]
      : []),
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="fixed left-4 top-14 bottom-4 z-40 flex w-60 flex-col rounded-2xl border border-border/50 bg-card/70 backdrop-blur-xl shadow-xl shadow-black/20">
      {/* Brand */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center border border-primary/20">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">PulsePortfolio</p>
            <p className="text-[10px] text-muted-foreground">Wealth Tracker</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2">
        <div className="flex flex-col gap-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground font-medium shadow-sm shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Quick stats in sidebar */}
      <div className="mx-3 mb-3 p-3 rounded-xl bg-muted/30 border border-border/30">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="h-3 w-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
            Quick Stats
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[10px] text-muted-foreground">Portfolios</p>
            <p className="text-xs font-bold text-foreground" id="dock-portfolios">
              --
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Assets</p>
            <p className="text-xs font-bold text-foreground" id="dock-assets">
              --
            </p>
          </div>
        </div>
      </div>

      {/* User */}
      <div className="px-4 py-3 border-t border-border/30 rounded-b-2xl">
        <div className="flex items-center gap-3">
          <UserButton
            appearance={{
              elements: { userButtonAvatarBox: "w-9 h-9" },
              baseTheme: dark,
            }}
            afterSignOutUrl="/"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">
              {user?.fullName}
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {user?.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ─── Main Page: Card Deck ─── */
export default function Redesign4() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [expandedAI, setExpandedAI] = useState(false);
  const [newPortfolio, setNewPortfolio] = useState<{
    id?: string;
    name: string;
    description: string;
  }>({ name: "", description: "" });

  const { user } = useUser();
  const convexUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id ?? "",
  });
  const userId = convexUser?._id;
  const usersName = user?.firstName || user?.fullName;
  const userPortfolios =
    useQuery(api.portfolios.getUserPorfolios, userId ? { userId } : "skip") ||
    [];
  const aiSummaryData = useQuery(api.ai.getAiNewsSummary) || null;
  const benchmarkData = useQuery(api.marketData.getBenchmarkData) || [];
  const createPortfolio = useMutation(api.portfolios.createPortfolio);
  const editPortfolio = useMutation(api.portfolios.updatePortfolio);
  const deletePortfolio = useMutation(api.portfolios.deletePortfolio);

  const totalValue = userPortfolios.reduce(
    (sum, p) => sum + p.currentValue,
    0
  );
  const totalChange = userPortfolios.reduce((sum, p) => sum + p.change, 0);
  const totalCost = totalValue - totalChange;
  const totalChangePercent = totalCost > 0 ? (totalChange / totalCost) * 100 : 0;

  // Update sidebar stats via DOM (since they're in a separate component)
  if (typeof document !== "undefined") {
    const portfolioEl = document.getElementById("dock-portfolios");
    const assetEl = document.getElementById("dock-assets");
    if (portfolioEl) portfolioEl.textContent = String(userPortfolios.length);
    if (assetEl)
      assetEl.textContent = String(
        userPortfolios.reduce((sum, p) => sum + p.assetsCount, 0)
      );
  }

  const handleCreatePortfolio = () => {
    if (userId) {
      createPortfolio({
        userId,
        name: newPortfolio.name,
        description: newPortfolio.description,
      });
      setNewPortfolio({ name: "", description: "" });
      setIsCreateModalOpen(false);
    }
  };

  const handleEditPortfolio = (portfolio: any) => {
    setNewPortfolio({
      id: portfolio._id,
      name: portfolio.name,
      description: portfolio.description || "",
    });
    setIsEditModalOpen(true);
  };

  const handleDeletePortfolio = (portfolioId: string) => {
    if (userId) deletePortfolio({ portfolioId, userId });
  };

  const handleUpdatePortfolio = () => {
    if (userId && newPortfolio.id) {
      editPortfolio({
        portfolioId: newPortfolio.id,
        userId,
        name: newPortfolio.name,
        description: newPortfolio.description,
      });
      setIsEditModalOpen(false);
      setNewPortfolio({ name: "", description: "" });
    }
  };

  const cleanAnalysis = aiSummaryData
    ? cleanMarkdownWrapper(aiSummaryData.analysis)
    : "";

  return (
    <div className="flex min-h-screen bg-background">
      <DockSidebar />

      <main className="flex-1 ml-[17rem] overflow-auto">
        <div className="max-w-[1100px] mx-auto px-8 py-8">
          {/* Header with greeting */}
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-2">
                Dashboard
              </p>
              <h1 className="text-4xl font-bold text-foreground tracking-tight text-balance">
                Hello, {usersName}
              </h1>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Your financial overview for{" "}
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
                .
              </p>
            </div>
            <Dialog
              open={isCreateModalOpen}
              onOpenChange={setIsCreateModalOpen}
            >
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-sm shadow-primary/20"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Portfolio
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Portfolio</DialogTitle>
                  <DialogDescription>
                    Set up a new portfolio to track your investments.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="r4-name">Portfolio Name</Label>
                    <Input
                      id="r4-name"
                      placeholder="e.g., Growth Portfolio"
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
                    <Label htmlFor="r4-desc">Description</Label>
                    <Textarea
                      id="r4-desc"
                      placeholder="Brief description..."
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
                  >
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Hero Net Worth Card */}
          <Card className="p-8 mb-6 relative overflow-hidden rounded-2xl border-border bg-card">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_oklch(0.75_0.08_85_/_0.08)_0%,_transparent_50%)]" />
            <div className="absolute top-0 right-0 w-64 h-64 opacity-[0.03]">
              <BarChart3 className="w-full h-full text-primary" />
            </div>
            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-3">
                    Total Net Worth
                  </p>
                  <p className="text-5xl font-bold text-foreground tracking-tight">
                    ${totalValue.toLocaleString()}
                  </p>
                  <div
                    className={`flex items-center gap-3 mt-4 ${totalChange >= 0 ? "text-primary" : "text-secondary"}`}
                  >
                    {totalChange >= 0 ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                    <span className="text-lg font-semibold">
                      {totalChange >= 0 ? "+" : ""}$
                      {Math.abs(totalChange).toLocaleString()}
                    </span>
                    <span className="text-sm">
                      ({totalChange >= 0 ? "+" : ""}
                      {totalChangePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
                <div className="hidden lg:block w-60">
                  <ChartRadialStacked Weightings={userPortfolios} />
                </div>
              </div>
            </div>
          </Card>

          {/* Market Benchmarks - Horizontal scroll */}
          <div className="mb-6">
            <h2 className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-3">
              Market Indices
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
              {benchmarkData.length > 0 ? (
                benchmarkData.map((b: any) => {
                  const isPos = b.percentageChange >= 0;
                  const change = b.close * (b.percentageChange / 100);
                  return (
                    <Card
                      key={b.ticker}
                      className="p-4 min-w-[200px] bg-card border-border rounded-xl flex-shrink-0"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-foreground">
                          {b.name}
                        </p>
                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center ${isPos ? "bg-primary/10" : "bg-secondary/10"}`}
                        >
                          {isPos ? (
                            <TrendingUp className="h-3 w-3 text-primary" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-secondary" />
                          )}
                        </div>
                      </div>
                      <p className="text-lg font-bold text-foreground">
                        {b.close.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs font-medium ${isPos ? "text-primary" : "text-secondary"}`}
                        >
                          {isPos ? "+" : ""}
                          {change.toFixed(2)}
                        </span>
                        <span
                          className={`text-xs ${isPos ? "text-primary/60" : "text-secondary/60"}`}
                        >
                          ({isPos ? "+" : ""}
                          {b.percentageChange.toFixed(2)}%)
                        </span>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <Card className="p-6 flex-1 flex items-center justify-center rounded-xl">
                  <p className="text-sm text-muted-foreground">
                    No benchmark data.
                  </p>
                </Card>
              )}
            </div>
          </div>

          {/* AI Intelligence */}
          {aiSummaryData && cleanAnalysis && (
            <Card className="p-6 mb-6 rounded-2xl border-primary/15 bg-[radial-gradient(ellipse_at_bottom_left,_oklch(0.75_0.08_85_/_0.04)_0%,_transparent_50%)] relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">
                      Market Intelligence
                    </h3>
                    <p className="text-[10px] text-muted-foreground">
                      AI-powered daily analysis
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpandedAI(true)}
                  className="rounded-lg text-xs border-primary/20 text-primary hover:bg-primary/10"
                >
                  Read Full Analysis
                  <ArrowRight className="h-3 w-3 ml-1.5" />
                </Button>
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {parseMarkdown(cleanAnalysis)}
              </div>
            </Card>
          )}

          <Dialog open={expandedAI} onOpenChange={setExpandedAI}>
            <DialogContent className="max-h-[80vh] max-w-4xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Market Intelligence
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4 overflow-auto max-h-[60vh]">
                {parseMarkdown(cleanAnalysis)}
              </div>
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground italic">
                  <span className="font-semibold">AI Risk Warning:</span> This
                  AI-generated market summary is for informational purposes
                  only.
                </p>
              </div>
            </DialogContent>
          </Dialog>

          {/* Portfolio Deck */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                Your Portfolios ({userPortfolios.length})
              </h2>
            </div>

            {userPortfolios.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userPortfolios.map((portfolio, index) => {
                  const isPositive = portfolio.change >= 0;
                  return (
                    <Card
                      key={portfolio._id}
                      className="p-6 rounded-2xl bg-card border-border group hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all relative overflow-hidden"
                    >
                      {/* Subtle index indicator */}
                      <div className="absolute top-4 right-4 text-[60px] font-black text-foreground/[0.03] leading-none pointer-events-none">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="relative">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                              <Briefcase className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <Link
                                href={`/portfolio/${portfolio._id}`}
                                className="text-sm font-bold text-foreground group-hover:text-primary transition-colors"
                              >
                                {portfolio.name}
                              </Link>
                              <p className="text-[10px] text-muted-foreground">
                                {portfolio.assetsCount} assets
                              </p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditPortfolio(portfolio)}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleDeletePortfolio(portfolio._id)
                                }
                                className="text-secondary focus:text-secondary"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <p className="text-xs text-muted-foreground mb-4 line-clamp-1">
                          {portfolio.description || "No description"}
                        </p>

                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-2xl font-bold text-foreground">
                              ${portfolio.currentValue.toLocaleString()}
                            </p>
                          </div>
                          <div
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${
                              isPositive
                                ? "bg-primary/10 text-primary"
                                : "bg-secondary/10 text-secondary"
                            }`}
                          >
                            {isPositive ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            <span className="text-xs font-bold">
                              {isPositive ? "+" : ""}
                              {portfolio.changePercent.toFixed(2)}%
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">
                            P/L: {isPositive ? "+" : ""}$
                            {Math.abs(portfolio.change).toLocaleString()}
                          </span>
                          <Link
                            href={`/portfolio/${portfolio._id}`}
                            className="flex items-center gap-1 text-[10px] text-primary font-medium hover:underline"
                          >
                            View Details
                            <ArrowRight className="h-2.5 w-2.5" />
                          </Link>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-12 rounded-2xl flex flex-col items-center justify-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
                  <Briefcase className="h-7 w-7 text-muted-foreground/50" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    No portfolios yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Create your first portfolio to start tracking investments.
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Mobile allocation (hidden on lg) */}
          <div className="lg:hidden mb-6">
            <ChartRadialStacked Weightings={userPortfolios} />
          </div>
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Portfolio</DialogTitle>
            <DialogDescription>Update your portfolio details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="r4-edit-name">Portfolio Name</Label>
              <Input
                id="r4-edit-name"
                value={newPortfolio.name}
                onChange={(e) =>
                  setNewPortfolio({ ...newPortfolio, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="r4-edit-desc">Description</Label>
              <Textarea
                id="r4-edit-desc"
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
            <Button onClick={handleUpdatePortfolio}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
