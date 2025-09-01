import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
  }),
  user_preferences: defineTable({
    userId: v.id("users"),
    theme: v.union(v.literal("light"), v.literal("dark"), v.literal("system")),
    currency: v.string(), // e.g., "USD", "EUR"
  }),
  portfolios: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
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
      v.literal("other")
    ),
    currentPrice: v.optional(v.number()),
    notes: v.optional(v.string()),
  }).index("byPortfolio", ["portfolioId"]),
  transactions: defineTable({
    assetId: v.id("assets"),
    type: v.union(
      v.literal("buy"), 
      v.literal("sell"), 
      v.literal("dividend"), 
    ),
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
  assetSnapshots: defineTable({
    assetId: v.id("assets"),
    date: v.number(),
    currentPrice: v.number(),
    quantity: v.number(),
    totalValue: v.number(),
  }).index("byAsset", ["assetId", "date"]),
});
