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
  ArrowLeft, TrendingUp, TrendingDown, Briefcase,
  Filter, CircleSlash, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
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

export default function Redesign7Portfolio() {
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
    switch (range) { case "1M": s.setMonth(today.getMonth()-1); break; case "3M": s.setMonth(today.getMonth()-3); break; case "6M": s.setMonth(today.getMonth()-6); break; case "1Y": s.setFullYear(today.getFullYear()-1); break; case "2Y": s.setFullYear(today.getFullYear()-2); break; case "5Y": s.setFullYear(today.getFullYear()-5); break; default: s.setFullYear(today.getFullYear()-10); }
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

  const handleEditAsset = (asset: Asset) => { if (asset.type === "cash" && !asset.currency) asset.currency = "USD"; setEditingAsset(asset); setIsEditDialogOpen(true); };
  const handleDeleteAsset = (id: string) => { if (confirm("Delete this asset?")) deleteAsset({ assetId: id as Id<"assets"> }); };

  if (!canUserAccess) {
    return (<div className="min-h-screen flex items-center justify-center bg-background"><div className="text-center"><h1 className="text-2xl font-semibold text-foreground mb-4">Access Denied</h1><Link href="/redesign/7"><Button variant="ghost"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button></Link></div></div>);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-10 z-40 bg-background/80 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-8 py-4">
          <div className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" /><span className="font-bold text-foreground text-xl tracking-tight">PulsePortfolio</span></div>
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" }, baseTheme: dark }} />
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-8 py-6">
        <Link href="/redesign/7"><Button variant="ghost" size="sm" className="mb-6"><ArrowLeft className="h-4 w-4 mr-2" />All Portfolios</Button></Link>

        {/* Bold hero for portfolio */}
        <div className="mb-8">
          <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest mb-2">{portfolio?.description}</p>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight text-balance">{portfolio?.name || "Loading..."}</h1>
          <div className="flex items-center gap-6 mt-4">
            <p className="text-3xl font-bold text-foreground">${portfolio?.currentValue?.toLocaleString()}</p>
            <div className={`flex items-center gap-1 text-lg font-medium ${(portfolio?.change || 0) >= 0 ? "text-primary" : "text-secondary"}`}>
              {(portfolio?.change || 0) >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              <span>{(portfolio?.change || 0) >= 0 ? "+" : ""}${Math.abs(portfolio?.change || 0).toLocaleString()} ({portfolio?.changePercent?.toFixed(2)}%)</span>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            {portfolio && <EditPortfolioDialog portfolioId={portfolioId} userId={portfolio.userId} initialName={portfolio.name} initialDescription={portfolio.description} />}
            <AddAssetDialog portfolioId={portfolioId} />
            <EditAssetDialog isOpen={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} asset={editingAsset} onAssetUpdated={() => setEditingAsset(null)} />
          </div>
        </div>

        <div className="h-px bg-border mb-8" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <AISummaryCard title="AI Summary" headline={portfolio?.aiHeadline || "Analysis"} content={portfolio?.aiSummary || "Analysis will appear once data is processed."} />
          <Card className="p-6"><p className="text-sm text-muted-foreground mb-1">Total Assets</p><p className="text-3xl font-bold text-foreground">{portfolio?.assets?.length || 0}</p><p className="text-xs text-muted-foreground mt-2">{new Set(portfolio?.assets?.map(a => a.type)).size || 0} asset categories</p></Card>
          <AssetAllocationPie value={portfolio?.currentValue || 0} assets={portfolio?.assets || []} />
        </div>

        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div><CardTitle>Performance</CardTitle><CardDescription>Historical returns</CardDescription></div>
            <Select value={chartDateRange} onValueChange={setChartDateRange}><SelectTrigger className="w-32"><Filter className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1M">1M</SelectItem><SelectItem value="3M">3M</SelectItem><SelectItem value="6M">6M</SelectItem><SelectItem value="1Y">1Y</SelectItem><SelectItem value="2Y">2Y</SelectItem><SelectItem value="5Y">5Y</SelectItem><SelectItem value="ALL">All</SelectItem></SelectContent></Select>
          </div>
          <PorfolioPerformanceChart data={chartData} />
        </Card>

        <Separator className="mb-0" /><PortfolioAnalytics portfolioId={portfolioId} /><Separator className="mb-6" />

        <h2 className="text-2xl font-bold text-foreground mb-6">Holdings</h2>
        {portfolio?.assets && portfolio.assets.length > 0 ? (
          Object.entries(assetsByType).map(([title, assets]) => <AssetSection key={title} title={title} assets={assets} onEdit={handleEditAsset} onDelete={handleDeleteAsset} />)
        ) : (
          <Card className="mb-6"><CardContent className="flex flex-col items-center justify-center py-10"><CircleSlash className="h-10 w-10 text-muted-foreground mb-4" /><p className="text-muted-foreground mb-2">No assets yet</p><AddAssetDialog portfolioId={portfolioId} /></CardContent></Card>
        )}
      </div>
    </div>
  );
}
