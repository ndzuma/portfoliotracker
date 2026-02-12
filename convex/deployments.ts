import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ── Record a deployment from the Railway webhook ────────────────────
// Public mutation (no auth) — deployment metadata is non-sensitive,
// and the API route validates the webhook secret before calling this.
// Uses single-document upsert: patches existing row or inserts fresh.
export const recordDeployment = mutation({
  args: {
    deploymentId: v.string(),
    status: v.string(),
    serviceName: v.optional(v.string()),
    environment: v.optional(v.string()),
    branch: v.optional(v.string()),
    commitMessage: v.optional(v.string()),
    commitAuthor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("deployments").first();

    const data = {
      deploymentId: args.deploymentId,
      status: args.status.toLowerCase(),
      serviceName: args.serviceName,
      environment: args.environment,
      branch: args.branch,
      commitMessage: args.commitMessage,
      commitAuthor: args.commitAuthor,
      triggeredAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    }

    return await ctx.db.insert("deployments", data);
  },
});

// ── Get the latest deployment — reactive via Convex subscription ────
// The client subscribes with useQuery; updates push instantly, no polling.
export const getLatest = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("deployments").first();
  },
});
