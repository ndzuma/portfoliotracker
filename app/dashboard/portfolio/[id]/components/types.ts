/**
 * Shared type definitions for portfolio assets
 */

export interface Asset {
  _id: string;
  id?: string; // For backward compatibility if needed
  symbol?: string;
  name: string;
  type:
    | "stock"
    | "real estate"
    | "commodity"
    | "bond"
    | "cash"
    | "crypto"
    | "other";
  currentValue: number;
  change: number;
  changePercent: number;
  allocation: number;
  quantity?: number;
  avgBuyPrice: number;
  currentPrice: number;
  currency?: string;
  // Additional fields that may come from API
  _creationTime?: number;
  notes?: string;
  portfolioId?: any;
}
