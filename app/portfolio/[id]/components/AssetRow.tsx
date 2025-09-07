"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  ExternalLink,
  Edit,
  Trash2,
  Receipt,
} from "lucide-react";
import { Asset } from "./types";
import { getAssetConfig } from "./AssetRowConfig";
import { TransactionDialog } from "./dialogs/TransactionDialog";
import { formatCurrency, convertFromUSD } from "@/lib/currency";

export function AssetRow({
  asset,
  onEdit,
  onDelete,
  userCurrency = "USD",
  fxRate = 1,
}: {
  asset: Asset;
  onEdit: (asset: Asset) => void;
  onDelete: (id: string) => void;
  userCurrency?: string;
  fxRate?: number;
}) {
  const isPositive = asset.change >= 0;
  const config = getAssetConfig(asset.type);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);

  // Helper function to convert USD values to user's currency
  const convertValue = (usdValue: number) => {
    return convertFromUSD(usdValue, userCurrency, fxRate);
  };

  const getAssetLink = (asset: Asset) => {
    if (asset.type === "crypto" && asset.symbol) {
      return `https://www.coingecko.com/en/coins/${asset.symbol.toLowerCase()}`;
    }
    if (asset.type === "stock" && asset.symbol) {
      return `https://finance.yahoo.com/quote/${asset.symbol}`;
    }
    if (asset.type === "bond" && asset.symbol) {
      return `https://finance.yahoo.com/quote/${asset.symbol}`;
    }
    return null;
  };

  const assetLink = getAssetLink(asset);

  return (
    <>
      <div className="flex items-center gap-4 py-4 px-6 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">
                  {asset.symbol}
                </h3>
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

        {config.value && (
          <div className="text-right min-w-[100px]">
            <div className="font-semibold">
              {formatCurrency(convertValue(asset.currentValue), userCurrency)}
            </div>
            {config.quantity ? (
              <div className="text-sm text-muted-foreground">
                {asset.type === "real estate"
                  ? "1 property"
                  : asset.type === "cash"
                    ? "Cash"
                    : `${asset.quantity} ${asset.type === "crypto" ? "units" : "shares"}`}
              </div>
            ) : null}
          </div>
        )}

        {config.avgBuyPrice && (
          <div className="text-right min-w-[100px]">
            <div className="font-medium">{formatCurrency(convertValue(asset.avgBuyPrice), userCurrency)}</div>
            <div className="text-sm text-muted-foreground">Avg Buy</div>
          </div>
        )}

        {config.currentPrice && (
          <div className="text-right min-w-[100px]">
            <div className="font-medium">{formatCurrency(convertValue(asset.currentPrice), userCurrency)}</div>
            <div className="text-sm text-muted-foreground">Current</div>
          </div>
        )}

        {config.currency && asset.currency && (
          <div className="text-right min-w-[100px]">
            <div className="font-medium">{asset.currency}</div>
            <div className="text-sm text-muted-foreground">Currency</div>
          </div>
        )}

        {config.change && (
          <div className="text-right min-w-[120px]">
            <div
              className={`font-medium ${isPositive ? "text-primary" : "text-secondary"}`}
            >
              {isPositive ? "+" : ""}{formatCurrency(Math.abs(convertValue(asset.change)), userCurrency)}
            </div>
            <div
              className={`text-sm ${isPositive ? "text-primary" : "text-secondary"}`}
            >
              ({isPositive ? "+" : ""}
              {asset.changePercent.toFixed(2)}%)
            </div>
          </div>
        )}

        {config.allocation && (
          <div className="text-right min-w-[80px]">
            <div className="font-medium">{asset.allocation.toFixed(1)}%</div>
          </div>
        )}

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsTransactionDialogOpen(true)}>
                <Receipt className="h-4 w-4 mr-2" />
                View Transactions 
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(asset)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit 
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(asset._id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Transaction Dialog */}
      <TransactionDialog
        isOpen={isTransactionDialogOpen}
        onOpenChange={setIsTransactionDialogOpen}
        assetId={asset._id}
        assetName={asset.name}
        assetType={asset.type}
        assetSymbol={asset.symbol}
      />
    </>
  );
}
