import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { query, action, mutation, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

const marketDataServiceUrl = process.env.MARKET_DATA_SERVICE_URL;
const aiServiceUrl = process.env.AI_SERVICE_URL;

export const generateAiNewsSummary = action({
  handler: async (ctx, args) => {
    // test the urls
    if (!marketDataServiceUrl) {
      throw new Error("MARKET_DATA_SERVICE_URL is not defined");
    }
    if (!aiServiceUrl) {
      throw new Error("AI_SERVICE_URL is not defined");
    }

    // get news articles from last 24 hours
    const newsArticlesResponse = await fetch(`${marketDataServiceUrl}/news`);
    if (!newsArticlesResponse.ok) {
      throw new Error(
        `Failed to fetch market news: ${newsArticlesResponse.statusText}`,
      );
    }
    const newsArticles = await newsArticlesResponse.json();

    // call external ai endpoint to generate summary (using v2 endpoint)
    const aiSummaryResponse = await fetch(`${aiServiceUrl}/api/v2/news`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ news_data: newsArticles.Data }),
    });
    if (!aiSummaryResponse.ok) {
      throw new Error(
        `Failed to generate AI summary: ${aiSummaryResponse.statusText}`,
      );
    }
    const aiSummary = await aiSummaryResponse.json();

    // store summary in convex database
    await ctx.runMutation(internal.ai.storeAiNewsSummary, {
      analysis: aiSummary.analysis,
      headline: aiSummary.headline || null,
      timestamp: new Date(aiSummary.timestamp).getTime(),
      modelUsed: aiSummary.model_used,
      tokensUsed: aiSummary.tokens_used,
      processingTimeMs: aiSummary.processing_time_ms,
    });
  },
});

export const storeAiNewsSummary = internalMutation({
  args: {
    analysis: v.string(),
    headline: v.optional(v.string()),
    timestamp: v.number(),
    modelUsed: v.string(),
    tokensUsed: v.number(),
    processingTimeMs: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("marketNewsSummary", {
      analysis: args.analysis,
      headline: args.headline,
      timestamp: args.timestamp,
      modelUsed: args.modelUsed,
      tokensUsed: args.tokensUsed,
      processingTimeMs: args.processingTimeMs,
    });
  },
});

export const getAiNewsSummary = query({
  handler: async (ctx) => {
    const latestSummary = await ctx.db
      .query("marketNewsSummary")
      .order("desc")
      .first();

    // Handle backward compatibility - extract headline from analysis if not present
    if (latestSummary && !latestSummary.headline && latestSummary.analysis) {
      return {
        ...latestSummary,
        headline:
          latestSummary.analysis.split("\n")[0].slice(0, 200) +
          (latestSummary.analysis.length > 200 ? "..." : ""),
      };
    }

    return latestSummary || null;
  },
});

export const generateAiPortfolioSummary = action({
  args: {
    portfolioId: v.id("portfolios"),
  },
  handler: async (ctx, args) => {
    if (!aiServiceUrl) {
      throw new Error("AI_SERVICE_URL is not defined");
    }

    // Get portfolio data
    const portfolio = await ctx.runQuery(api.portfolios.getPortfolioById, {
      portfolioId: args.portfolioId,
    });

    if (!portfolio) {
      throw new Error("Portfolio not found");
    }

    // Get portfolio analytics for stats
    const analytics = await ctx.runQuery(api.portfolios.getPortfolioAnalytics, {
      portfolioId: args.portfolioId,
    });

    // Calculate asset allocation
    const totalValue = portfolio.currentValue || 0;
    const assetAllocation = portfolio.assets?.reduce(
      (allocation: any, asset: any) => {
        if (asset.type) {
          allocation[asset.type] =
            (allocation[asset.type] || 0) + (asset.currentValue || 0);
        }
        return allocation;
      },
      {},
    );

    const allocationPercentages = Object.entries(assetAllocation || {}).map(
      ([type, value]) => ({
        asset_type: type,
        percentage:
          totalValue > 0 ? ((value as number) / totalValue) * 100 : "unknown",
        value: value,
      }),
    );

    // Format portfolio data for AI API
    const portfolioData = {
      assets:
        portfolio.assets?.map((asset: any) => ({
          symbol: asset.symbol || "unknown",
          name: asset.name || "unknown",
          type: asset.type || "unknown",
          allocation: asset.allocation || "unknown",
          shares: asset.quantity || "unknown",
          current_price: asset.currentPrice || "unknown",
          cost_basis: asset.averagePrice || "unknown",
          country: asset.country || "unknown",
          current_value: asset.currentValue || "unknown",
        })) || [],
      asset_allocation: allocationPercentages,
      portfolio_stats: {
        total_value: portfolio.currentValue || "unknown",
        ytd_return: analytics?.performanceMetrics?.ytdReturn || "unknown",
        total_return: analytics?.performanceMetrics?.totalReturn || "unknown",
        sharpe_ratio: analytics?.riskMetrics?.sharpeRatio || "unknown",
        volatility: analytics?.riskMetrics?.volatility || "unknown",
        beta_to_spy: analytics?.riskMetrics?.beta || "unknown",
        alpha_vs_spy: analytics?.riskMetrics?.alpha || "unknown",
        max_drawdown: analytics?.riskMetrics?.maxDrawdown || "unknown",
        tracking_error: analytics?.riskMetrics?.trackingError || "unknown",
        sortino_ratio: analytics?.riskMetrics?.sortinoRatio || "unknown",
      },
      investor_thesis: {
        summary: portfolio.description || "No strategy description provided",
        risk_tolerance: portfolio.riskTolerance || "unknown",
        time_horizon: portfolio.timeHorizon || "unknown",
      },
      context: {
        data_availability:
          "Some portfolio metrics may show 'unknown' due to insufficient data, recent portfolio creation, or pending market data updates. Unknown values typically indicate that calculations cannot be performed without adequate historical data or when assets lack current market pricing.",
        portfolio_size: portfolio.assets?.length || 0,
        last_updated: portfolio.updatedAt || "unknown",
      },
    };

    // Call AI API
    const aiSummaryResponse = await fetch(`${aiServiceUrl}/api/v2/portfolio`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ portfolio_data: portfolioData }),
    });

    if (!aiSummaryResponse.ok) {
      const errorText = await aiSummaryResponse.text();
      throw new Error(
        `Failed to generate AI portfolio summary: ${aiSummaryResponse.statusText}`,
      );
    }

    const aiSummary = await aiSummaryResponse.json();

    // Store summary in dedicated portfolio AI table
    await ctx.runMutation(internal.ai.storePortfolioAiSummary, {
      portfolioId: args.portfolioId,
      analysis: aiSummary.analysis,
      headline: aiSummary.headline || null,
      timestamp: new Date(aiSummary.timestamp).getTime(),
      modelUsed: aiSummary.model_used,
      headlineModelUsed: aiSummary.headline_model_used || null,
      tokensUsed: aiSummary.tokens_used,
      headlineTokensUsed: aiSummary.headline_tokens_used || null,
      processingTimeMs: aiSummary.processing_time_ms,
      headlineGenerationTimeMs: aiSummary.headline_generation_time_ms || null,
      taskType: aiSummary.task_type || null,
      apiVersion: aiSummary.api_version || null,
    });

    return {
      success: true,
      headline: aiSummary.headline,
      analysis: aiSummary.analysis,
      message: "Portfolio AI summary generated successfully",
    };
  },
});

// Store portfolio AI summary in dedicated table
export const storePortfolioAiSummary = internalMutation({
  args: {
    portfolioId: v.id("portfolios"),
    analysis: v.string(),
    headline: v.optional(v.string()),
    timestamp: v.number(),
    modelUsed: v.string(),
    headlineModelUsed: v.optional(v.string()),
    tokensUsed: v.number(),
    headlineTokensUsed: v.optional(v.number()),
    processingTimeMs: v.number(),
    headlineGenerationTimeMs: v.optional(v.number()),
    taskType: v.optional(v.string()),
    apiVersion: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Store AI summary in dedicated portfolioAiSummary table
    await ctx.db.insert("portfolioAiSummary", {
      portfolioId: args.portfolioId,
      analysis: args.analysis,
      headline: args.headline,
      modelUsed: args.modelUsed,
      headlineModelUsed: args.headlineModelUsed,
      tokensUsed: args.tokensUsed,
      headlineTokensUsed: args.headlineTokensUsed,
      processingTimeMs: args.processingTimeMs,
      headlineGenerationTimeMs: args.headlineGenerationTimeMs,
      timestamp: args.timestamp,
      taskType: args.taskType,
      apiVersion: args.apiVersion,
    });
  },
});

// Get portfolio AI summary
export const getPortfolioAiSummary = query({
  args: {
    portfolioId: v.id("portfolios"),
  },
  handler: async (ctx, args) => {
    // Get the most recent AI summary for this portfolio
    const latestAISummary = await ctx.db
      .query("portfolioAiSummary")
      .withIndex("byPortfolio", (q) => q.eq("portfolioId", args.portfolioId))
      .order("desc")
      .first();

    if (!latestAISummary) {
      return null;
    }

    return {
      headline: latestAISummary.headline,
      analysis: latestAISummary.analysis,
      timestamp: latestAISummary.timestamp,
    };
  },
});

// Test AI API connection with dummy data
export const testAiConnection = action({
  handler: async (ctx, args) => {
    if (!aiServiceUrl) {
      throw new Error("AI_SERVICE_URL is not defined");
    }

    // Dummy news data for testing
    const dummyNews = [
      {
        title: "Test Market Update - Apple Reports Strong Q4 Earnings",
        content:
          "Apple Inc. reported record quarterly earnings with revenue growth of 15% year-over-year, beating analyst expectations. The company's iPhone sales increased significantly in international markets, particularly in emerging economies. Services revenue also showed strong growth at 12% compared to the previous quarter.",
        source: "Test Reuters",
        published_at: "2024-01-15T10:00:00Z",
      },
      {
        title: "Federal Reserve Signals Rate Stability",
        content:
          "The Federal Reserve indicated it will maintain current interest rates through the next quarter, citing stable inflation metrics and steady employment figures. This decision comes after careful analysis of recent economic data showing controlled inflation at 2.1% annually.",
        source: "Test Bloomberg",
        published_at: "2024-01-15T11:30:00Z",
      },
      {
        title: "Tech Sector Shows Resilience Amid Market Volatility",
        content:
          "Technology stocks demonstrated strong performance this week despite broader market concerns. Microsoft, Google, and Amazon all posted positive gains, with cloud services driving much of the growth. Analysts remain optimistic about the sector's long-term prospects.",
        source: "Test Financial Times",
        published_at: "2024-01-15T14:45:00Z",
      },
    ];

    // Call AI API with dummy data
    const aiSummaryResponse = await fetch(`${aiServiceUrl}/api/v2/news`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ news_data: dummyNews }),
    });

    if (!aiSummaryResponse.ok) {
      const errorText = await aiSummaryResponse.text();
      throw new Error(`AI API test failed: ${aiSummaryResponse.statusText}`);
    }

    const aiSummary = await aiSummaryResponse.json();

    return {
      success: true,
      response: aiSummary,
      message: "AI API test completed successfully",
    };
  },
});

// Manually trigger AI news summary update
export const triggerAiNewsSummaryUpdate = action({
  handler: async (ctx, args) => {
    try {
      await ctx.runAction(api.ai.generateAiNewsSummary);

      return {
        success: true,
        message: "AI news summary updated successfully",
      };
    } catch (error) {
      throw new Error(`Failed to update AI news summary: ${error}`);
    }
  },
});

// Manually trigger AI portfolio summary update
export const triggerAiPortfolioSummaryUpdate = action({
  args: {
    portfolioId: v.id("portfolios"),
  },
  handler: async (ctx, args) => {
    try {
      const result = await ctx.runAction(api.ai.generateAiPortfolioSummary, {
        portfolioId: args.portfolioId,
      });

      return result;
    } catch (error) {
      throw new Error(`Failed to update AI portfolio summary: ${error}`);
    }
  },
});
