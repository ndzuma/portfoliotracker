import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Get goals for a specific portfolio
export const getGoalsByPortfolio = query({
  args: {
    portfolioId: v.union(v.id("portfolios"), v.string()),
  },
  handler: async (ctx, args) => {
    const goals = await ctx.db
      .query("goals")
      .withIndex("byPortfolio", (q) => q.eq("portfolioId", args.portfolioId as Id<"portfolios">))
      .first();
    
    return goals;
  },
});

// Create or update goals for a portfolio
export const upsertGoals = mutation({
  args: {
    portfolioId: v.union(v.id("portfolios"), v.string()),
    targetValue: v.number(),
    targetReturn: v.number(),
    targetContribution: v.number(),
  },
  handler: async (ctx, args) => {
    const { portfolioId, targetValue, targetReturn, targetContribution } = args;
    
    // Check if goals already exist for this portfolio
    const existingGoals = await ctx.db
      .query("goals")
      .withIndex("byPortfolio", (q) => q.eq("portfolioId", portfolioId as Id<"portfolios">))
      .first();
    
    const now = Date.now();
    
    if (existingGoals) {
      // Update existing goals
      await ctx.db.patch(existingGoals._id, {
        targetValue,
        targetReturn,
        targetContribution,
        updatedAt: now,
      });
      return existingGoals._id;
    } else {
      // Create new goals
      const goalsId = await ctx.db.insert("goals", {
        portfolioId: portfolioId as Id<"portfolios">,
        targetValue,
        targetReturn,
        targetContribution,
        createdAt: now,
        updatedAt: now,
      });
      return goalsId;
    }
  },
});

// Delete goals for a portfolio
export const deleteGoals = mutation({
  args: {
    portfolioId: v.union(v.id("portfolios"), v.string()),
  },
  handler: async (ctx, args) => {
    const goals = await ctx.db
      .query("goals")
      .withIndex("byPortfolio", (q) => q.eq("portfolioId", args.portfolioId as Id<"portfolios">))
      .first();
    
    if (goals) {
      await ctx.db.delete(goals._id);
    }
  },
});