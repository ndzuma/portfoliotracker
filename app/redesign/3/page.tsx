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
  Terminal,
  Clock,
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

/* ─── Terminal-style sidebar with monospace ─── */
function TerminalSidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const navigation = [
    { name: "dashboard", href: "/", icon: LayoutDashboard, shortcut: "D" },
    { name: "news", href: "/news", icon: Newspaper, shortcut: "N" },
    ...(isFeatureEnabled("watchlist")
      ? [
          {
            name: "watchlist",
            href: "/watchlist",
            icon: BookmarkIcon,
            shortcut: "W",
          },
        ]
      : []),
    ...(isFeatureEnabled("research")
      ? [
          {
            name: "research",
            href: "/research",
            icon: BinocularsIcon,
            shortcut: "R",
          },
        ]
      : []),
    ...(isFeatureEnabled("earningsCalendar")
      ? [
          {
            name: "earnings",
            href: "/earnings",
            icon: CalendarDaysIcon,
            shortcut: "E",
          },
        ]
      : []),
    { name: "settings", href: "/settings", icon: Settings, shortcut: "S" },
  ];

  return (
    <aside className="fixed left-0 top-10 bottom-0 z-40 flex w-52 flex-col border-r border-border bg-background">
      {/* Terminal header */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-primary" />
          <span className="font-mono text-xs font-bold text-primary tracking-wider uppercase">
            PulseFolio
          </span>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground mt-1">
          v2.0 terminal
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 font-mono">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2 text-xs rounded transition-all ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <div className="flex items-center gap-2">
                {isActive && (
                  <span className="text-primary">{">"}</span>
                )}
                <span className={isActive ? "font-bold" : ""}>
                  {item.name}
                </span>
              </div>
              <kbd className="hidden md:inline-flex h-5 items-center rounded border border-border bg-muted/50 px-1.5 text-[10px] text-muted-foreground">
                {item.shortcut}
              </kbd>
            </Link>
          );
        })}
      </nav>

      {/* Status bar */}
      <div className="px-3 py-2 border-t border-border bg-muted/20">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-[10px] text-muted-foreground">
            connected
          </span>
        </div>
        <div className="flex items-center gap-2">
          <UserButton
            appearance={{
              elements: { userButtonAvatarBox: "w-7 h-7" },
              baseTheme: dark,
            }}
            afterSignOutUrl="/"
          />
          <span className="font-mono text-[10px] text-foreground truncate">
            {user?.fullName}
          </span>
        </div>
      </div>
    </aside>
  );
}

/* ─── Terminal-style data row ─── */
function DataRow({
  label,
  value,
  mono = true,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
      <span className="text-xs text-muted-foreground font-mono uppercase">
        {label}
      </span>
      <span
        className={`text-xs text-foreground font-medium ${mono ? "font-mono" : "font-sans"}`}
      >
        {value}
      </span>
    </div>
  );
}

/* ─── Main Page: Finance Terminal ─── */
export default function Redesign3() {
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

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="flex min-h-screen bg-background">
      <TerminalSidebar />

      <main className="flex-1 ml-52 overflow-auto">
        <div className="max-w-[1300px] mx-auto px-6 py-6">
          {/* Terminal-style header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-mono text-lg font-bold text-foreground tracking-tight">
                  PORTFOLIO TERMINAL
                </h1>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="font-mono text-[10px]">
                    {dateStr} {timeStr}
                  </span>
                </div>
              </div>
              <p className="font-mono text-xs text-muted-foreground">
                session: {user?.fullName?.toLowerCase().replace(/\s/g, "_")} | portfolios: {userPortfolios.length} | assets:{" "}
                {userPortfolios.reduce((sum, p) => sum + p.assetsCount, 0)}
              </p>
            </div>
            <Dialog
              open={isCreateModalOpen}
              onOpenChange={setIsCreateModalOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="font-mono text-xs border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  NEW
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
                    <Label htmlFor="r3-name">Portfolio Name</Label>
                    <Input
                      id="r3-name"
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
                    <Label htmlFor="r3-desc">Description</Label>
                    <Textarea
                      id="r3-desc"
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

          {/* Three-column terminal layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Column 1: Account Summary */}
            <div className="flex flex-col gap-4">
              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <h2 className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">
                    Account Summary
                  </h2>
                </div>
                <DataRow
                  label="NET WORTH"
                  value={`$${totalValue.toLocaleString()}`}
                />
                <DataRow
                  label="COST BASIS"
                  value={`$${totalCost.toLocaleString()}`}
                />
                <DataRow
                  label="P/L"
                  value={`${totalChange >= 0 ? "+" : ""}$${Math.abs(totalChange).toLocaleString()}`}
                />
                <DataRow
                  label="P/L %"
                  value={`${totalChange >= 0 ? "+" : ""}${totalChangePercent.toFixed(2)}%`}
                />
                <DataRow
                  label="PORTFOLIOS"
                  value={String(userPortfolios.length)}
                />
                <DataRow
                  label="ASSETS"
                  value={String(
                    userPortfolios.reduce((sum, p) => sum + p.assetsCount, 0)
                  )}
                />

                {/* P/L indicator bar */}
                <div className="mt-3 pt-2 border-t border-border/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      PERFORMANCE
                    </span>
                    <span
                      className={`font-mono text-[10px] font-bold ${totalChange >= 0 ? "text-primary" : "text-secondary"}`}
                    >
                      {totalChange >= 0 ? "PROFIT" : "LOSS"}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${totalChange >= 0 ? "bg-primary" : "bg-secondary"}`}
                      style={{
                        width: `${Math.min(Math.abs(totalChangePercent), 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </Card>

              {/* Allocation */}
              <ChartRadialStacked Weightings={userPortfolios} />
            </div>

            {/* Column 2: Market Data */}
            <div className="flex flex-col gap-4">
              <Card className="p-4 bg-card border-border">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                  <div className="h-1.5 w-1.5 rounded-full bg-chart-4" />
                  <h2 className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">
                    Market Data
                  </h2>
                </div>
                {benchmarkData.length > 0 ? (
                  benchmarkData.map((b: any) => {
                    const isPos = b.percentageChange >= 0;
                    return (
                      <div
                        key={b.ticker}
                        className="py-2 border-b border-border/30 last:border-0"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-foreground font-medium">
                            {b.ticker || b.name}
                          </span>
                          <span className="font-mono text-xs text-foreground">
                            {b.close.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {b.name}
                          </span>
                          <span
                            className={`font-mono text-[10px] font-medium ${isPos ? "text-primary" : "text-secondary"}`}
                          >
                            {isPos ? "+" : ""}
                            {b.percentageChange.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="font-mono text-xs text-muted-foreground py-4 text-center">
                    NO DATA
                  </p>
                )}
              </Card>

              {/* AI Intelligence */}
              {aiSummaryData && cleanAnalysis && (
                <Card className="p-4 bg-card border-primary/20">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <h2 className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">
                      AI Signal
                    </h2>
                  </div>
                  <div
                    className="text-xs text-muted-foreground leading-relaxed font-mono overflow-hidden"
                    style={{
                      maxHeight: "120px",
                      WebkitMaskImage:
                        "linear-gradient(to bottom, black 70%, transparent 100%)",
                    }}
                  >
                    {parseMarkdown(cleanAnalysis)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedAI(true)}
                    className="mt-2 font-mono text-[10px] text-primary hover:text-primary/80 h-6 px-2"
                  >
                    {"[EXPAND]"}
                  </Button>
                </Card>
              )}

              <Dialog open={expandedAI} onOpenChange={setExpandedAI}>
                <DialogContent className="max-h-[80vh] max-w-4xl">
                  <DialogHeader>
                    <DialogTitle className="font-mono flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      AI Market Signal
                    </DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 overflow-auto max-h-[60vh]">
                    {parseMarkdown(cleanAnalysis)}
                  </div>
                  <div className="mt-6 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground italic font-mono">
                      DISCLAIMER: AI-generated content. Not financial advice.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Column 3: Portfolios */}
            <div className="flex flex-col gap-4">
              <Card className="p-4 bg-card border-border">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                    <h2 className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">
                      Portfolios
                    </h2>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    [{userPortfolios.length}]
                  </span>
                </div>

                {userPortfolios.length > 0 ? (
                  userPortfolios.map((portfolio) => {
                    const isPositive = portfolio.change >= 0;
                    return (
                      <div
                        key={portfolio._id}
                        className="py-3 border-b border-border/30 last:border-0 group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Link
                            href={`/portfolio/${portfolio._id}`}
                            className="font-mono text-xs font-medium text-foreground hover:text-primary transition-colors truncate flex-1"
                          >
                            {portfolio.name}
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="h-3 w-3" />
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
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm font-bold text-foreground">
                            ${portfolio.currentValue.toLocaleString()}
                          </span>
                          <div className="flex items-center gap-1">
                            {isPositive ? (
                              <TrendingUp className="h-3 w-3 text-primary" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-secondary" />
                            )}
                            <span
                              className={`font-mono text-[10px] font-medium ${isPositive ? "text-primary" : "text-secondary"}`}
                            >
                              {isPositive ? "+" : ""}
                              {portfolio.changePercent.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {portfolio.assetsCount} assets
                          </span>
                          <span className="font-mono text-[10px] text-muted-foreground">
                            P/L: {isPositive ? "+" : ""}$
                            {Math.abs(portfolio.change).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center">
                    <p className="font-mono text-xs text-muted-foreground">
                      NO PORTFOLIOS FOUND
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground mt-1">
                      Use [NEW] to create one
                    </p>
                  </div>
                )}
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
              <Label htmlFor="r3-edit-name">Portfolio Name</Label>
              <Input
                id="r3-edit-name"
                value={newPortfolio.name}
                onChange={(e) =>
                  setNewPortfolio({ ...newPortfolio, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="r3-edit-desc">Description</Label>
              <Textarea
                id="r3-edit-desc"
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
