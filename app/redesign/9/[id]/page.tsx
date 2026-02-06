"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, TrendingUp, TrendingDown, Briefcase, Newspaper,
  Settings, Search, Bell, BarChart3, Wallet, Filter, CircleSlash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AISummaryCard } from "@/components/AISummaryCard";
import { AssetSection } from "@/app/(webapp)/portfolio/[id]/components/AssetSection";
import { AssetAllocationPie } from "@/components/assetAllocationPie";
import { PorfolioPerformanceChart } from "@/components/PortfolioPerformance";
import { AddAssetDialog } from "@/app/(webapp)/portfolio/[id]/components/dialogs/AddAssetDialog";
import { EditPortfolioDialog } from "@/app/(webapp)/portfolio/[id]/components/dialogs/EditPortfolioDialog";
import { EditAssetDialog } from "@/app/(webapp)/portfolio/[id]/components/dialogs/EditAssetDialog";
import { PortfolioAnalytics } from "@/components/PortfolioAnalytics";
import type { Asset } from "@/app/(webapp)/portfolio/[id]/components/types";
import type { Id } from "@/convex/_generated/dataModel";

function FullNavbar() {
  return (
    <nav className="sticky top-10 z-40 border-b border-border bg-card/70 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 h-12">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            <span className="font-bold text-foreground text-sm tracking-tight">PulsePortfolio</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-0.5">
            {[
              { n: "Overview", h: "/redesign/9" },
              { n: "Wallet", h: "/redesign/9" },
              { n: "News", h: "/news" },
              { n: "Analytics", h: "/watchlist" },
              { n: "Settings", h: "/settings" },
            ].map((item) => (
              <Link key={item.n} href={item.h} className="px-3 py-1.5 text-xs font-medium rounded text-muted-foreground hover:text-foreground transition-colors">
                {item.n}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input placeholder="Find Something..." className="w-44 h-7 pl-7 text-xs bg-muted/40 border-border" />
          </div>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground"><Bell className="h-3.5 w-3.5" /></Button>
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-7 h-7" }, baseTheme: dark }} />
        </div>
      </div>
    </nav>
  );
}

export default function Redesign9Portfolio() {
  const { user } = useUser();
  const routeParams = useParams();
  const portfolioId = routeParams.id as string;
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [chartDateRange, setChartDateRange] = useState("1Y");

  const convexUser = useQuery(api.users.getUserByClerkId, { clerkId: user?.id || "" });
  const canUserAccess = useQuery(api.portfolios.canUserAccessPortfolio, { portfolioId });
  const portfolio = useQuery(api.portfolios.getPortfolioById, { portfolioId });
  const deleteAsset = useMutation(api.assets.deleteAsset);

  const getDateRange = (range: string) => {
    const today = new Date(); const s = new Date();
    switch (range) {
      case "1M": s.setMonth(today.getMonth() - 1); break;
      case "3M": s.setMonth(today.getMonth() - 3); break;
      case "6M": s.setMonth(today.getMonth() - 6); break;
      case "1Y": s.setFullYear(today.getFullYear() - 1); break;
      case "2Y": s.setFullYear(today.getFullYear() - 2); break;
      case "5Y": s.setFullYear(today.getFullYear() - 5); break;
      default: s.setFullYear(today.getFullYear() - 10);
    }
    return { startDate: s.toISOString().split("T")[0], endDate: today.toISOString().split("T")[0] };
  };
  const { startDate, endDate } = getDateRange(chartDateRange);
  const chartData = useQuery(api.marketData.getHistoricalData, { portfolioId, isForChart: true, startDate, endDate }) || [];

  const assetsByType = {
    Stocks: portfolio?.assets.filter((a) => a.type === "stock") || [],
    Crypto: portfolio?.assets.filter((a) => a.type === "crypto") || [],
    "Real Estate": portfolio?.assets.filter((a) => a.type === "real estate") || [],
    Commodities: portfolio?.assets.filter((a) => a.type === "commodity") || [],
    Bonds: portfolio?.assets.filter((a) => a.type === "bond") || [],
    Cash: portfolio?.assets.filter((a) => a.type === "cash") || [],
    Other: portfolio?.assets.filter((a) => a.type === "other") || [],
  };

  const handleEditAsset = (asset: Asset) => {
    if (asset.type === "cash" && !asset.currency) asset.currency = "USD";
    setEditingAsset(asset);
    setIsEditDialogOpen(true);
  };
  const handleDeleteAsset = (id: string) => {
    if (confirm("Delete this asset?")) deleteAsset({ assetId: id as Id<"assets"> });
  };

  if (!canUserAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You do not have permission to view this portfolio.</p>
          <Link href="/redesign/9"><Button variant="ghost"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button></Link>
        </div>
      </div>
    );
  }

  const isPositive = (portfolio?.change || 0) >= 0;

  return (
    <div className="min-h-screen bg-background">
      <FullNavbar />

      <div className="px-6 py-5">
        {/* Breadcrumb / back */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/redesign/9">
            <Button variant="ghost" size="sm" className="h-7 text-xs">
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />Back to Overview
            </Button>
          </Link>
        </div>

        {/* Top stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <Card className="p-4 bg-card border-border">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">Portfolio</p>
            <p className="text-sm font-bold text-foreground truncate">{portfolio?.name || "Loading..."}</p>
            <p className="text-[10px] text-muted-foreground mt-1 truncate">{portfolio?.description}</p>
          </Card>
          <Card className="p-4 bg-card border-border">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">Total Value</p>
            <p className="text-xl font-bold text-foreground">${portfolio?.currentValue?.toLocaleString()}</p>
            <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${isPositive ? "text-primary" : "text-secondary"}`}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {isPositive ? "+" : ""}{portfolio?.changePercent?.toFixed(2)}%
            </div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">P&L</p>
            <p className={`text-xl font-bold ${isPositive ? "text-primary" : "text-secondary"}`}>
              {isPositive ? "+" : ""}${Math.abs(portfolio?.change || 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Unrealized gain</p>
          </Card>
          <Card className="p-4 bg-card border-border">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mb-1">Assets</p>
            <p className="text-xl font-bold text-foreground">{portfolio?.assets?.length || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">{new Set(portfolio?.assets?.map((a) => a.type)).size || 0} categories</p>
          </Card>
        </div>

        {/* Main content grid - 3 column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-5">
          {/* Left: Chart */}
          <div className="lg:col-span-8">
            <Card className="p-5 bg-card border-border h-full">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <CardTitle className="text-sm">Performance</CardTitle>
                  <CardDescription className="text-xs">Historical returns</CardDescription>
                </div>
                <Select value={chartDateRange} onValueChange={setChartDateRange}>
                  <SelectTrigger className="w-28 h-7 text-xs">
                    <Filter className="mr-1.5 h-3 w-3" /><SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1M">1 Month</SelectItem>
                    <SelectItem value="3M">3 Months</SelectItem>
                    <SelectItem value="6M">6 Months</SelectItem>
                    <SelectItem value="1Y">1 Year</SelectItem>
                    <SelectItem value="2Y">2 Years</SelectItem>
                    <SelectItem value="5Y">5 Years</SelectItem>
                    <SelectItem value="ALL">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <PorfolioPerformanceChart data={chartData} />
            </Card>
          </div>

          {/* Right: Allocation + AI */}
          <div className="lg:col-span-4 space-y-4">
            <AssetAllocationPie value={portfolio?.currentValue || 0} assets={portfolio?.assets || []} />
            <AISummaryCard
              title="AI Summary"
              headline={portfolio?.aiHeadline || "Analysis"}
              content={portfolio?.aiSummary || "Analysis will appear once data is processed."}
            />
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex items-center gap-3 mb-5">
          {portfolio && (
            <EditPortfolioDialog
              portfolioId={portfolioId}
              userId={portfolio.userId}
              initialName={portfolio.name}
              initialDescription={portfolio.description}
            />
          )}
          <AddAssetDialog portfolioId={portfolioId} />
          <EditAssetDialog
            isOpen={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            asset={editingAsset}
            onAssetUpdated={() => setEditingAsset(null)}
          />
        </div>

        <Separator className="mb-0" />
        <PortfolioAnalytics portfolioId={portfolioId} />
        <Separator className="mb-5" />

        {/* Holdings */}
        <h2 className="text-lg font-semibold text-foreground mb-4">Holdings</h2>
        {portfolio?.assets && portfolio.assets.length > 0 ? (
          Object.entries(assetsByType).map(([title, assets]) => (
            <AssetSection
              key={title}
              title={title}
              assets={assets}
              onEdit={handleEditAsset}
              onDelete={handleDeleteAsset}
            />
          ))
        ) : (
          <Card className="mb-6">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <CircleSlash className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No assets yet</p>
              <AddAssetDialog portfolioId={portfolioId} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
