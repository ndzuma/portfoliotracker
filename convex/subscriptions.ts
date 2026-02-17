import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

/**
 * PLAN_LIMITS — single source of truth for subscription tier limits
 */
export const PLAN_LIMITS = {
  free: {
    maxPortfolios: 2,
    aiRegeneration: false,
    portfolioDocs: false,
    weeklyInsights: false,
    research: false,
    calendar: false,
    watchlist: false,
    newsSearch: false,
    fullApi: false,
    fullAi: false,
  },
  pro: {
    maxPortfolios: Infinity,
    aiRegeneration: true,
    portfolioDocs: true,
    weeklyInsights: true,
    research: true,
    calendar: true,
    watchlist: true,
    newsSearch: true,
    fullApi: true,
    fullAi: true,
  },
} as const;

export type PlanTier = keyof typeof PLAN_LIMITS;

/**
 * getUserTier — returns the user's current subscription tier
 * Defaults to "free" if subscriptionTier is missing
 */
export const getUserTier = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }
    return (user.subscriptionTier as PlanTier | undefined) ?? "free";
  },
});

/**
 * getSubscriptionDetails — returns full subscription info for the user
 * Includes tier, status, itemId, and updatedAt for the settings page
 */
export const getSubscriptionDetails = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    return {
      tier: (user.subscriptionTier as PlanTier | undefined) ?? "free",
      status: user.subscriptionStatus ?? "active",
      subscriptionItemId: user.subscriptionItemId ?? null,
      updatedAt: user.subscriptionUpdatedAt ?? null,
    };
  },
});

/**
 * getPlanLimits — returns the PLAN_LIMITS entry for a given tier
 * Useful for frontend to display "2/2 portfolios used" messaging
 */
export const getPlanLimits = query({
  args: { tier: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const tier = (args.tier as PlanTier | undefined) ?? "free";
    return PLAN_LIMITS[tier];
  },
});

/**
 * canCreatePortfolio — checks if a user can create another portfolio
 * Returns { allowed: boolean, currentCount: number, limit: number, tier: string }
 */
export const canCreatePortfolio = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const tier = (user.subscriptionTier as PlanTier | undefined) ?? "free";
    const limit = PLAN_LIMITS[tier].maxPortfolios;

    // Count existing portfolios
    const portfolios = await ctx.db
      .query("portfolios")
      .withIndex("byUser", (q) => q.eq("userId", args.userId))
      .collect();

    const currentCount = portfolios.length;
    const allowed = currentCount < limit;

    return {
      allowed,
      currentCount,
      limit,
      tier,
    };
  },
});

/**
 * updateUserSubscription — internal mutation to update subscription fields
 * Called only by the Clerk billing webhook HTTP action
 */
export const updateUserSubscription = internalMutation({
  args: {
    clerkUserId: v.string(),
    tier: v.union(v.literal("free"), v.literal("pro")),
    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("upcoming"),
      v.literal("ended"),
      v.literal("past_due"),
      v.literal("incomplete"),
    ),
    subscriptionItemId: v.string(),
  },
  handler: async (ctx, args) => {
    // Look up user by clerkId
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkUserId))
      .first();

    if (!user) {
      throw new Error(`User with clerkId ${args.clerkUserId} not found`);
    }

    // Patch subscription fields
    await ctx.db.patch(user._id, {
      subscriptionTier: args.tier,
      subscriptionStatus: args.status,
      subscriptionItemId: args.subscriptionItemId,
      subscriptionUpdatedAt: Date.now(),
    });

    console.log(
      `[Subscription Updated] User ${user.name} (${args.clerkUserId}) → tier: ${args.tier}, status: ${args.status}`,
    );

    return user._id;
  },
});
