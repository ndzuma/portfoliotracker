/**
 * Configuration for which asset attributes are displayed based on asset type
 * This allows for a more flexible display without using placeholders like "-" or "N/A"
 */

export interface AssetAttributesConfig {
  // Core attributes that are always displayed
  asset: boolean; // Asset name and symbol
  value: boolean; // Current total value

  // Optional attributes that depend on asset type
  avgBuyPrice: boolean;
  currentPrice: boolean;
  change: boolean;
  allocation: boolean;
  quantity: boolean;
  currency: boolean;
}

type AssetTypeConfig = {
  [key in 'stock' | 'real estate' | 'commodity' | 'bond' | 'cash' | 'crypto' | 'other']: AssetAttributesConfig;
};

export const assetAttributesConfig: AssetTypeConfig = {
  stock: {
    asset: true,
    value: true,
    avgBuyPrice: true,
    currentPrice: true,
    change: true,
    allocation: true,
    quantity: true,
    currency: false
  },
  crypto: {
    asset: true,
    value: true,
    avgBuyPrice: true,
    currentPrice: true,
    change: true,
    allocation: true,
    quantity: true,
    currency: false
  },
  "real estate": {
    asset: true,
    value: true,
    avgBuyPrice: false,
    currentPrice: false,
    change: true,
    allocation: true,
    quantity: false,
    currency: false
  },
  commodity: {
    asset: true,
    value: true,
    avgBuyPrice: true,
    currentPrice: true,
    change: true,
    allocation: true,
    quantity: true,
    currency: false
  },
  bond: {
    asset: true,
    value: true,
    avgBuyPrice: true,
    currentPrice: true,
    change: true,
    allocation: true,
    quantity: true,
    currency: false
  },
  cash: {
    asset: true,
    value: true,
    avgBuyPrice: false,
    currentPrice: false,
    change: false,
    allocation: true,
    quantity: false,
    currency: true
  },
  other: {
    asset: true,
    value: true,
    avgBuyPrice: true,
    currentPrice: true,
    change: true,
    allocation: true,
    quantity: true,
    currency: false
  }
};

export function getAssetConfig(assetType: string): AssetAttributesConfig {
  return assetAttributesConfig[assetType as keyof typeof assetAttributesConfig] ||
         assetAttributesConfig.other;
}
