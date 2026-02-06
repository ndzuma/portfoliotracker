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
  ChevronRight,
  Activity,
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

/* ─── Expanded Sidebar with sections ─── */
function BentoSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const mainNav = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "News", href: "/news", icon: Newspaper },
  ];

  const toolsNav = [
    ...(isFeatureEnabled("watchlist")
      ? [{ name: "Watchlist", href: "/watchlist", icon: BookmarkIcon }]
      : []),
    ...(isFeatureEnabled("research")
      ? [{ name: "Research", href: "/research", icon: BinocularsIcon }]
      : []),
    ...(isFeatureEnabled("earningsCalendar")
      ? [{ name: "Earnings", href: "/earnings", icon: CalendarDaysIcon }]
      : []),
  ];

  const renderNavItem = (item: {
    name: string;
    href: string;
    icon: any;
  }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        key={item.name}
        href={item.href}
        className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all group ${
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        }`}
      >
        <item.icon
          className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
        />
        <span>{item.name}</span>
        {isActive && (
          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
        )}
      </Link>
    );
  };

  return (
    <aside className="fixed left-0 top-10 bottom-0 z-40 flex w-56 flex-col border-r border-border bg-card/30 backdrop-blur-md">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground leading-none">
              PulsePortfolio
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Investment Tracker
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-4">
          <p className="px-3 mb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            Main
          </p>
          <div className="flex flex-col gap-0.5">{mainNav.map(renderNavItem)}</div>
        </div>

        {toolsNav.length > 0 && (
          <div className="mb-4">
            <p className="px-3 mb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              Tools
            </p>
            <div className="flex flex-col gap-0.5">
              {toolsNav.map(renderNavItem)}
            </div>
          </div>
        )}

        <div>
          <p className="px-3 mb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            System
          </p>
          <div className="flex flex-col gap-0.5">
            {renderNavItem({
              name: "Settings",
              href: "/settings",
              icon: Settings,
            })}
          </div>
        </div>
      </div>

      {/* User */}
      <div className="px-3 py-3 border-t border-border/50">
        <div className="flex items-center gap-2.5 px-2">
          <UserButton
            appearance={{
              elements: { userButtonAvatarBox: "w-8 h-8" },
              baseTheme: dark,
            }}
            afterSignOutUrl="/"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">
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

/* ─── Main Page: Bento Grid ─── */
export default function Redesign2() {
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
      <BentoSidebar />

      <main className="flex-1 ml-56 overflow-auto">
        <div className="max-w-[1200px] mx-auto px-8 py-8">
          {/* Header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight text-balance">
                Good{" "}
                {new Date().getHours() < 12
                  ? "morning"
                  : new Date().getHours() < 17
                    ? "afternoon"
                    : "evening"}
                , {usersName}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Here{"'"}s your portfolio at a glance.
              </p>
            </div>
            <Dialog
              open={isCreateModalOpen}
              onOpenChange={setIsCreateModalOpen}
            >
              <DialogTrigger asChild>
                <Button className="bg-foreground text-background hover:bg-foreground/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Portfolio
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
                    <Label htmlFor="r2-name">Portfolio Name</Label>
                    <Input
                      id="r2-name"
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
                    <Label htmlFor="r2-desc">Description</Label>
                    <Textarea
                      id="r2-desc"
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

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Net Worth - spans 2 cols */}
            <Card className="col-span-1 md:col-span-2 p-6 bg-card border-border relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_oklch(0.75_0.08_85_/_0.04)_0%,_transparent_60%)]" />
              <div className="relative">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                  Total Net Worth
                </p>
                <p className="text-4xl font-bold text-foreground mt-2 tracking-tight">
                  ${totalValue.toLocaleString()}
                </p>
                <div
                  className={`flex items-center gap-2 mt-3 ${totalChange >= 0 ? "text-primary" : "text-secondary"}`}
                >
                  {totalChange >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <span className="text-sm font-semibold">
                    {totalChange >= 0 ? "+" : ""}$
                    {Math.abs(totalChange).toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({totalChange >= 0 ? "+" : ""}
                    {totalChangePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </Card>

            {/* Allocation chart - spans 2 cols */}
            <div className="col-span-1 md:col-span-2">
              <ChartRadialStacked Weightings={userPortfolios} />
            </div>

            {/* Benchmark cards */}
            {benchmarkData.length > 0 ? (
              benchmarkData.map((b: any) => {
                const isPos = b.percentageChange >= 0;
                const change = b.close * (b.percentageChange / 100);
                return (
                  <Card key={b.ticker} className="p-4 bg-card border-border">
                    <p className="text-xs text-muted-foreground font-medium mb-1">
                      {b.name}
                    </p>
                    <p className="text-xl font-bold text-foreground">
                      {b.close.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      {isPos ? (
                        <TrendingUp className="h-3 w-3 text-primary" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-secondary" />
                      )}
                      <span
                        className={`text-xs font-medium ${isPos ? "text-primary" : "text-secondary"}`}
                      >
                        {isPos ? "+" : ""}
                        {change.toFixed(2)}
                      </span>
                      <span
                        className={`text-xs ${isPos ? "text-primary/70" : "text-secondary/70"}`}
                      >
                        ({isPos ? "+" : ""}
                        {b.percentageChange.toFixed(2)}%)
                      </span>
                    </div>
                  </Card>
                );
              })
            ) : (
              <Card className="col-span-1 md:col-span-2 lg:col-span-4 p-6 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  No benchmark data available.
                </p>
              </Card>
            )}

            {/* AI Market Intelligence - spans full width */}
            {aiSummaryData && cleanAnalysis && (
              <Card className="col-span-1 md:col-span-2 lg:col-span-4 p-6 border-primary/20 bg-[radial-gradient(ellipse_at_top_left,_oklch(0.75_0.08_85_/_0.05)_0%,_transparent_40%)]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">
                      Market Intelligence
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      AI
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedAI(true)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Read more
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {parseMarkdown(cleanAnalysis)}
                </div>
              </Card>
            )}

            {/* AI Expanded Dialog */}
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
                    <span className="font-semibold">AI Risk Warning:</span>{" "}
                    This AI-generated market summary is for informational
                    purposes only and should not be considered financial advice.
                  </p>
                </div>
              </DialogContent>
            </Dialog>

            {/* Portfolio Cards - each portfolio gets a card */}
            {userPortfolios.length > 0 ? (
              userPortfolios.map((portfolio) => {
                const isPositive = portfolio.change >= 0;
                return (
                  <Card
                    key={portfolio._id}
                    className="col-span-1 md:col-span-2 p-5 bg-card border-border group hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <Link
                        href={`/portfolio/${portfolio._id}`}
                        className="flex-1 min-w-0"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {portfolio.name}
                          </h3>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mb-3">
                          {portfolio.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xl font-bold text-foreground">
                            ${portfolio.currentValue.toLocaleString()}
                          </p>
                          <div className="flex items-center gap-1">
                            {isPositive ? (
                              <TrendingUp className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <TrendingDown className="h-3.5 w-3.5 text-secondary" />
                            )}
                            <span
                              className={`text-sm font-medium ${isPositive ? "text-primary" : "text-secondary"}`}
                            >
                              {isPositive ? "+" : ""}
                              {portfolio.changePercent.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{portfolio.assetsCount} assets</span>
                          <span>
                            ${Math.abs(portfolio.change).toLocaleString()}{" "}
                            {isPositive ? "gain" : "loss"}
                          </span>
                        </div>
                      </Link>
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
                  </Card>
                );
              })
            ) : (
              <Card className="col-span-1 md:col-span-2 lg:col-span-4 p-10 flex flex-col items-center justify-center gap-3">
                <Briefcase className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  No portfolios found. Create one to get started.
                </p>
              </Card>
            )}
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
              <Label htmlFor="r2-edit-name">Portfolio Name</Label>
              <Input
                id="r2-edit-name"
                value={newPortfolio.name}
                onChange={(e) =>
                  setNewPortfolio({ ...newPortfolio, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="r2-edit-desc">Description</Label>
              <Textarea
                id="r2-edit-desc"
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
