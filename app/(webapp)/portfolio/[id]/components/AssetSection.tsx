"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssetRow } from "./AssetRow";
import { Asset } from "./types";
import { getAssetConfig } from "./AssetRowConfig";

export function AssetSection({
  title,
  assets,
  onEdit,
  onDelete,
}: {
  title: string;
  assets: Asset[];
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
}) {
  if (assets.length === 0) {
    return null;
  }

  // Get configuration for this asset type
  const config = getAssetConfig(assets[0].type);

  return (
    <Card className="mb-6 pt-6 pb-0">
      <CardHeader>
        <CardTitle>
          {title} ({assets.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex items-center gap-4 py-3 px-6 border-b border-border bg-muted/30">
          <div className="flex-1 font-medium text-foreground">Asset</div>

          {config.value && (
            <div className="min-w-[100px] text-right font-medium text-foreground">
              Value
            </div>
          )}

          {config.avgBuyPrice && (
            <div className="min-w-[100px] text-right font-medium text-foreground">
              Avg Buy
            </div>
          )}

          {config.currentPrice && (
            <div className="min-w-[100px] text-right font-medium text-foreground">
              Current
            </div>
          )}

          {config.currency && (
            <div className="min-w-[100px] text-right font-medium text-foreground">
              Currency
            </div>
          )}

          {config.change && (
            <div className="min-w-[120px] text-right font-medium text-foreground">
              Change
            </div>
          )}

          {config.allocation && (
            <div className="min-w-[80px] text-right font-medium text-foreground">
              Allocation
            </div>
          )}

          <div className="w-10"></div>
        </div>

        {assets.map((asset) => (
          <AssetRow
            key={asset._id}
            asset={asset}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </CardContent>
    </Card>
  );
}
