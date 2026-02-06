"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  ArrowLeft, TrendingUp, TrendingDown, Briefcase, Newspaper,
  Settings, BarChart3, LayoutDashboard, Sparkles, Filter,
  CircleSlash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

function InvestaSidebar() {
  const { user } = useUser();
  const pathname = usePathname();
  const mainNav = [
    { name: "Overview", href: "/redesign/6", icon: LayoutDashboard },
    { name: "News", href: "/news", icon: Newspaper },
    { name: "Portfolio", href: "/redesign/6", icon: Briefcase, active: true },
    { name: "Analytics", href: "/watchlist", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];
  return (
    <aside className="w-64 border-r border-border bg-card/50 h-full flex flex-col shrink-0">
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><Briefcase className="h-4 w-4 text-primary-foreground" /></div>
          <span className="font-bold text-foreground text-lg">PulsePortfolio</span>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {mainNav.map((item) => {
            const isActive = item.active;
            return (
              <li key={item.name}>
                <Link href={item.href} className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${isActive ? "bg-primary/10 text-primary border-l-2 border-primary ml-0 pl-2.5" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                  <item.icon className="h-5 w-5" /><span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-3">
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-9 h-9" }, baseTheme: dark }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user?.fullName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.emailAddresses[0]?.emailAddress}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function Redesign6Portfolio() {
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

  const stockAssets = portfolio?.assets.filter((a) => a.type === "stock") || [];
  const cryptoAssets = portfolio?.assets.filter((a) => a.type === "crypto") || [];
  const propertyAssets = portfolio?.assets.filter((a) => a.type === "real estate") || [];
  const commodityAssets = portfolio?.assets.filter((a) => a.type === "commodity") || [];
  const bondAssets = portfolio?.assets.filter((a) => a.type === "bond") || [];
  const cashAssets = portfolio?.assets.filter((a) => a.type === "cash") || [];
  const otherAssets = portfolio?.assets.filter((a) => a.type === "other") || [];

  const handleEditAsset = (asset: Asset) => { if (asset.type === "cash" && !asset.currency) asset.currency = "USD"; setEditingAsset(asset); setIsEditDialogOpen(true); };
  const handleDeleteAsset = (id: string) => { if (confirm("Delete this asset?")) deleteAsset({ assetId: id as Id<"assets"> }); };

  if (!canUserAccess) {
    return (<div className="min-h-screen flex items-center justify-center bg-background"><div className="text-center"><h1 className="text-2xl font-semibold text-foreground mb-4">Access Denied</h1><Link href="/redesign/6"><Button variant="ghost"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button></Link></div></div>);
  }

  return (
    <div className="flex h-[calc(100vh-40px)] bg-background">
      <InvestaSidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1100px] mx-auto p-6">
          <Link href="/redesign/6"><Button variant="ghost" size="sm" className="mb-4"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button></Link>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-foreground mb-2">{portfolio?.name || "Loading..."}</h1>
              <p className="text-muted-foreground">{portfolio?.description}</p>
            </div>
            <div className="flex gap-3">
              {portfolio && <EditPortfolioDialog portfolioId={portfolioId} userId={portfolio.userId} initialName={portfolio.name} initialDescription={portfolio.description} />}
              <AddAssetDialog portfolioId={portfolioId} />
              <EditAssetDialog isOpen={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} asset={editingAsset} onAssetUpdated={() => setEditingAsset(null)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-6"><p className="text-sm text-muted-foreground mb-1">Total Value</p><p className="text-2xl font-bold text-foreground">${portfolio?.currentValue?.toLocaleString()}</p><div className={`text-sm flex items-center gap-1 mt-2 ${(portfolio?.change||0) >= 0 ? "text-primary" : "text-secondary"}`}>{(portfolio?.change||0) >= 0 ? <TrendingUp className="h-4 w-4"/> : <TrendingDown className="h-4 w-4"/>}{(portfolio?.change||0) >= 0 ? "+" : ""}${Math.abs(portfolio?.change||0).toLocaleString()} ({portfolio?.changePercent?.toFixed(2)}%)</div></Card>
            <Card className="p-6"><p className="text-sm text-muted-foreground mb-1">Assets</p><p className="text-2xl font-bold text-foreground">{portfolio?.assets?.length || 0}</p><p className="text-xs text-muted-foreground mt-2">Across {new Set(portfolio?.assets?.map(a => a.type)).size || 0} categories</p></Card>
            <AISummaryCard title="AI Summary" headline={portfolio?.aiHeadline || "Analysis"} content={portfolio?.aiSummary || "Analysis will appear once data is processed."} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div><CardTitle>Performance</CardTitle><CardDescription>Over time</CardDescription></div>
                  <Select value={chartDateRange} onValueChange={setChartDateRange}><SelectTrigger className="w-32"><Filter className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1M">1M</SelectItem><SelectItem value="3M">3M</SelectItem><SelectItem value="6M">6M</SelectItem><SelectItem value="1Y">1Y</SelectItem><SelectItem value="2Y">2Y</SelectItem><SelectItem value="5Y">5Y</SelectItem><SelectItem value="ALL">All</SelectItem></SelectContent></Select>
                </div>
                <PorfolioPerformanceChart data={chartData} />
              </Card>
            </div>
            <AssetAllocationPie value={portfolio?.currentValue || 0} assets={portfolio?.assets || []} />
          </div>

          <Separator className="mb-0" /><PortfolioAnalytics portfolioId={portfolioId} /><Separator className="mb-6" />

          <h2 className="text-2xl font-semibold text-foreground mb-6">Holdings</h2>
          {portfolio?.assets && portfolio.assets.length > 0 ? (
            <>{[["Stocks",stockAssets],["Crypto",cryptoAssets],["Real Estate",propertyAssets],["Commodities",commodityAssets],["Bonds",bondAssets],["Cash",cashAssets],["Other",otherAssets]].map(([t,a]) => <AssetSection key={t as string} title={t as string} assets={a as any[]} onEdit={handleEditAsset} onDelete={handleDeleteAsset} />)}</>
          ) : (
            <Card className="mb-6"><CardContent className="flex flex-col items-center justify-center py-10"><CircleSlash className="h-10 w-10 text-muted-foreground mb-4" /><p className="text-muted-foreground mb-2">No assets yet</p><AddAssetDialog portfolioId={portfolioId} /></CardContent></Card>
          )}
        </div>
      </main>
    </div>
  );
}
