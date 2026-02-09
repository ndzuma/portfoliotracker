import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// ─── Goal type union (mirrors schema) ────────────────────────────────────────
const goalTypeValidator = v.union(
  v.literal("portfolio_value"),
  v.literal("annualized_return"),
  v.literal("ytd_return"),
  v.literal("custom"),
);

const unitValidator = v.union(v.literal("currency"), v.literal("percentage"));

// ─── Queries ─────────────────────────────────────────────────────────────────

/** Get all goals for a specific portfolio */
export const getGoalsByPortfolio = query({
  args: {
    portfolioId: v.union(v.id("portfolios"), v.string()),
  },
  handler: async (ctx, args) => {
    const goals = await ctx.db
      .query("portfolioGoals")
      .withIndex("byPortfolio", (q) =>
        q.eq("portfolioId", args.portfolioId as Id<"portfolios">),
      )
      .collect();

    return goals;
  },
});

/** Get a single goal by ID */
export const getGoalById = query({
  args: {
    goalId: v.id("portfolioGoals"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.goalId);
  },
});

// ─── Mutations ───────────────────────────────────────────────────────────────

/** Create a new individual goal */
export const createGoal = mutation({
  args: {
    portfolioId: v.union(v.id("portfolios"), v.string()),
    name: v.string(),
    type: goalTypeValidator,
    targetValue: v.number(),
    currentValue: v.optional(v.number()),
    unit: unitValidator,
    metricKey: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    deadline: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const goalId = await ctx.db.insert("portfolioGoals", {
      portfolioId: args.portfolioId as Id<"portfolios">,
      name: args.name,
      type: args.type,
      targetValue: args.targetValue,
      currentValue: args.currentValue,
      unit: args.unit,
      metricKey: args.metricKey,
      icon: args.icon,
      color: args.color,
      deadline: args.deadline,
      notes: args.notes,
      createdAt: now,
      updatedAt: now,
    });

    return goalId;
  },
});

/** Update an existing goal */
export const updateGoal = mutation({
  args: {
    goalId: v.id("portfolioGoals"),
    name: v.optional(v.string()),
    type: v.optional(goalTypeValidator),
    targetValue: v.optional(v.number()),
    currentValue: v.optional(v.number()),
    unit: v.optional(unitValidator),
    metricKey: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    deadline: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { goalId, ...updates } = args;

    const existing = await ctx.db.get(goalId);
    if (!existing) {
      throw new Error("Goal not found");
    }

    // Build patch object — only include fields that were actually provided
    const patch: Record<string, unknown> = { updatedAt: Date.now() };

    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.type !== undefined) patch.type = updates.type;
    if (updates.targetValue !== undefined)
      patch.targetValue = updates.targetValue;
    if (updates.currentValue !== undefined)
      patch.currentValue = updates.currentValue;
    if (updates.unit !== undefined) patch.unit = updates.unit;
    if (updates.metricKey !== undefined) patch.metricKey = updates.metricKey;
    if (updates.icon !== undefined) patch.icon = updates.icon;
    if (updates.color !== undefined) patch.color = updates.color;
    if (updates.deadline !== undefined) patch.deadline = updates.deadline;
    if (updates.notes !== undefined) patch.notes = updates.notes;

    await ctx.db.patch(goalId, patch);
    return goalId;
  },
});

/** Delete a single goal */
export const deleteGoal = mutation({
  args: {
    goalId: v.id("portfolioGoals"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.goalId);
    if (!existing) {
      throw new Error("Goal not found");
    }

    await ctx.db.delete(args.goalId);
  },
});

/** Delete all goals for a portfolio (used when deleting the portfolio) */
export const deleteGoalsByPortfolio = mutation({
  args: {
    portfolioId: v.union(v.id("portfolios"), v.string()),
  },
  handler: async (ctx, args) => {
    const goals = await ctx.db
      .query("portfolioGoals")
      .withIndex("byPortfolio", (q) =>
        q.eq("portfolioId", args.portfolioId as Id<"portfolios">),
      )
      .collect();

    for (const goal of goals) {
      await ctx.db.delete(goal._id);
    }
  },
});

/**
 * Bulk-create goals from onboarding flow.
 * Accepts the legacy shape (targetValue, targetReturn, etc.) and converts
 * each non-empty field into an individual portfolioGoal row.
 *
 * Maps to new types:
 * - targetValue → portfolio_value
 * - targetReturn → annualized_return
 * - targetYearlyReturn → ytd_return (closest match)
 * - targetContribution → custom goal with note
 */
export const createGoalsFromOnboarding = mutation({
  args: {
    portfolioId: v.union(v.id("portfolios"), v.string()),
    targetValue: v.optional(v.number()),
    targetReturn: v.optional(v.number()),
    targetYearlyReturn: v.optional(v.number()),
    targetContribution: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const pid = args.portfolioId as Id<"portfolios">;
    const ids: Id<"portfolioGoals">[] = [];

    if (args.targetValue && args.targetValue > 0) {
      const id = await ctx.db.insert("portfolioGoals", {
        portfolioId: pid,
        name: "Portfolio Value Target",
        type: "portfolio_value",
        targetValue: args.targetValue,
        unit: "currency",
        icon: "💰",
        createdAt: now,
        updatedAt: now,
      });
      ids.push(id);
    }

    if (args.targetReturn && args.targetReturn > 0) {
      const id = await ctx.db.insert("portfolioGoals", {
        portfolioId: pid,
        name: "Annualized Return Target",
        type: "annualized_return",
        targetValue: args.targetReturn,
        unit: "percentage",
        icon: "📈",
        createdAt: now,
        updatedAt: now,
      });
      ids.push(id);
    }

    if (args.targetYearlyReturn && args.targetYearlyReturn > 0) {
      const id = await ctx.db.insert("portfolioGoals", {
        portfolioId: pid,
        name: "YTD Return Target",
        type: "ytd_return",
        targetValue: args.targetYearlyReturn,
        unit: "percentage",
        icon: "📊",
        createdAt: now,
        updatedAt: now,
      });
      ids.push(id);
    }

    if (args.targetContribution && args.targetContribution > 0) {
      const id = await ctx.db.insert("portfolioGoals", {
        portfolioId: pid,
        name: "Monthly Contribution",
        type: "custom",
        targetValue: args.targetContribution,
        unit: "currency",
        icon: "🗓️",
        metricKey: "monthly_contribution",
        notes: "Recurring monthly savings goal (from onboarding)",
        createdAt: now,
        updatedAt: now,
      });
      ids.push(id);
    }

    return ids;
  },
});
