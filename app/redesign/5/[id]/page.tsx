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
  Settings, Search, Bell, BarChart3, BookmarkIcon, Sparkles,
  Filter, ChevronDown, ChevronUp, CircleSlash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

function TopNavbar() {
  const navItems = [
    { name: "Overview", href: "/redesign/5", icon: BarChart3 },
    { name: "News", href: "/news", icon: Newspaper },
    { name: "Watchlist", href: "/watchlist", icon: BookmarkIcon },
    { name: "Settings", href: "/settings", icon: Settings },
  ];
  return (
    <nav className="border-b border-border bg-card/60 backdrop-blur-md sticky top-10 z-40">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 h-14">
        <div className="flex items-center gap-1">
          <Briefcase className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground tracking-tight text-lg ml-1">PulsePortfolio</span>
          <span className="text-border mx-4">|</span>
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <item.icon className="h-4 w-4" />{item.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Find Something..." className="w-52 h-8 pl-8 text-xs bg-muted/50 border-border" />
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground"><Bell className="h-4 w-4" /></Button>
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" }, baseTheme: dark }} />
        </div>
      </div>
    </nav>
  );
}

export default function Redesign5Portfolio() {
  const { user } = useUser();
  const routeParams = useParams();
  const portfolioId = routeParams.id as string;
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isBunkerCollapsed, setIsBunkerCollapsed] = useState(true);
  const [chartDateRange, setChartDateRange] = useState("1Y");

  const convexUser = useQuery(api.users.getUserByClerkId, { clerkId: user?.id || "" });
  const canUserAccess = useQuery(api.portfolios.canUserAccessPortfolio, { portfolioId });
  const portfolio = useQuery(api.portfolios.getPortfolioById, { portfolioId });
  const deleteAsset = useMutation(api.assets.deleteAsset);

  const getDateRange = (range: string) => {
    const today = new Date();
    const startDate = new Date();
    switch (range) {
      case "1M": startDate.setMonth(today.getMonth() - 1); break;
      case "3M": startDate.setMonth(today.getMonth() - 3); break;
      case "6M": startDate.setMonth(today.getMonth() - 6); break;
      case "1Y": startDate.setFullYear(today.getFullYear() - 1); break;
      case "2Y": startDate.setFullYear(today.getFullYear() - 2); break;
      case "5Y": startDate.setFullYear(today.getFullYear() - 5); break;
      default: startDate.setFullYear(today.getFullYear() - 10); break;
    }
    return { startDate: startDate.toISOString().split("T")[0], endDate: today.toISOString().split("T")[0] };
  };

  const { startDate, endDate } = getDateRange(chartDateRange);
  const chartData = useQuery(api.marketData.getHistoricalData, { portfolioId, isForChart: true, startDate, endDate }) || [];

  const stockAssets = portfolio?.assets.filter((a) => a.type === "stock") || [];
  const cryptoAssets = portfolio?.assets.filter((a) => a.type === "crypto") || [];
  const propertyAssets = portfolio?.assets.filter((a) => a.type === "real estate") || [];
  const commodityAssets = portfolio?.assets.filter((a) => a.type === "commodity") || [];
  const bondAssets = portfolio?.assets.filter((a) => a.type === "bond") || [];
  const cashAssets = portfolio?.assets.filter((a) => a.type === "cash") || [];
  const otherAssets = portfolio?.assets.filter((a) => a.type === "other") || [];

  const handleEditAsset = (asset: Asset) => {
    if (asset.type === "cash" && !asset.currency) asset.currency = "USD";
    setEditingAsset(asset);
    setIsEditDialogOpen(true);
  };
  const handleDeleteAsset = (id: string) => {
    if (confirm("Are you sure you want to delete this asset?")) deleteAsset({ assetId: id as Id<"assets"> });
  };

  if (!canUserAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You do not have permission to view this portfolio.</p>
          <Link href="/redesign/5"><Button variant="ghost"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNavbar />
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/redesign/5"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button></Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-foreground mb-2">{portfolio?.name || "Loading..."}</h1>
            <p className="text-muted-foreground">{portfolio?.description || ""}</p>
          </div>
          <div className="flex gap-3">
            {portfolio && <EditPortfolioDialog portfolioId={portfolioId} userId={portfolio.userId} initialName={portfolio.name} initialDescription={portfolio.description} />}
            <AddAssetDialog portfolioId={portfolioId} />
            <EditAssetDialog isOpen={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} asset={editingAsset} onAssetUpdated={() => setEditingAsset(null)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Value</p>
            <p className="text-2xl font-bold text-foreground">${portfolio?.currentValue?.toLocaleString()}</p>
            <div className={`text-sm flex items-center gap-1 mt-2 ${(portfolio?.change || 0) >= 0 ? "text-primary" : "text-secondary"}`}>
              {(portfolio?.change || 0) >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {(portfolio?.change || 0) >= 0 ? "+" : ""}${Math.abs(portfolio?.change || 0).toLocaleString()} ({portfolio?.changePercent?.toFixed(2)}%)
            </div>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-1">Assets</p>
            <p className="text-2xl font-bold text-foreground">{portfolio?.assets?.length || 0}</p>
            <p className="text-xs text-muted-foreground mt-2">Across {new Set(portfolio?.assets?.map((a) => a.type)).size || 0} categories</p>
          </Card>
          <AISummaryCard title="AI Summary" headline={portfolio?.aiHeadline || "Analysis"} content={portfolio?.aiSummary || "Analysis will appear once data is processed."} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div><CardTitle>Performance</CardTitle><CardDescription>Portfolio over time</CardDescription></div>
                <Select value={chartDateRange} onValueChange={setChartDateRange}>
                  <SelectTrigger className="w-32"><Filter className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
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
          <AssetAllocationPie value={portfolio?.currentValue || 0} assets={portfolio?.assets || []} />
        </div>

        <Separator className="mb-0" />
        <PortfolioAnalytics portfolioId={portfolioId} />
        <Separator className="mb-6" />

        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Holdings</h2>
          {portfolio?.assets && portfolio.assets.length > 0 ? (
            <>
              <AssetSection title="Stocks" assets={stockAssets} onEdit={handleEditAsset} onDelete={handleDeleteAsset} />
              <AssetSection title="Cryptocurrencies" assets={cryptoAssets} onEdit={handleEditAsset} onDelete={handleDeleteAsset} />
              <AssetSection title="Real Estate" assets={propertyAssets} onEdit={handleEditAsset} onDelete={handleDeleteAsset} />
              <AssetSection title="Commodities" assets={commodityAssets} onEdit={handleEditAsset} onDelete={handleDeleteAsset} />
              <AssetSection title="Bonds" assets={bondAssets} onEdit={handleEditAsset} onDelete={handleDeleteAsset} />
              <AssetSection title="Cash" assets={cashAssets} onEdit={handleEditAsset} onDelete={handleDeleteAsset} />
              <AssetSection title="Other" assets={otherAssets} onEdit={handleEditAsset} onDelete={handleDeleteAsset} />
            </>
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
    </div>
  );
}
