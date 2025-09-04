import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // user profiles
  users: defineTable({
    name: v.string(),
    email: v.string(),
    clerkId: v.optional(v.string()),
  }),
  // user settings and preferences
  userPreferences: defineTable({
    userId: v.id("users"),
    theme: v.union(v.literal("light"), v.literal("dark")),
    currency: v.string(),
    language: v.string(),
  }).index("byUser", ["userId"]),
  // portfolios, assets, transactions, and snapshots
  portfolios: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    includeInNetworth: v.optional(v.boolean()),
    allowSubscriptions: v.optional(v.boolean()),
  }).index("byUser", ["userId"]),
  assets: defineTable({
    portfolioId: v.id("portfolios"),
    symbol: v.optional(v.string()),
    name: v.string(),
    type: v.union(
      v.literal("stock"),
      v.literal("bond"),
      v.literal("commodity"),
      v.literal("real estate"),
      v.literal("cash"),
      v.literal("crypto"),
      v.literal("other"),
    ),
    currentPrice: v.optional(v.number()),
    currency: v.optional(v.string()),
    notes: v.optional(v.string()),
  }).index("byPortfolio", ["portfolioId"]),
  transactions: defineTable({
    assetId: v.id("assets"),
    type: v.union(v.literal("buy"), v.literal("sell"), v.literal("dividend")),
    date: v.number(),
    quantity: v.optional(v.number()), // Optional for dividends
    price: v.optional(v.number()), // Optional for dividends
    fees: v.optional(v.number()),
    notes: v.optional(v.string()),
  }).index("byAsset", ["assetId", "date"]),
  portfolioSnapshots: defineTable({
    portfolioId: v.id("portfolios"),
    date: v.number(),
    totalValue: v.number(),
    aiHeadline: v.optional(v.string()),
    aiSummary: v.optional(v.string()),
  }).index("byPortfolio", ["portfolioId", "date"]),
  assetSnapshots: defineTable({
    assetId: v.id("assets"),
    date: v.number(),
    currentPrice: v.number(),
    quantity: v.number(),
    totalValue: v.number(),
  }).index("byAsset", ["assetId", "date"]),
  // marketHistoricData
  marketHistoricData: defineTable({
    ticker: v.string(),
    date: v.string(),
    open: v.number(),
    high: v.number(),
    low: v.number(),
    close: v.number(),
    volume: v.number(),
  }).index("byTicker", ["ticker", "date"]),
  marketCurrentData: defineTable({
    ticker: v.string(),
    logo: v.optional(v.string()),
    name: v.optional(v.string()),
    type: v.union(
      v.literal("stock"),
      v.literal("bond"),
      v.literal("commodity"),
      v.literal("real estate"),
      v.literal("cash"),
      v.literal("crypto"),
      v.literal("other"),
    ),
    price: v.number(),
    updatedAt: v.number(),
  }).index("byTicker", ["ticker"]),
  marketBenchmarks: defineTable({
    name: v.string(),
    ticker: v.string(),
    exchange: v.optional(v.string()),
    percentageChange: v.optional(v.number()),
    close: v.number(),
    isMarketOpen: v.boolean(),
    updatedAt: v.number(),
  }).index("byTicker", ["ticker"]),
  // documents for user-uploaded files
  userDocuments: defineTable({
    storageId: v.union(v.string(), v.id("_storage")),
    userId: v.union(v.string(), v.id("users")),
    portfolioId: v.optional(v.union(v.string(), v.id("portfolios"))),
    fileName: v.string(),
    format: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("Strategy Document"),
        v.literal("Account Statement"),
        v.literal("Research Report"),
        v.literal("Tax Document"),
        v.literal("Annual Report"),
        v.literal("Other"),
      ),
    ),
    updatedAt: v.number(),
  })
    .index("byUser", ["userId", "portfolioId"])
    .index("byPortfolio", ["portfolioId"]),
  // user articles
  userArticles: defineTable({
    userId: v.union(v.string(), v.id("users")),
    portfolioId: v.optional(v.union(v.string(), v.id("portfolios"))),
    title: v.string(),
    url: v.string(),
  }).index("byUser", ["userId"]),
});
