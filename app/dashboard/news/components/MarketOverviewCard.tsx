"use client";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { BarChart4 } from "lucide-react";

interface MarketData {
  _id: string;
  name: string;
  percentageChange: number;
  ticker: string;
}

export function MarketOverviewCard({
  data,
}:{
  data: MarketData[];
}) {
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
          {data.map((market) => (
            <div key={market._id} className="flex items-center justify-between">
              <span className="text-sm font-medium">{market.name}</span>
              <div className="flex items-center">
                <span className={`text-sm font-medium ${market.percentageChange >= 0 ? 'text-primary' : 'text-secondary'}`}>
                  {market.percentageChange >= 0 ? '+' : ''}
                  {market.percentageChange.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
