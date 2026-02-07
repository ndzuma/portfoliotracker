import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

// Type definitions
export interface Asset {
  _id: string;
  id: string;
  symbol: string;
  name: string;
  type:
    | "stock"
    | "bond"
    | "commodity"
    | "real estate"
    | "crypto"
    | "cash"
    | "other";
  value: number;
  change: number;
  changePercent: number;
  allocation: number;
  shares?: number;
  quantity?: number;
  avgBuyPrice: number;
  currentPrice: number;
  currentValue: number;
  currency?: string;
}

export interface Portfolio {
  id: string;
  name: string;
  description: string;
  value: number;
  change: number;
  changePercent: number;
  stocks: number;
  modified: string;
  assets?: Asset[];
}

export interface Benchmark {
  id?: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

// Component definitions
export function AISummaryCard({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <Card className="p-6 bg-card border-border h-full">
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium text-foreground">{title}</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed flex-1">
          {content}
        </p>
      </div>
    </Card>
  );
}
