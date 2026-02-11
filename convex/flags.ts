import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { query, action, mutation, internalQuery } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { DESTRUCTION } from "node:dns/promises";

export const getFlag = query({
  args: { key: v.string(), userEmail: v.optional(v.string()) },
  handler: async (ctx, { key, userEmail }) => {
    // Environment detection - default to prod
    const currentEnv =
      process.env.NEXT_PUBLIC_NODE_ENV === "dev" ? "dev" : "prod";

    const flag = await ctx.db
      .query("flags")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();

    if (!flag || !flag.enabled) return false;

    // Check if flag is enabled for current environment - nb: default to all
    //if (!flag.environments?.includes(currentEnv)) return false;
    // Targeting logic
    if (flag.targeting?.includes("beta") && !userEmail) return false;
    if (userEmail && flag.targeting?.includes(userEmail)) return true;
    return flag.targeting?.includes("all") ?? true;
  },
});

export const getFlags = internalQuery({
  handler: async (ctx) => {
    const flags = await ctx.db.query("flags").collect();
    // strip sensitive information
    return flags.map((flag) => ({
      key: flag.key,
      description: "-",
      enabled: false,
      environments: ["dev", "prod"],
      //targeting: ["all"],
    }));
  },
});

// Get all flags - for admin interface
export const getAllFlags = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.tokenIdentifier) {
      throw new Error("Unauthorized: Must be authenticated");
    }

    // Get user from Convex database
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    return await ctx.db.query("flags").collect();
  },
});

// Create a new feature flag - admin only
export const createFlag = mutation({
  args: {
    key: v.string(),
    enabled: v.boolean(),
    description: v.string(),
    targeting: v.optional(v.array(v.string())),
    environments: v.array(v.union(v.literal("dev"), v.literal("prod"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.tokenIdentifier) {
      throw new Error("Unauthorized: Must be authenticated");
    }

    // Get user from Convex database
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Check if flag key already exists
    const existingFlag = await ctx.db
      .query("flags")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existingFlag) {
      throw new Error(`Flag with key "${args.key}" already exists`);
    }

    return await ctx.db.insert("flags", {
      key: args.key,
      enabled: args.enabled,
      description: args.description,
      targeting: args.targeting || ["all"],
      environments: args.environments,
    });
  },
});

// Update an existing feature flag - admin only
export const updateFlag = mutation({
  args: {
    id: v.id("flags"),
    enabled: v.optional(v.boolean()),
    description: v.optional(v.string()),
    targeting: v.optional(v.array(v.string())),
    environments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.tokenIdentifier) {
      throw new Error("Unauthorized: Must be authenticated");
    }

    // Get user from Convex database
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    const updates: any = {};
    if (args.enabled !== undefined) updates.enabled = args.enabled;
    if (args.description !== undefined) updates.description = args.description;
    if (args.targeting !== undefined) updates.targeting = args.targeting;
    if (args.environments !== undefined)
      updates.environments = args.environments;

    return await ctx.db.patch(args.id, updates);
  },
});

// Delete a feature flag - admin only
export const deleteFlag = mutation({
  args: { id: v.id("flags") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.tokenIdentifier) {
      throw new Error("Unauthorized: Must be authenticated");
    }

    // Get user from Convex database
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!user?.isAdmin) {
      throw new Error("Unauthorized: Admin access required");
    }

    return await ctx.db.delete(args.id);
  },
});
