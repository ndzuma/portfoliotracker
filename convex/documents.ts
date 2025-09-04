import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const uploadDocument = mutation({
  args: {
    storageId: v.id("_storage"),
    userId: v.union(v.id("users"), v.string()),
    portfolioId: v.optional(v.union(v.id("portfolios"), v.string())),
    fileName: v.string(),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    
    await ctx.db.insert("userDocuments", {
      storageId: args.storageId,
      userId: args.userId,
      portfolioId: args.portfolioId,
      fileName: args.fileName,
      type: args.type || "Other",
      updatedAt: Date.now(),
    });
  },
});

export const deleteDocument = mutation({
  args: {
    documentId: v.union(v.id("userDocuments"), v.string()),
    userId: v.union(v.id("users"), v.string()),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }
    if (document.userId !== args.userId) {
      throw new Error("Unauthorized");
    }
    await ctx.storage.delete(document.storageId);
    await ctx.db.delete(args.documentId);
  },
});

export const updateFileName = mutation({
  args: {
    documentId: v.union(v.id("userDocuments"), v.string()),
    userId: v.union(v.id("users"), v.string()),
    fileName: v.string(),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error("Document not found");
    }
    if (document.userId !== args.userId) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(args.documentId, { fileName: args.fileName });
  },
});

export const getDocuments = query({
  args: {
    userId: v.union(v.id("users"), v.string()),
    portfolioId: v.optional(v.union(v.id("portfolios"), v.string())),
  },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("userDocuments")
      .withIndex("byUser", (q) =>
        q.eq("userId", args.userId).eq("portfolioId", args.portfolioId || null),
      )
      .collect();
    return Promise.all(
      docs.map(async (doc) => ({
        ...doc,
        url: await ctx.storage.getUrl(doc.storageId),
        size: await ctx.db.system.get(doc.storageId).then((f) => f?.size || 0),
      })),
    );
  },
});
