"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ExternalLink, Edit, Trash2 } from "lucide-react";

import { Asset } from "./types";

export function AssetRow({
  asset,
  onEdit,
  onDelete,
}: {
  asset: Asset;
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
}) {
  const isPositive = asset.change >= 0;

  const getAssetLink = (asset: Asset) => {
    if (asset.type === "crypto") {
      return `https://www.coingecko.com/en/coins/${asset.name}`;
    }
    if (asset.type === "stock" || asset.type === "bond") {
      return `https://finance.yahoo.com/quote/${asset.symbol}`;
    }
    return null;
  };

  const assetLink = getAssetLink(asset);

  return (
    <div className="flex items-center gap-4 py-4 px-6 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{asset.symbol}</h3>
              {assetLink && (
                <a
                  href={assetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{asset.name}</p>
          </div>
        </div>
      </div>

      <div className="text-right min-w-[100px]">
        <div className="font-semibold">
          ${asset.currentValue.toLocaleString()}
        </div>
        <div className="text-sm text-muted-foreground">
          {asset.quantity} shares
        </div>
      </div>

      <div className="text-right min-w-[100px]">
        <div className="font-medium">${asset.avgBuyPrice.toFixed(2)}</div>
        <div className="text-sm text-muted-foreground">Avg Buy</div>
      </div>

      <div className="text-right min-w-[100px]">
        <div className="font-medium">${asset.currentPrice.toFixed(2)}</div>
        <div className="text-sm text-muted-foreground">Current</div>
      </div>

      <div className="text-right min-w-[120px]">
        <div
          className={`font-medium ${isPositive ? "text-primary" : "text-secondary"}`}
        >
          {isPositive ? "+" : ""}${Math.abs(asset.change).toLocaleString()}
        </div>
        <div
          className={`text-sm ${isPositive ? "text-primary" : "text-secondary"}`}
        >
          ({isPositive ? "+" : ""}
          {asset.changePercent.toFixed(2)}%)
        </div>
      </div>

      <div className="text-right min-w-[80px]">
        <div className="font-medium">{asset.allocation.toFixed(1)}%</div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(asset)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Asset
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(asset._id)}
            className="text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Asset
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
