import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

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
      hasOnboarded: false,
    });

    // No automatic preferences or portfolio creation
    // This will be handled by the onboarding flow

    return userId;
  },
});

export const getUsersName = query({
  args: { userId: v.optional(v.union(v.id("users"), v.string())) },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return null;
    }
    const user = await ctx.db.get(args.userId as Id<"users">);
    if (!user) {
      throw new Error("User not found");
    }
    return user.name;
  },
});

export const getUserPreferences = query({
  args: { userId: v.optional(v.union(v.id("users"), v.string())) },
  handler: async (ctx, args) => {
    // Return null if userId is not provided or empty
    if (!args.userId) {
      return null;
    }

    const user = await ctx.db.get(args.userId as Id<"users">);
    if (!user) {
      throw new Error("User not found");
    }
    const preferences = await ctx.db
      .query("userPreferences")
      .withIndex("byUser", (q) => q.eq("userId", args.userId as Id<"users">))
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
    aiProvider: v.optional(v.string()),
    openRouterApiKey: v.optional(v.string()),
    tunnelId: v.optional(v.string()),
    selfHostedUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.userId) {
      throw new Error("User ID is required");
    }
    const user = await ctx.db.get(args.userId as Id<"users">);
    if (!user) {
      throw new Error("User not found");
    }
    const preferences = await ctx.db
      .query("userPreferences")
      .withIndex("byUser", (q) => q.eq("userId", args.userId as Id<"users">))
      .first();

    if (!preferences) {
      // Create new preferences
      return await ctx.db.insert("userPreferences", {
        userId: args.userId as Id<"users">,
        currency: args.currency || "USD",
        theme: args.theme || "dark",
        language: args.language || "en",
        aiProvider: args.aiProvider || "default",
        openRouterApiKey: args.openRouterApiKey || "",
        tunnelId: args.tunnelId || "",
        selfHostedUrl: args.selfHostedUrl || "",
      });
    } else {
      // Update existing preferences
      await ctx.db.patch(preferences._id, {
        currency:
          args.currency !== undefined ? args.currency : preferences.currency,
        theme: args.theme !== undefined ? args.theme : preferences.theme,
        language:
          args.language !== undefined ? args.language : preferences.language,
        aiProvider:
          args.aiProvider !== undefined
            ? args.aiProvider
            : preferences.aiProvider,
        openRouterApiKey:
          args.openRouterApiKey !== undefined
            ? args.openRouterApiKey
            : preferences.openRouterApiKey,
        tunnelId:
          args.tunnelId !== undefined ? args.tunnelId : preferences.tunnelId,
        selfHostedUrl:
          args.selfHostedUrl !== undefined
            ? args.selfHostedUrl
            : preferences.selfHostedUrl,
      });
      return preferences._id;
    }
  },
});

// Extract all account data for a user: portfolios, assets, transactions
// This can be used for exporting data or migrating to another service
export const extractAccountData = query({
  args: { userId: v.optional(v.union(v.id("users"), v.string())) },
  handler: async (ctx, args) => {
    // Return empty data if userId is not provided or empty
    if (!args.userId) {
      return { user: null, portfolios: [] };
    }

    const user = await ctx.db.get(args.userId as Id<"users">);
    if (!user) {
      throw new Error("User not found");
    }
    const portfolios = await ctx.db
      .query("portfolios")
      .withIndex("byUser", (q) => q.eq("userId", args.userId as Id<"users">))
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

// Extract account data for export with sensitive data filtered out
// Removes internal IDs, creation timestamps, and personal information
export const extractAccountDataForExport = query({
  args: { userId: v.optional(v.union(v.id("users"), v.string())) },
  handler: async (ctx, args) => {
    // Return empty data if userId is not provided or empty
    if (!args.userId) {
      return { user: null, portfolios: [] };
    }

    const user = await ctx.db.get(args.userId as Id<"users">);
    if (!user) {
      throw new Error("User not found");
    }
    const portfolios = await ctx.db
      .query("portfolios")
      .withIndex("byUser", (q) => q.eq("userId", args.userId as Id<"users">))
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

        // Filter sensitive data from transactions
        const filteredTransactions = transactions.map((transaction) => ({
          type: transaction.type,
          date: transaction.date,
          quantity: transaction.quantity,
          price: transaction.price,
          fees: transaction.fees,
          notes: transaction.notes,
        }));

        // Filter sensitive data from assets
        const filteredAsset = {
          symbol: asset.symbol,
          name: asset.name,
          type: asset.type,
          currentPrice: asset.currentPrice,
          currency: asset.currency,
          notes: asset.notes,
          transactions: filteredTransactions,
        };

        assetsWithTransactions.push(filteredAsset);
      }

      // Filter sensitive data from portfolios
      const filteredPortfolio = {
        name: portfolio.name,
        description: portfolio.description,
        includeInNetworth: portfolio.includeInNetworth,
        allowSubscriptions: portfolio.allowSubscriptions,
        assets: assetsWithTransactions,
      };

      data.push(filteredPortfolio);
    }

    // Filter sensitive data from user
    const filteredUser = {
      name: user.name,
    };

    return { user: filteredUser, portfolios: data };
  },
});

// Check if a user is an admin
export const isUserAdmin = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    return user?.isAdmin ?? false;
  },
});

// Set user admin status - admin only operation
export const setUserAdminStatus = mutation({
  args: {
    clerkId: v.string(),
    isAdmin: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if the current user is admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.tokenIdentifier) {
      throw new Error("Unauthorized: Must be authenticated");
    }

    // Get current user from Convex database
    const currentUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!currentUser?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Find target user and update their admin status
    const targetUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (!targetUser) {
      throw new Error("User not found");
    }

    await ctx.db.patch(targetUser._id, {
      isAdmin: args.isAdmin,
    });

    return {
      message: `User ${targetUser.name} admin status updated to ${args.isAdmin}`,
      userId: targetUser._id,
    };
  },
});

// Get all users with their admin status - admin only
export const getAllUsersWithAdminStatus = query({
  args: {},
  handler: async (ctx) => {
    // Check if the current user is admin
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.tokenIdentifier) {
      throw new Error("Unauthorized: Must be authenticated");
    }

    // Get current user from Convex database
    const currentUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!currentUser?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const users = await ctx.db.query("users").collect();
    return users.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      clerkId: user.clerkId,
      isAdmin: user.isAdmin ?? false,
    }));
  },
});

// Save user preferences during onboarding
export const saveOnboardingPreferences = mutation({
  args: {
    userId: v.id("users"),
    currency: v.string(),
    language: v.string(),
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"))),
  },
  handler: async (ctx, args) => {
    // Create user preferences
    return await ctx.db.insert("userPreferences", {
      userId: args.userId,
      currency: args.currency,
      language: args.language,
      theme: args.theme || "dark",
    });
  },
});

// Save AI preferences during onboarding
export const saveOnboardingAiPreferences = mutation({
  args: {
    userId: v.id("users"),
    aiProvider: v.string(),
    openRouterApiKey: v.optional(v.string()),
    tunnelId: v.optional(v.string()),
    selfHostedUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const preferences = await ctx.db
      .query("userPreferences")
      .withIndex("byUser", (q) => q.eq("userId", args.userId))
      .first();

    if (preferences) {
      await ctx.db.patch(preferences._id, {
        aiProvider: args.aiProvider,
        openRouterApiKey: args.openRouterApiKey || "",
        tunnelId: args.tunnelId || "",
        selfHostedUrl: args.selfHostedUrl || "",
      });
    }
  },
});

// Mark onboarding as complete
export const markOnboardingComplete = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(args.userId, {
      hasOnboarded: true,
    });
  },
});
