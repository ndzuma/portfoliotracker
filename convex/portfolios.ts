import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const aiPlaceholderSummary =
  "Strong tech performance (+18.2% MTD)** driving growth, but **underweight on dividends (2.3%)**. Consider adding **renewable energy stocks** and **international equities** (5-10%) to enhance diversification. Current **cash position (12%)** appropriate amid market volatility.";
const aiPlaceholderHeadline = "Portfolio Diversification Analysis";

// Get all portfolios for a user with computed fields
export const getUserPorfolios = query({
  args: {
    userId: v.optional(v.union(v.id("users"), v.string())),
  },
  handler: async (ctx, args) => {
    // Return empty array if userId is not provided
    if (!args.userId) {
      return [];
    }

    const portfolios = await ctx.db
      .query("portfolios")
      .withIndex("byUser", (q) => q.eq("userId", args.userId))
      .collect();

    const results = await Promise.all(
      portfolios.map(async (p) => {
        const assets = await ctx.db
          .query("assets")
          .withIndex("byPortfolio", (q) => q.eq("portfolioId", p._id))
          .collect();
        const assetIds = assets.map((a) => a._id);
        const transactionsByAsset: Record<string, any[]> = {};
        for (const assetId of assetIds) {
          const txns = await ctx.db
            .query("transactions")
            .withIndex("byAsset", (q) => q.eq("assetId", assetId))
            .collect();

          transactionsByAsset[assetId] = txns;
        }

        let portfolioCostBasis = 0;
        let portfolioCurrentValue = 0;

        for (const asset of assets) {
          const txns = transactionsByAsset[asset._id] || [];

          const quantity = txns.reduce(
            (q, t) => q + (t.type === "buy" ? t.quantity : -t.quantity),
            0,
          );
          const totalCost = txns.reduce(
            (sum, t) => sum + (t.type === "buy" ? t.quantity * t.price : 0),
            0,
          );

          // Check if there's a current price in marketCurrentData table
          let currentPrice = asset.currentPrice || 1;
          if (asset.symbol && typeof asset.symbol === "string") {
            const marketData = await ctx.db
              .query("marketCurrentData")
              .withIndex("byTicker", (q) => q.eq("ticker", asset.symbol))
              .first();
            if (marketData && marketData.price) {
              currentPrice = marketData.price;
            }
          }
          const currentValue = quantity * currentPrice;

          portfolioCostBasis += totalCost;
          portfolioCurrentValue += currentValue;
        }
        const change = portfolioCurrentValue - portfolioCostBasis;
        const changePercent = portfolioCostBasis
          ? (change / portfolioCostBasis) * 100
          : 0;

        return {
          ...p,
          costBasis: portfolioCostBasis,
          currentValue: portfolioCurrentValue,
          change,
          changePercent,
          assetsCount: assets.length,
        };
      }),
    );

    return results;
  },
});

export const canUserAccessPortfolio = query({
  args: {
    portfolioId: v.union(v.id("portfolios"), v.string()),
  },
  handler: async (ctx, args) => {
    const isUsers = await ctx.auth.getUserIdentity();
    if (!isUsers) {
      return false;
    }
    const { subject } = isUsers;
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), subject))
      .first();

    const portfolio = await ctx.db.get(args.portfolioId);
    if (!portfolio) {
      return false;
    }
    if (portfolio.userId !== user?._id) {
      return false;
    }
    return true;
  },
});

// Get a single portfolio by ID with computed fields and AI summary
export const getPortfolioById = query({
  args: {
    portfolioId: v.union(v.id("portfolios"), v.string()),
  },
  handler: async (ctx, args) => {
    const assets = await ctx.db
      .query("assets")
      .withIndex("byPortfolio", (q) => q.eq("portfolioId", args.portfolioId))
      .collect();
    const assetIds = assets.map((a) => a._id);
    const transactionsByAsset: Record<string, any[]> = {};
    for (const assetId of assetIds) {
      const txns = await ctx.db
        .query("transactions")
        .withIndex("byAsset", (q) => q.eq("assetId", assetId))
        .collect();

      transactionsByAsset[assetId] = txns;
    }

    let portfolioCostBasis = 0;
    let portfolioCurrentValue = 0;

    for (const asset of assets) {
      const txns = transactionsByAsset[asset._id] || [];

      const quantity = txns.reduce(
        (q, t) => q + (t.type === "buy" ? t.quantity : -t.quantity),
        0,
      );
      const totalCost = txns.reduce(
        (sum, t) => sum + (t.type === "buy" ? t.quantity * t.price : 0),
        0,
      );
      const averageBuyPrice = quantity ? totalCost / quantity : 0;

      // Check if there's a current price in marketCurrentData table
      let currentPrice = asset.currentPrice || 1;
      if (asset.symbol && typeof asset.symbol === "string") {
        const marketData = await ctx.db
          .query("marketCurrentData")
          .withIndex("byTicker", (q) => q.eq("ticker", asset.symbol))
          .first();
        if (marketData && marketData.price) {
          currentPrice = marketData.price;
        }
      }
      const currentValue = quantity * currentPrice;

      asset.currentPrice = currentPrice;
      asset.quantity = quantity;
      asset.avgBuyPrice = averageBuyPrice;
      asset.costBasis = totalCost;
      asset.currentValue = currentValue;
      asset.change = currentValue - totalCost;
      asset.changePercent = totalCost
        ? ((currentValue - totalCost) / totalCost) * 100
        : 0;

      portfolioCostBasis += totalCost;
      portfolioCurrentValue += currentValue;
    }

    for (const asset of assets) {
      asset.allocation = portfolioCurrentValue
        ? (asset.currentValue / portfolioCurrentValue) * 100
        : 0;
    }

    // Get the portfolio information
    const portfolio = await ctx.db.get(args.portfolioId);
    if (!portfolio) {
      throw new Error("Portfolio not found");
    }

    let aiHeadline = "";
    let aiSummary = "";

    if (assets.length === 0) {
      aiHeadline = "No assets in portfolio";
      aiSummary = "Add assets to your portfolio to get insights.";
    } else {
      const latestSnapshot = await ctx.db
        .query("portfolioSnapshots")
        .withIndex("byPortfolio", (q) => q.eq("portfolioId", args.portfolioId))
        .first();
      if (
        latestSnapshot &&
        latestSnapshot.aiHeadline &&
        latestSnapshot.aiSummary
      ) {
        aiHeadline = latestSnapshot.aiHeadline;
        aiSummary = latestSnapshot.aiSummary;
      } else {
        // temporary placeholder until AI integration is done
        aiHeadline = aiPlaceholderHeadline;
        aiSummary = aiPlaceholderSummary;
      }
    }

    const result = {
      ...portfolio,
      aiHeadline,
      aiSummary,
      costBasis: portfolioCostBasis,
      currentValue: portfolioCurrentValue,
      change: portfolioCurrentValue - portfolioCostBasis || 0,
      changePercent: portfolioCostBasis
        ? ((portfolioCurrentValue - portfolioCostBasis) / portfolioCostBasis) *
          100
        : 0 || 0,
      assets: assets,
    };
    return result;
  },
});

// Create a new portfolio
export const createPortfolio = mutation({
  args: {
    userId: v.union(v.id("users"), v.string()),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
  },
});

// Update an existing portfolio
export const updatePortfolio = mutation({
  args: {
    portfolioId: v.union(v.id("portfolios"), v.string()),
    userId: v.union(v.id("users"), v.string()),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const portfolio = await ctx.db.get(args.portfolioId);
    if (!portfolio) {
      throw new Error("Portfolio not found");
    }
    if (portfolio.userId !== args.userId) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(args.portfolioId, {
      name: args.name ?? portfolio.name,
      description: args.description ?? portfolio.description,
    });
  },
});

// Delete a portfolio and its associated assets and transactions
export const deletePortfolio = mutation({
  args: {
    portfolioId: v.union(v.id("portfolios"), v.string()),
    userId: v.union(v.id("users"), v.string()),
  },
  handler: async (ctx, args) => {
    const portfolio = await ctx.db.get(args.portfolioId as v.id<"portfolios">);
    if (!portfolio) {
      throw new Error("Portfolio not found");
    }
    if (portfolio.userId !== args.userId) {
      throw new Error("Unauthorized");
    }

    // Delete associated assets and their transactions
    const assets = await ctx.db
      .query("assets")
      .withIndex("byPortfolio", (q) => q.eq("portfolioId", portfolio._id))
      .collect();

    for (const asset of assets) {
      // Delete transactions for this asset
      const transactions = await ctx.db
        .query("transactions")
        .withIndex("byAsset", (q) => q.eq("assetId", asset._id))
        .collect();

      for (const txn of transactions) {
        await ctx.db.delete(txn._id);
      }

      // Delete the asset
      await ctx.db.delete(asset._id);
    }

    // Finally, delete the portfolio
    await ctx.db.delete(args.portfolioId);
  },
});
