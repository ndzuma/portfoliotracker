import { api, internal } from "./_generated/api";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Create a new asset
export const createAsset = mutation({
  args: {
    portfolioId: v.union(v.id("portfolios"), v.string()),
    name: v.string(),
    symbol: v.optional(v.string()),
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
    quantity: v.number(),
    purchasePrice: v.number(),
    purchaseDate: v.number(),
    fees: v.optional(v.number()),
    transactionNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const assetId = await ctx.db.insert("assets", {
      portfolioId: args.portfolioId,
      name: args.name,
      symbol: args.symbol,
      type: args.type,
      currentPrice: args.currentPrice || args.purchasePrice,
      currency: args.currency,
      notes: args.notes,
    });

    await ctx.db.insert("transactions", {
      assetId,
      type: "buy",
      date: args.purchaseDate,
      quantity: args.quantity,
      price: args.purchasePrice,
      fees: args.fees || 0,
      notes: args.transactionNotes,
    });

    // if asset is stocks, crypto, bonds, or commodity add to marketCurrentData
    // schedule a background job to fetch current price data for this asset
    // schedule a background job to fetch historical data for this asset
    if (["stock", "crypto", "bond", "commodity"].includes(args.type)) {
      await ctx.scheduler.runAfter(60000, api.marketData.updateCurrentPrices);
      await ctx.scheduler.runAfter(120000, api.marketData.updateHistoricalData);
    }

    // Trigger portfolio snapshot update when asset is added
    await ctx.scheduler.runAfter(0, internal.marketData.triggerSnapshotUpdate, {
      portfolioId: args.portfolioId,
      reason: "asset_added",
      startDate: args.purchaseDate,
    });

    // If this is the user's first asset, generate an AI summary so they
    // immediately see the feature in action (delay lets snapshots settle)
    const existingAssets = await ctx.db
      .query("assets")
      .withIndex("byPortfolio", (q) => q.eq("portfolioId", args.portfolioId))
      .collect();

    if (existingAssets.length === 1) {
      await ctx.scheduler.runAfter(5000, api.ai.generateAiPortfolioSummary, {
        portfolioId: args.portfolioId as Id<"portfolios">,
      });
    }

    return assetId;
  },
});

// Update an existing asset (only asset properties, not transactions)
export const updateAsset = mutation({
  args: {
    assetId: v.id("assets"),
    name: v.optional(v.string()),
    symbol: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("stock"),
        v.literal("bond"),
        v.literal("commodity"),
        v.literal("real estate"),
        v.literal("cash"),
        v.literal("crypto"),
        v.literal("other"),
      ),
    ),
    currentPrice: v.optional(v.number()),
    currency: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const asset = await ctx.db.get(args.assetId);
    if (!asset) {
      throw new Error("Asset not found");
    }

    // Only update fields that were provided
    const updates: Record<string, any> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.symbol !== undefined) updates.symbol = args.symbol;
    if (args.type !== undefined) updates.type = args.type;
    if (args.currentPrice !== undefined)
      updates.currentPrice = args.currentPrice;
    if (args.currency !== undefined) updates.currency = args.currency;
    if (args.notes !== undefined) updates.notes = args.notes;

    await ctx.db.patch(args.assetId, updates);

    // Trigger portfolio snapshot update when asset is modified
    await ctx.scheduler.runAfter(
      500,
      internal.marketData.triggerSnapshotUpdate,
      {
        portfolioId: asset.portfolioId,
        reason: "asset_modified",
        startDate: Date.now(), // Recalculate from today
      },
    );

    return args.assetId;
  },
});

// Delete an asset and all its transactions
export const deleteAsset = mutation({
  args: {
    assetId: v.id("assets"),
  },
  handler: async (ctx, args) => {
    const asset = await ctx.db.get(args.assetId);
    if (!asset) {
      throw new Error("Asset not found");
    }

    // Delete all transactions for this asset
    const transactions = await ctx.db
      .query("transactions")
      .withIndex("byAsset", (q) => q.eq("assetId", args.assetId))
      .collect();

    for (const transaction of transactions) {
      await ctx.db.delete(transaction._id);
    }

    // Delete any snapshots for this asset
    const snapshots = await ctx.db
      .query("assetSnapshots")
      .withIndex("byAsset", (q) => q.eq("assetId", args.assetId))
      .collect();

    for (const snapshot of snapshots) {
      await ctx.db.delete(snapshot._id);
    }

    // Finally, delete the asset itself
    await ctx.db.delete(args.assetId);
    return true;
  },
});

// get an asset by ticker
export const getAssetBySymbol = query({
  args: {
    symbol: v.string(),
  },
  handler: async (ctx, args) => {
    const asset = await ctx.db.query("assets").collect();

    for (const a of asset) {
      if (a.symbol?.toLowerCase() === args.symbol.toLowerCase()) {
        return a;
      }
    }
    return null;
  },
});

// Add a new transaction to an asset
export const addTransaction = mutation({
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

    // Trigger portfolio snapshot update when transaction is added
    await ctx.scheduler.runAfter(0, internal.marketData.triggerSnapshotUpdate, {
      portfolioId: asset.portfolioId,
      reason: "transaction_added",
      startDate: args.date,
    });

    return transactionId;
  },
});

// Update an existing transaction
export const updateTransaction = mutation({
  args: {
    transactionId: v.id("transactions"),
    type: v.optional(
      v.union(v.literal("buy"), v.literal("sell"), v.literal("dividend")),
    ),
    date: v.optional(v.number()), // timestamp
    quantity: v.optional(v.number()), // Required for buy/sell
    price: v.optional(v.number()), // Required for buy/sell
    fees: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get(args.transactionId);
    if (!transaction) {
      throw new Error("Transaction not found");
    }

    // Get the asset to access portfolioId
    const asset = await ctx.db.get(transaction.assetId);
    if (!asset) {
      throw new Error("Asset not found");
    }

    // Validate required fields based on transaction type
    const newType = args.type || transaction.type;
    if (
      ((newType === "buy" || newType === "sell") &&
        args.quantity === undefined &&
        transaction.quantity === undefined) ||
      (args.price === undefined && transaction.price === undefined)
    ) {
      throw new Error("Buy and sell transactions require quantity and price");
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

    // Trigger portfolio snapshot update when transaction is modified
    await ctx.scheduler.runAfter(
      500,
      internal.marketData.triggerSnapshotUpdate,
      {
        portfolioId: asset.portfolioId,
        reason: "transaction_modified",
        startDate: args.date || transaction.date, // Use new date or existing date
      },
    );

    return args.transactionId;
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

// Update current price of an asset
export const updateCurrentPrice = mutation({
  args: {
    assetId: v.id("assets"),
    currentPrice: v.number(),
  },
  handler: async (ctx, args) => {
    const asset = await ctx.db.get(args.assetId);
    if (!asset) {
      throw new Error("Asset not found");
    }

    await ctx.db.patch(args.assetId, {
      currentPrice: args.currentPrice,
    });

    return args.assetId;
  },
});

// Take a snapshot of an asset's current state
export const createAssetSnapshot = mutation({
  args: {
    assetId: v.id("assets"),
    date: v.number(), // timestamp
  },
  handler: async (ctx, args) => {
    const asset = await ctx.db.get(args.assetId);
    if (!asset) {
      throw new Error("Asset not found");
    }

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("byAsset", (q) => q.eq("assetId", args.assetId))
      .collect();

    // Calculate quantity from transactions
    const quantity = transactions.reduce(
      (q, t) => q + (t.type === "buy" ? t.quantity || 0 : -(t.quantity || 0)),
      0,
    );

    const currentPrice = asset.currentPrice || 0;
    const totalValue = quantity * currentPrice;

    const snapshotId = await ctx.db.insert("assetSnapshots", {
      assetId: args.assetId,
      date: args.date,
      currentPrice,
      quantity,
      totalValue,
    });

    return snapshotId;
  },
});
