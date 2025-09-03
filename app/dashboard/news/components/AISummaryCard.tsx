"use client";

import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export function AISummaryCard() {
  return (
    <Card className="p-6 bg-[radial-gradient(circle_at_top_left,_#8d745d_0%,_transparent_30%)] border-[#8d745d] h-full">
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium text-foreground">
            Market Intelligence
          </h3>
        </div>
        <p className="text-sm font-medium mb-2 text-primary">
          Daily AI Market Summary
        </p>
        <div className="text-sm text-muted-foreground leading-relaxed">
          <p className="mb-3">
            <span className="font-medium text-foreground">
              Key Themes Today:
            </span>{" "}
            Fed policy shifts, market liquidity concerns, and tech sector
            volatility dominate headlines.
          </p>
          <p className="mb-3">
            <span className="font-medium text-foreground">Analysis:</span> The
            Federal Reserve's potential pause in balance sheet reduction signals
            concern about market liquidity. This comes amid mixed economic
            signals, with inflation showing signs of moderation but still above
            target levels.
          </p>
          <p>
            <span className="font-medium text-foreground">
              Portfolio Impact:
            </span>{" "}
            Consider increasing allocations to financial sector stocks which
            typically benefit from stabilizing interest rate expectations.
            Maintain diversification as market volatility may increase during
            this transitional period.
          </p>
        </div>
        <div className="mt-auto pt-4 text-xs text-muted-foreground italic">
          <p className="font-semibold">AI Risk Warning:</p>
          <p>
            This AI-generated market summary is for informational purposes only
            and should not be considered financial advice. Always consult with a
            qualified financial advisor before making investment decisions.
          </p>
        </div>
      </div>
    </Card>
  );
}
