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
  ArrowUpRight,
  ArrowDownRight,
  LayoutDashboard,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserButton, useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { dark } from "@clerk/themes";
import { isFeatureEnabled } from "@/lib/featureFlags";
import { parseMarkdown, cleanMarkdownWrapper } from "@/lib/markdown-parser";
import { ChartRadialStacked } from "@/components/allocationRadial";
import Image from "next/image";

/* ─── Icon-Rail Sidebar ─── */
function CommandSidebar() {
  const pathname = usePathname();
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
    <TooltipProvider delayDuration={0}>
      <aside className="fixed left-0 top-10 bottom-0 z-40 flex w-16 flex-col items-center border-r border-border bg-card/50 backdrop-blur-sm py-4">
        <div className="mb-6">
          <Image
            src="/pp-icon.png"
            alt="Logo"
            width={28}
            height={28}
            className="object-contain opacity-80"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
          <div className="h-7 w-7 rounded-md bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-xs">PP</span>
          </div>
        </div>

        <nav className="flex flex-1 flex-col items-center gap-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-[18px] w-[18px]" />
                    <span className="sr-only">{item.name}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  {item.name}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        <div className="mt-auto">
          <UserButton
            appearance={{
              elements: { userButtonAvatarBox: "w-8 h-8" },
              baseTheme: dark,
            }}
            afterSignOutUrl="/"
          />
        </div>
      </aside>
    </TooltipProvider>
  );
}

/* ─── Stat Pill ─── */
function StatPill({
  label,
  value,
  change,
  changePercent,
}: {
  label: string;
  value: string;
  change?: number;
  changePercent?: number;
}) {
  const isPositive = (change ?? 0) >= 0;
  return (
    <div className="flex flex-col gap-1 p-4 rounded-xl bg-muted/40 border border-border/50 min-w-[180px]">
      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
        {label}
      </span>
      <span className="text-2xl font-bold text-foreground tracking-tight">
        {value}
      </span>
      {change !== undefined && (
        <div className="flex items-center gap-1">
          {isPositive ? (
            <ArrowUpRight className="h-3 w-3 text-primary" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-secondary" />
          )}
          <span
            className={`text-xs font-medium ${isPositive ? "text-primary" : "text-secondary"}`}
          >
            {isPositive ? "+" : ""}
            {changePercent?.toFixed(2)}%
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─── */
export default function Redesign1() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newPortfolio, setNewPortfolio] = useState<{
    id?: string;
    name: string;
    description: string;
  }>({
    name: "",
    description: "",
  });

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
      description: portfolio.description,
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
      <CommandSidebar />

      <main className="flex-1 ml-16 overflow-auto">
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          {/* Header row */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                Portfolio Overview
              </p>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                Welcome back, {usersName}
              </h1>
            </div>
            <Dialog
              open={isCreateModalOpen}
              onOpenChange={setIsCreateModalOpen}
            >
              <DialogTrigger asChild>
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
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
                    <Label htmlFor="r1-name">Portfolio Name</Label>
                    <Input
                      id="r1-name"
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
                    <Label htmlFor="r1-desc">Description</Label>
                    <Textarea
                      id="r1-desc"
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
                    className="bg-primary text-primary-foreground"
                  >
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats strip */}
          <div className="flex gap-4 overflow-x-auto pb-2 mb-6 scrollbar-none">
            <StatPill
              label="Net Worth"
              value={`$${totalValue.toLocaleString()}`}
              change={totalChange}
              changePercent={totalChangePercent}
            />
            <StatPill
              label="Portfolios"
              value={String(userPortfolios.length)}
            />
            <StatPill
              label="Total Assets"
              value={String(
                userPortfolios.reduce((sum, p) => sum + p.assetsCount, 0)
              )}
            />
            {benchmarkData.slice(0, 3).map((b: any) => (
              <StatPill
                key={b.ticker}
                label={b.name}
                value={b.close.toLocaleString()}
                change={b.close * (b.percentageChange / 100)}
                changePercent={b.percentageChange}
              />
            ))}
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Main content */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* AI Intelligence Card */}
              {aiSummaryData && cleanAnalysis && (
                <Card className="p-5 border-primary/20 bg-[radial-gradient(ellipse_at_top_left,_oklch(0.75_0.08_85_/_0.06)_0%,_transparent_50%)]">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-7 w-7 rounded-md bg-primary/15 flex items-center justify-center">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        Market Intelligence
                      </h3>
                      <p className="text-[10px] text-muted-foreground">
                        AI-generated daily insight
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                    {parseMarkdown(cleanAnalysis)}
                  </div>
                </Card>
              )}

              {/* Portfolios table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold text-foreground">
                      Portfolios
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      ({userPortfolios.length})
                    </span>
                  </div>
                </div>

                <Card className="bg-card border-border overflow-hidden">
                  {/* Table header */}
                  <div className="grid grid-cols-[1fr_120px_120px_60px_40px] items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <span>Name</span>
                    <span className="text-right">Change</span>
                    <span className="text-right">Value</span>
                    <span className="text-center">Assets</span>
                    <span></span>
                  </div>

                  {userPortfolios.length > 0 ? (
                    userPortfolios.map((portfolio) => {
                      const isPositive = portfolio.change >= 0;
                      return (
                        <div
                          key={portfolio._id}
                          className="grid grid-cols-[1fr_120px_120px_60px_40px] items-center gap-2 px-4 py-3 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          <Link
                            href={`/portfolio/${portfolio._id}`}
                            className="min-w-0"
                          >
                            <p className="text-sm font-medium text-foreground truncate hover:text-primary transition-colors">
                              {portfolio.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {portfolio.description}
                            </p>
                          </Link>
                          <div className="text-right">
                            <span
                              className={`text-sm font-medium ${isPositive ? "text-primary" : "text-secondary"}`}
                            >
                              {isPositive ? "+" : ""}
                              {portfolio.changePercent.toFixed(2)}%
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold text-foreground">
                              ${portfolio.currentValue.toLocaleString()}
                            </span>
                          </div>
                          <div className="text-center text-sm text-muted-foreground">
                            {portfolio.assetsCount}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
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
                      );
                    })
                  ) : (
                    <div className="flex justify-center items-center py-12">
                      <p className="text-sm text-muted-foreground">
                        No portfolios yet. Create one to get started.
                      </p>
                    </div>
                  )}
                </Card>
              </div>
            </div>

            {/* Right: Side panel */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Net worth highlight */}
              <Card className="p-5 bg-card border-border">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Net Worth
                </p>
                <p className="text-3xl font-bold text-foreground tracking-tight">
                  ${totalValue.toLocaleString()}
                </p>
                <div
                  className={`flex items-center gap-1.5 mt-2 ${totalChange >= 0 ? "text-primary" : "text-secondary"}`}
                >
                  {totalChange >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">
                    {totalChange >= 0 ? "+" : ""}$
                    {Math.abs(totalChange).toLocaleString()} (
                    {totalChange >= 0 ? "+" : ""}
                    {totalChangePercent.toFixed(2)}%)
                  </span>
                </div>
              </Card>

              {/* Allocation chart */}
              <ChartRadialStacked Weightings={userPortfolios} />

              {/* Benchmark list */}
              <Card className="p-4 bg-card border-border">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Market Benchmarks
                </h3>
                <div className="flex flex-col gap-3">
                  {benchmarkData.length > 0 ? (
                    benchmarkData.map((b: any) => {
                      const isPos = b.percentageChange >= 0;
                      return (
                        <div
                          key={b.ticker}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-foreground font-medium">
                            {b.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-foreground">
                              {b.close.toLocaleString()}
                            </span>
                            <span
                              className={`text-xs font-medium ${isPos ? "text-primary" : "text-secondary"}`}
                            >
                              {isPos ? "+" : ""}
                              {b.percentageChange.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No benchmark data available.
                    </p>
                  )}
                </div>
              </Card>
            </div>
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
              <Label htmlFor="r1-edit-name">Portfolio Name</Label>
              <Input
                id="r1-edit-name"
                value={newPortfolio.name}
                onChange={(e) =>
                  setNewPortfolio({ ...newPortfolio, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="r1-edit-desc">Description</Label>
              <Textarea
                id="r1-edit-desc"
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
