import { query } from "./_generated/server";
import { v } from "convex/values";

export const globalSearch = query({
  args: {
    searchTerm: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { searchTerm, userId } = args;

    // Don't search for empty/very short terms
    if (!searchTerm || searchTerm.trim().length < 2) {
      return { portfolios: [], assets: [], documents: [], articles: [] };
    }

    const term = searchTerm.trim();

    // 1. Search portfolios by name (filtered by userId)
    const portfolioResults = await ctx.db
      .query("portfolios")
      .withSearchIndex("searchPortfolios", (q) =>
        q.search("name", term).eq("userId", userId),
      )
      .take(5);

    const portfolios = portfolioResults.map((p) => ({
      id: p._id,
      title: p.name,
      subtitle: p.description || p.riskTolerance || "Portfolio",
      href: `/portfolio/${p._id}`,
      icon: "ChartPieSlice" as const,
      category: "portfolio" as const,
    }));

    // 2. Search assets — get user's portfolios first, then search per portfolio
    const userPortfolios = await ctx.db
      .query("portfolios")
      .withIndex("byUser", (q) => q.eq("userId", userId))
      .collect();

    const portfolioIds = userPortfolios.map((p) => p._id);
    const portfolioNameMap = new Map(
      userPortfolios.map((p) => [p._id, p.name]),
    );

    // Search assets across all user portfolios in parallel
    const assetSearches = await Promise.all(
      portfolioIds.map((pid) =>
        ctx.db
          .query("assets")
          .withSearchIndex("searchAssets", (q) =>
            q.search("name", term).eq("portfolioId", pid),
          )
          .take(5),
      ),
    );

    // Flatten and take top 5
    const allAssets = assetSearches.flat();
    const assets = allAssets.slice(0, 5).map((a) => ({
      id: a._id,
      title: a.name,
      subtitle: `${a.symbol ? a.symbol + " · " : ""}${a.type} · ${portfolioNameMap.get(a.portfolioId) || "Portfolio"}`,
      href: `/portfolio/${a.portfolioId}`,
      icon: "CurrencyCircleDollar" as const,
      category: "asset" as const,
    }));

    // 3. Search documents by fileName (filtered by userId)
    const documentResults = await ctx.db
      .query("userDocuments")
      .withSearchIndex("searchDocuments", (q) =>
        q.search("fileName", term).eq("userId", userId),
      )
      .take(5);

    const documents = documentResults.map((d) => ({
      id: d._id,
      title: d.fileName,
      subtitle: d.type || "Document",
      href: d.portfolioId ? `/portfolio/${d.portfolioId}` : "/",
      icon: "FileText" as const,
      category: "document" as const,
    }));

    // 4. Search articles by title (filtered by userId)
    const articleResults = await ctx.db
      .query("userArticles")
      .withSearchIndex("searchArticles", (q) =>
        q.search("title", term).eq("userId", userId),
      )
      .take(5);

    const articles = articleResults.map((a) => {
      let subtitle = a.url;
      if (a.notes) {
        subtitle = a.notes.slice(0, 60) + (a.notes.length > 60 ? "…" : "");
      } else {
        try {
          subtitle = new URL(a.url).hostname;
        } catch {
          // Malformed URL — fall back to raw string
          subtitle = a.url.slice(0, 40);
        }
      }
      return {
        id: a._id,
        title: a.title,
        subtitle,
        href: a.url,
        icon: "Newspaper" as const,
        category: "article" as const,
        external: true,
      };
    });

    return { portfolios, assets, documents, articles };
  },
});
