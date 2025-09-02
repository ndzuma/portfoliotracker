import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
  },
});

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      clerkId: args.clerkId,
    });

    // Create default user preferences
    await ctx.db.insert("userPreferences", {
      userId,
      currency: "USD",
      theme: "dark",
      language: "en",
    });

    // Create a default portfolio
    await ctx.db.insert("portfolios", {
      userId,
      name: "My First Portfolio",
      description: "Track your investments here",
    });

    return userId;
  },
});

export const getUsersName = query({
  args: { userId: v.union(v.id("users"), v.string()) },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user.name;
  },
});

export const getUserPreferences = query({
  args: { userId: v.union(v.id("users"), v.string()) },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }
    const preferences = await ctx.db
      .query("userPreferences")
      .withIndex("byUser", (q) => q.eq("userId", args.userId))
      .collect();
    return preferences[0];
  },
});

export const updateUserPreferences = mutation({
  args: {
    userId: v.union(v.id("users"), v.string()),
    currency: v.optional(v.string()),
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"))),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }
    const preferences = await ctx.db
      .query("userPreferences")
      .withIndex("byUser", (q) => q.eq("userId", args.userId))
      .first();

    if (!preferences) {
      // Create new preferences
      return await ctx.db.insert("userPreferences", {
        userId: args.userId,
        currency: args.currency || "USD",
        theme: args.theme || "dark",
        language: args.language || "en",
      });
    } else {
      // Update existing preferences
      await ctx.db.patch(preferences._id, {
        currency:
          args.currency !== undefined ? args.currency : preferences.currency,
        theme: args.theme !== undefined ? args.theme : preferences.theme,
        language:
          args.language !== undefined ? args.language : preferences.language,
      });
      return preferences._id;
    }
  },
});

// Extract all account data for a user: portfolios, assets, transactions
// This can be used for exporting data or migrating to another service
export const extractAccountData = query({
  args: { userId: v.union(v.id("users"), v.string()) },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }
    const portfolios = await ctx.db
      .query("portfolios")
      .withIndex("byUser", (q) => q.eq("userId", args.userId))
      .collect();

    const data = [];
    for (const portfolio of portfolios) {
      const assets = await ctx.db
        .query("assets")
        .withIndex("byPortfolio", (q) => q.eq("portfolioId", portfolio._id))
        .collect();
      const assetsWithTransactions = [];
      for (const asset of assets) {
        const transactions = await ctx.db
          .query("transactions")
          .withIndex("byAsset", (q) => q.eq("assetId", asset._id))
          .collect();
        assetsWithTransactions.push({ ...asset, transactions });
      }
      data.push({ ...portfolio, assets: assetsWithTransactions });
    }
    return { user, portfolios: data };
  },
});
