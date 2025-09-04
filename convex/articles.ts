import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getArticles = query({
  args: {
    userId: v.union(v.id("users"), v.string()),
    portfolioId: v.optional(v.union(v.id("portfolios"), v.string())),
  },
  handler: async (ctx, args) => {
    const articles = await ctx.db
      .query("userArticles")
      .withIndex("byUser", (q) => q.eq("userId", args.userId))
      .collect();

    // If portfolioId is provided, filter articles by portfolioId
    const filteredArticles = args.portfolioId
      ? articles.filter((article) => article.portfolioId === args.portfolioId)
      : articles;

    return filteredArticles;
  },
});

export const saveArticle = mutation({
  args: {
    userId: v.union(v.id("users"), v.string()),
    portfolioId: v.optional(v.union(v.id("portfolios"), v.string())),
    title: v.string(),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    const newArticle = await ctx.db.insert("userArticles", {
      userId: args.userId,
      portfolioId: args.portfolioId || null,
      title: args.title,
      url: args.url,
    });
    return newArticle;
  },
});

export const deleteArticle = mutation({
  args: {
    articleId: v.union(v.id("userArticles"), v.string()),
    userId: v.union(v.id("users"), v.string()),
  },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId);
    if (!article) {
      throw new Error("Article not found");
    }
    if (article.userId !== args.userId) {
      throw new Error("Unauthorized");
    }
    await ctx.db.delete(args.articleId);
  },
});

export const editArticleUrl = mutation({
  args: {
    articleId: v.union(v.id("userArticles"), v.string()),
    userId: v.union(v.id("users"), v.string()),
    newUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const article = await ctx.db.get(args.articleId);
    if (!article) {
      throw new Error("Article not found");
    }
    if (article.userId !== args.userId) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(args.articleId, { url: args.newUrl });
  },
});

export const deleteArticlesByPortfolio = mutation({
  args: {
    portfolioId: v.union(v.id("portfolios"), v.string()),
    userId: v.union(v.id("users"), v.string()),
  },
  handler: async (ctx, args) => {
    const articles = await ctx.db
      .query("userArticles")
      .withIndex("byUser", (q) => q.eq("userId", args.userId))
      .collect();

    const articlesToDelete = articles.filter(
      (article) => article.portfolioId === args.portfolioId,
    );

    for (const article of articlesToDelete) {
      await ctx.db.delete(article._id);
    }
  },
});
