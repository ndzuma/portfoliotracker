import { query } from "./_generated/server";
import { v } from "convex/values";

// ─── Quick Actions — static navigation items ─────────────────────
const QUICK_ACTIONS = [
  {
    id: "nav-settings",
    title: "Settings",
    subtitle: "Preferences, theme, currency, AI provider",
    href: "/settings",
    icon: "GearSix" as const,
    category: "action" as const,
    keywords: [
      "settings",
      "preferences",
      "theme",
      "dark mode",
      "light mode",
      "currency",
      "language",
      "ai",
      "provider",
      "export",
      "config",
      "configuration",
      "account",
    ],
  },
  {
    id: "nav-news",
    title: "News",
    subtitle: "Market news and AI analysis",
    href: "/news",
    icon: "Newspaper" as const,
    category: "action" as const,
    keywords: [
      "news",
      "market",
      "article",
      "headline",
      "analysis",
      "summary",
      "ai",
      "intelligence",
    ],
  },
  {
    id: "nav-watchlist",
    title: "Watchlist",
    subtitle: "Track stocks and assets you're watching",
    href: "/watchlist",
    icon: "Binoculars" as const,
    category: "action" as const,
    keywords: [
      "watchlist",
      "watch",
      "track",
      "follow",
      "monitor",
      "bookmark",
      "symbol",
    ],
  },
  {
    id: "nav-overview",
    title: "Dashboard",
    subtitle: "Portfolio overview and net worth",
    href: "/",
    icon: "ChartPieSlice" as const,
    category: "action" as const,
    keywords: [
      "dashboard",
      "overview",
      "home",
      "net worth",
      "total",
      "portfolio",
      "summary",
    ],
  },
  {
    id: "nav-earnings",
    title: "Earnings Calendar",
    subtitle: "Upcoming earnings reports and events",
    href: "/earnings",
    icon: "CalendarDots" as const,
    category: "action" as const,
    keywords: [
      "earnings",
      "calendar",
      "events",
      "reports",
      "quarterly",
      "date",
      "schedule",
    ],
  },
  {
    id: "nav-research",
    title: "Research",
    subtitle: "Deep-dive research and analysis tools",
    href: "/research",
    icon: "Flask" as const,
    category: "action" as const,
    keywords: [
      "research",
      "analysis",
      "deep dive",
      "tools",
      "study",
      "investigate",
    ],
  },
];

export const globalSearch = query({
  args: {
    searchTerm: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { searchTerm, userId } = args;

    // Don't search for empty/very short terms
    if (!searchTerm || searchTerm.trim().length < 2) {
      return {
        portfolios: [],
        assets: [],
        documents: [],
        articles: [],
        market: [],
        actions: [],
      };
    }

    const term = searchTerm.trim();
    const termLower = term.toLowerCase();

    // ─── 1. Search portfolios by name (filtered by userId) ───────
    const portfolioResults = await ctx.db
      .query("portfolios")
      .withSearchIndex("searchPortfolios", (q) =>
        q.search("name", term).eq("userId", userId),
      )
      .take(5);

    const portfolios = portfolioResults.map((p) => ({
      id: p._id,
      title: p.name,
      subtitle:
        [p.riskTolerance, p.timeHorizon, p.description]
          .filter(Boolean)
          .join(" · ") || "Portfolio",
      href: `/portfolio/${p._id}`,
      icon: "ChartPieSlice" as const,
      category: "portfolio" as const,
    }));

    // ─── 2. Search assets by name + symbol/ticker ────────────────
    const userPortfolios = await ctx.db
      .query("portfolios")
      .withIndex("byUser", (q) => q.eq("userId", userId))
      .collect();

    const portfolioIds = userPortfolios.map((p) => p._id);
    const portfolioNameMap = new Map(
      userPortfolios.map((p) => [p._id, p.name]),
    );

    // 2a. Search by name via search index
    const assetNameSearches = await Promise.all(
      portfolioIds.map((pid) =>
        ctx.db
          .query("assets")
          .withSearchIndex("searchAssets", (q) =>
            q.search("name", term).eq("portfolioId", pid),
          )
          .take(5),
      ),
    );
    const assetsByName = assetNameSearches.flat();

    // 2b. Search by symbol/ticker via filter scan (symbols are short, exact-ish matches)
    const allUserAssets = await Promise.all(
      portfolioIds.map((pid) =>
        ctx.db
          .query("assets")
          .withIndex("byPortfolio", (q) => q.eq("portfolioId", pid))
          .collect(),
      ),
    );
    const flatAllAssets = allUserAssets.flat();

    const assetsBySymbol = flatAllAssets.filter((a) => {
      if (!a.symbol) return false;
      const sym = a.symbol.toLowerCase();
      return sym.includes(termLower) || termLower.includes(sym);
    });

    // 2c. Search by notes content
    const assetsByNotes = flatAllAssets.filter((a) => {
      if (!a.notes) return false;
      return a.notes.toLowerCase().includes(termLower);
    });

    // Merge and deduplicate assets (name matches first, then symbol, then notes)
    const seenAssetIds = new Set<string>();
    const mergedAssets = [];
    for (const batch of [assetsByName, assetsBySymbol, assetsByNotes]) {
      for (const a of batch) {
        if (!seenAssetIds.has(a._id)) {
          seenAssetIds.add(a._id);
          mergedAssets.push(a);
        }
      }
    }

    const assets = mergedAssets.slice(0, 6).map((a) => {
      const parts = [
        a.symbol,
        a.type,
        portfolioNameMap.get(a.portfolioId) || "Portfolio",
      ].filter(Boolean);
      return {
        id: a._id,
        title: a.name,
        subtitle: parts.join(" · "),
        href: `/portfolio/${a.portfolioId}`,
        icon: "CurrencyCircleDollar" as const,
        category: "asset" as const,
      };
    });

    // ─── 3. Search documents by fileName + type ──────────────────
    const documentResults = await ctx.db
      .query("userDocuments")
      .withSearchIndex("searchDocuments", (q) =>
        q.search("fileName", term).eq("userId", userId),
      )
      .take(5);

    // Also scan for document type matches (e.g. "tax", "report", "statement")
    const allUserDocs = await ctx.db
      .query("userDocuments")
      .withIndex("byUser", (q) => q.eq("userId", userId))
      .collect();

    const docsByType = allUserDocs.filter((d) => {
      if (!d.type) return false;
      return d.type.toLowerCase().includes(termLower);
    });

    const docsByFormat = allUserDocs.filter((d) => {
      if (!d.format) return false;
      return d.format.toLowerCase().includes(termLower);
    });

    // Merge and deduplicate documents
    const seenDocIds = new Set<string>();
    const mergedDocs = [];
    for (const batch of [documentResults, docsByType, docsByFormat]) {
      for (const d of batch) {
        if (!seenDocIds.has(d._id)) {
          seenDocIds.add(d._id);
          mergedDocs.push(d);
        }
      }
    }

    const documents = mergedDocs.slice(0, 5).map((d) => {
      const parts = [d.type, d.format].filter(Boolean);
      return {
        id: d._id,
        title: d.fileName,
        subtitle: parts.join(" · ") || "Document",
        href: d.portfolioId ? `/portfolio/${d.portfolioId}` : "/",
        icon: "FileText" as const,
        category: "document" as const,
      };
    });

    // ─── 4. Search articles by title + URL + notes ───────────────
    const articlesByTitle = await ctx.db
      .query("userArticles")
      .withSearchIndex("searchArticles", (q) =>
        q.search("title", term).eq("userId", userId),
      )
      .take(5);

    // Scan for URL and notes matches
    const allUserArticles = await ctx.db
      .query("userArticles")
      .withIndex("byUser", (q) => q.eq("userId", userId))
      .collect();

    const articlesByUrl = allUserArticles.filter((a) =>
      a.url.toLowerCase().includes(termLower),
    );

    const articlesByNotes = allUserArticles.filter((a) => {
      if (!a.notes) return false;
      return a.notes.toLowerCase().includes(termLower);
    });

    // Merge and deduplicate articles
    const seenArticleIds = new Set<string>();
    const mergedArticles = [];
    for (const batch of [articlesByTitle, articlesByUrl, articlesByNotes]) {
      for (const a of batch) {
        if (!seenArticleIds.has(a._id)) {
          seenArticleIds.add(a._id);
          mergedArticles.push(a);
        }
      }
    }

    const articles = mergedArticles.slice(0, 5).map((a) => {
      let subtitle = a.url;
      if (a.notes) {
        subtitle = a.notes.slice(0, 60) + (a.notes.length > 60 ? "…" : "");
      } else {
        try {
          subtitle = new URL(a.url).hostname;
        } catch {
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

    // ─── 5. Search market tickers ────────────────────────────────
    // Search marketCurrentData for ticker/name matches
    const allMarketData = await ctx.db.query("marketCurrentData").collect();
    const marketMatches = allMarketData
      .filter((m) => {
        const tickerMatch = m.ticker.toLowerCase().includes(termLower);
        const nameMatch = m.name
          ? m.name.toLowerCase().includes(termLower)
          : false;
        return tickerMatch || nameMatch;
      })
      .slice(0, 5);

    const market = marketMatches.map((m) => {
      const priceStr = `$${m.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      return {
        id: m._id,
        title: m.ticker,
        subtitle: [m.name, priceStr, m.type].filter(Boolean).join(" · "),
        href: `/watchlist?ticker=${m.ticker}`,
        icon: "TrendUp" as const,
        category: "market" as const,
      };
    });

    // Also search benchmarks
    const allBenchmarks = await ctx.db.query("marketBenchmarks").collect();
    const benchmarkMatches = allBenchmarks
      .filter((b) => {
        const tickerMatch = b.ticker.toLowerCase().includes(termLower);
        const nameMatch = b.name.toLowerCase().includes(termLower);
        return tickerMatch || nameMatch;
      })
      .slice(0, 3);

    const benchmarks = benchmarkMatches.map((b) => {
      const priceStr = `$${b.close.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      const changeStr =
        b.percentageChange !== undefined
          ? `${b.percentageChange >= 0 ? "+" : ""}${b.percentageChange.toFixed(2)}%`
          : "";
      return {
        id: b._id,
        title: `${b.ticker}`,
        subtitle: [b.name, priceStr, changeStr].filter(Boolean).join(" · "),
        href: `/watchlist?ticker=${b.ticker}`,
        icon: "TrendUp" as const,
        category: "market" as const,
      };
    });

    // Merge market + benchmarks, deduplicate by ticker
    const seenTickers = new Set<string>();
    const mergedMarket = [];
    for (const item of [...market, ...benchmarks]) {
      if (!seenTickers.has(item.title)) {
        seenTickers.add(item.title);
        mergedMarket.push(item);
      }
    }

    // ─── 6. Quick actions — fuzzy match against keywords ─────────
    const matchingActions = QUICK_ACTIONS.filter((action) => {
      // Match against title, subtitle, or keywords
      if (action.title.toLowerCase().includes(termLower)) return true;
      if (action.subtitle.toLowerCase().includes(termLower)) return true;
      return action.keywords.some((kw) => kw.includes(termLower));
    }).map((action) => ({
      id: action.id,
      title: action.title,
      subtitle: action.subtitle,
      href: action.href,
      icon: action.icon,
      category: action.category,
    }));

    return {
      portfolios,
      assets,
      documents,
      articles,
      market: mergedMarket.slice(0, 5),
      actions: matchingActions.slice(0, 4),
    };
  },
});
