"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { BarChart4 } from "lucide-react";

export function MarketOverviewCard() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Market Overview</CardTitle>
          <BarChart4 className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">S&P 500</span>
            <div className="flex items-center">
              <span className="text-sm font-medium text-primary">+1.2%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Nasdaq</span>
            <div className="flex items-center">
              <span className="text-sm font-medium text-primary">+1.5%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Dow Jones</span>
            <div className="flex items-center">
              <span className="text-sm font-medium text-primary">+0.8%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">10Y Treasury</span>
            <div className="flex items-center">
              <span className="text-sm font-medium text-secondary">-0.3%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
