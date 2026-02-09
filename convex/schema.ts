import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // user profiles
  users: defineTable({
    name: v.string(),
    email: v.string(),
    clerkId: v.optional(v.string()),
    isAdmin: v.optional(v.boolean()),
    hasOnboarded: v.optional(v.boolean()),
  }),
  // user settings and preferences
  userPreferences: defineTable({
    userId: v.id("users"),
    theme: v.union(v.literal("light"), v.literal("dark")),
    currency: v.string(),
    language: v.string(),
    aiProvider: v.optional(v.string()),
    openRouterApiKey: v.optional(v.string()),
    tunnelId: v.optional(v.string()),
    selfHostedUrl: v.optional(v.string()),
  }).index("byUser", ["userId"]),
  // development related
  flags: defineTable({
    key: v.string(), // "new-portfolio-chart"
    enabled: v.boolean(),
    description: v.optional(v.string()),
    targeting: v.optional(
      v.array(v.union(v.literal("all"), v.literal("beta"), v.string())),
    ), // userIds/emails
    environments: v.array(v.union(v.literal("dev"), v.literal("prod"))), // ["dev", "prod"]
  })
    .index("by_key", ["key"])
    .index("by_env", ["environments"]),
  // portfolios, assets, transactions, and snapshots
  portfolios: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    includeInNetworth: v.optional(v.boolean()),
    allowSubscriptions: v.optional(v.boolean()),
    riskTolerance: v.optional(
      v.union(
        v.literal("Conservative"),
        v.literal("Moderate"),
        v.literal("Aggressive"),
      ),
    ),
    timeHorizon: v.optional(
      v.union(
        v.literal("Short-term (< 3 years)"),
        v.literal("Medium-term (3-10 years)"),
        v.literal("Long-term (10+ years)"),
      ),
    ),
  })
    .index("byUser", ["userId"])
    .searchIndex("searchPortfolios", {
      searchField: "name",
      filterFields: ["userId"],
    }),
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
  })
    .index("byPortfolio", ["portfolioId"])
    .searchIndex("searchAssets", {
      searchField: "name",
      filterFields: ["portfolioId"],
    }),
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
  }).index("byPortfolio", ["portfolioId", "date"]),
  // portfolio AI summaries
  portfolioAiSummary: defineTable({
    portfolioId: v.id("portfolios"),
    analysis: v.string(),
    headline: v.optional(v.string()),
    modelUsed: v.string(),
    headlineModelUsed: v.optional(v.string()),
    tokensUsed: v.number(),
    headlineTokensUsed: v.optional(v.number()),
    processingTimeMs: v.number(),
    headlineGenerationTimeMs: v.optional(v.number()),
    timestamp: v.number(),
    taskType: v.optional(v.string()),
    apiVersion: v.optional(v.string()),
  }).index("byPortfolio", ["portfolioId", "timestamp"]),
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
  marketNewsSummary: defineTable({
    analysis: v.string(),
    headline: v.optional(v.string()),
    modelUsed: v.string(),
    tokensUsed: v.number(),
    processingTimeMs: v.number(),
    timestamp: v.number(),
  }).index("byTimestamp", ["timestamp"]),
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
        v.literal("Portfolio Thesis"),
        v.literal("Research Report"),
        v.literal("Annual Report"),
        v.literal("Tax Document"),
        v.literal("Other"),
      ),
    ),
    updatedAt: v.number(),
  })
    .index("byUser", ["userId", "portfolioId"])
    .index("byPortfolio", ["portfolioId"])
    .searchIndex("searchDocuments", {
      searchField: "fileName",
      filterFields: ["userId"],
    }),
  // user articles
  userArticles: defineTable({
    userId: v.union(v.string(), v.id("users")),
    portfolioId: v.optional(v.union(v.string(), v.id("portfolios"))),
    title: v.string(),
    url: v.string(),
    notes: v.optional(v.string()),
  })
    .index("byUser", ["userId"])
    .searchIndex("searchArticles", {
      searchField: "title",
      filterFields: ["userId"],
    }),
  // calendar events
  calendarEvents: defineTable({
    date: v.string(), // YYYY-MM-DD
    title: v.string(),
    description: v.optional(v.string()),
  }).index("byDate", ["date"]),
  // portfolio goals — individual goals per portfolio
  portfolioGoals: defineTable({
    portfolioId: v.id("portfolios"),
    name: v.string(),
    type: v.union(
      v.literal("portfolio_value"),
      v.literal("annualized_return"),
      v.literal("ytd_return"),
      v.literal("custom"),
    ),
    targetValue: v.number(),
    currentValue: v.optional(v.number()),
    unit: v.union(v.literal("currency"), v.literal("percentage")),
    metricKey: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    deadline: v.optional(v.number()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("byPortfolio", ["portfolioId"]),
});
