import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Create a new transaction
export const createTransaction = mutation({
  args: {
    assetId: v.id("assets"),
    type: v.union(v.literal("buy"), v.literal("sell"), v.literal("dividend")),
    date: v.number(), // timestamp
    quantity: v.optional(v.number()), // Required for buy/sell
    price: v.optional(v.number()), // Required for buy/sell
    fees: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const asset = await ctx.db.get(args.assetId);
    if (!asset) {
      throw new Error("Asset not found");
    }

    // Validate required fields based on transaction type
    if (
      (args.type === "buy" || args.type === "sell") &&
      (args.quantity === undefined || args.price === undefined)
    ) {
      throw new Error("Buy and sell transactions require quantity and price");
    }

    // Create the transaction
    const transactionId = await ctx.db.insert("transactions", {
      assetId: args.assetId,
      type: args.type,
      date: args.date,
      quantity: args.quantity,
      price: args.price,
      fees: args.fees || 0,
      notes: args.notes,
    });

    return transactionId;
  },
});

// Get all transactions for an asset
export const getAssetTransactions = query({
  args: {
    assetId: v.id("assets"),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("byAsset", (q) => q.eq("assetId", args.assetId))
      .order("desc")
      .collect();

    return transactions;
  },
});

// Get a single transaction by ID
export const getTransactionById = query({
  args: {
    transactionId: v.id("transactions"),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    return transaction;
  },
});

// Update an existing transaction
export const updateTransaction = mutation({
  args: {
    transactionId: v.id("transactions"),
    type: v.optional(
      v.union(v.literal("buy"), v.literal("sell"), v.literal("dividend")),
    ),
    date: v.optional(v.number()),
    quantity: v.optional(v.number()),
    price: v.optional(v.number()),
    fees: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Only update fields that were provided
    const updates: Record<string, any> = {};
    if (args.type !== undefined) updates.type = args.type;
    if (args.date !== undefined) updates.date = args.date;
    if (args.quantity !== undefined) updates.quantity = args.quantity;
    if (args.price !== undefined) updates.price = args.price;
    if (args.fees !== undefined) updates.fees = args.fees;
    if (args.notes !== undefined) updates.notes = args.notes;

    await ctx.db.patch(args.transactionId, updates);

    // Fetch the updated transaction
    const updatedTransaction = await ctx.db.get(args.transactionId);
    return updatedTransaction;
  },
});

// Delete a transaction
export const deleteTransaction = mutation({
  args: {
    transactionId: v.id("transactions"),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    await ctx.db.delete(args.transactionId);
    return true;
  },
});

// Get transaction statistics for an asset
export const getAssetTransactionStats = query({
  args: {
    assetId: v.id("assets"),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("byAsset", (q) => q.eq("assetId", args.assetId))
      .collect();

    let totalBuys = 0;
    let totalBuyAmount = 0;
    let totalSells = 0;
    let totalSellAmount = 0;
    let totalFees = 0;
    let totalDividends = 0;
    let avgBuyPrice = 0;
    let currentQuantity = 0;

    // Calculate statistics
    transactions.forEach((transaction) => {
      const quantity = transaction.quantity || 0;
      const price = transaction.price || 0;
      const amount = quantity * price;

      if (transaction.type === "buy") {
        totalBuys += quantity;
        totalBuyAmount += amount;
        currentQuantity += quantity;
      } else if (transaction.type === "sell") {
        totalSells += quantity;
        totalSellAmount += amount;
        currentQuantity -= quantity;
      } else if (transaction.type === "dividend") {
        totalDividends += price || 0;
      }

      totalFees += transaction.fees || 0;
    });

    // Calculate average buy price (if any buys)
    if (totalBuys > 0) {
      avgBuyPrice = totalBuyAmount / totalBuys;
    }

    return {
      totalBuys,
      totalBuyAmount,
      totalSells,
      totalSellAmount,
      totalFees,
      totalDividends,
      avgBuyPrice,
      currentQuantity,
      totalTransactions: transactions.length,
      netAmount: totalSellAmount + totalDividends - totalBuyAmount - totalFees,
      transactions: transactions.sort((a, b) => b.date - a.date).slice(0, 5), // Return 5 most recent transactions
    };
  },
});

// Get all transactions for a specific portfolio
export const getPortfolioTransactions = query({
  args: {
    portfolioId: v.id("portfolios"),
  },
  handler: async (ctx, args) => {
    // First get all assets in the portfolio
    const assets = await ctx.db
      .query("assets")
      .withIndex("byPortfolio", (q) => q.eq("portfolioId", args.portfolioId))
      .collect();

    const assetIds = assets.map((asset) => asset._id);

    // Get transactions for each asset and combine them
    let allTransactions: Array<any> = [];

    for (const assetId of assetIds) {
      const transactions = await ctx.db
        .query("transactions")
        .withIndex("byAsset", (q) => q.eq("assetId", assetId))
        .collect();

      // Add asset information to each transaction
      const assetInfo = assets.find((a) => a._id === assetId);
      const enrichedTransactions = transactions.map((t) => ({
        ...t,
        assetName: assetInfo?.name || "Unknown Asset",
        assetSymbol: assetInfo?.symbol,
        assetType: assetInfo?.type,
      }));

      allTransactions = [...allTransactions, ...enrichedTransactions];
    }

    // Sort by date (newest first)
    return allTransactions.sort((a, b) => b.date - a.date);
  },
});
