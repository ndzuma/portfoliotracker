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

    // Format portfolio data for AI API
    const portfolioData = {
      assets:
        portfolio.assets?.map((asset: any) => ({
          symbol: asset.symbol || asset.name,
          name: asset.name,
          type: asset.type,
          allocation: asset.allocation || 0,
          shares: asset.quantity || 0,
          current_price: asset.currentPrice || 0,
          cost_basis: asset.averagePrice || 0,
        })) || [],
      portfolio_stats: {
        total_value: portfolio.currentValue || 0,
        ytd_return: analytics?.performanceMetrics?.ytdReturn || 0,
        total_return: analytics?.performanceMetrics?.totalReturn || 0,
        sharpe_ratio: analytics?.riskMetrics?.sharpeRatio || 0,
        volatility: analytics?.riskMetrics?.volatility || 0,
        beta_to_spy: analytics?.riskMetrics?.beta || 0,
        alpha_vs_spy: analytics?.riskMetrics?.alpha || 0,
      },
      investor_thesis: {
        summary: portfolio.description || "No strategy description provided",
        risk_tolerance: "Moderate", // Could be made configurable
        time_horizon: "Long-term", // Could be made configurable
      },
    };

    console.log("Generating AI portfolio summary for:", portfolio.name);
    console.log("Portfolio data:", JSON.stringify(portfolioData, null, 2));

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
      console.error(
        `AI Portfolio analysis failed: ${aiSummaryResponse.status} ${aiSummaryResponse.statusText}`,
      );
      console.error("Error response:", errorText);
      throw new Error(
        `Failed to generate AI portfolio summary: ${aiSummaryResponse.statusText}`,
      );
    }

    const aiSummary = await aiSummaryResponse.json();

    console.log("=== AI PORTFOLIO ANALYSIS RESPONSE ===");
    console.log("Full response:", JSON.stringify(aiSummary, null, 2));
    console.log("Headline:", aiSummary.headline);
    console.log("Analysis preview:", aiSummary.analysis?.slice(0, 200) + "...");

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

    console.log(
      "Stored AI summary in portfolioAiSummary table with timestamp:",
      args.timestamp,
    );
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

    console.log("Testing AI API with dummy news data...");
    console.log("Dummy news articles:", JSON.stringify(dummyNews, null, 2));

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
      console.error(
        `AI API test failed: ${aiSummaryResponse.status} ${aiSummaryResponse.statusText}`,
      );
      console.error("Error response:", errorText);
      throw new Error(`AI API test failed: ${aiSummaryResponse.statusText}`);
    }

    const aiSummary = await aiSummaryResponse.json();

    console.log("=== AI API TEST RESPONSE ===");
    console.log("Full response:", JSON.stringify(aiSummary, null, 2));
    console.log("Headline:", aiSummary.headline);
    console.log("Analysis preview:", aiSummary.analysis?.slice(0, 200) + "...");
    console.log("Model used:", aiSummary.model_used);
    console.log("Headline model:", aiSummary.headline_model_used);
    console.log("Tokens used:", aiSummary.tokens_used);
    console.log("Headline tokens:", aiSummary.headline_tokens_used);
    console.log("Processing time:", aiSummary.processing_time_ms, "ms");
    console.log("=== END TEST RESPONSE ===");

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
    console.log("Manually triggering AI news summary update...");

    try {
      await ctx.runAction(api.ai.generateAiNewsSummary);
      console.log("AI news summary update completed successfully");

      return {
        success: true,
        message: "AI news summary updated successfully",
      };
    } catch (error) {
      console.error("Failed to update AI news summary:", error);
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
    console.log(
      "Manually triggering AI portfolio summary update for:",
      args.portfolioId,
    );

    try {
      const result = await ctx.runAction(api.ai.generateAiPortfolioSummary, {
        portfolioId: args.portfolioId,
      });
      console.log("AI portfolio summary update completed successfully");

      return result;
    } catch (error) {
      console.error("Failed to update AI portfolio summary:", error);
      throw new Error(`Failed to update AI portfolio summary: ${error}`);
    }
  },
});
