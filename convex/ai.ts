import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { query,action, mutation, internalMutation } from "./_generated/server";

const marketDataServiceUrl=process.env.MARKET_DATA_SERVICE_URL
const aiServiceUrl=process.env.AI_SERVICE_URL

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
    const newsArticlesResponse = await fetch(`${marketDataServiceUrl}/news`)
    if (!newsArticlesResponse.ok) {
      throw new Error(`Failed to fetch market news: ${newsArticlesResponse.statusText}`);
    }
    const newsArticles = await newsArticlesResponse.json();
    
    // call external ai endpoint to generate summary
    const aiSummaryResponse = await fetch(`${aiServiceUrl}/api/v1/news`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ news_data: newsArticles.Data }),
    });
    if (!aiSummaryResponse.ok) {
      throw new Error(`Failed to generate AI summary: ${aiSummaryResponse.statusText}`);
    }
    const aiSummary = await aiSummaryResponse.json();
    
    // store summary in convex database
    await ctx.runMutation(internal.ai.storeAiNewsSummary, {
      analysis: aiSummary.analysis,
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
    timestamp: v.number(),
    modelUsed: v.string(),
    tokensUsed: v.number(),
    processingTimeMs: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("marketNewsSummary", {
      analysis: args.analysis,
      timestamp: args.timestamp,
      modelUsed: args.modelUsed,
      tokensUsed: args.tokensUsed,
      processingTimeMs: args.processingTimeMs,
    })
  },
});

export const getAiNewsSummary = query({
  handler: async (ctx) => {
    const latestSummary = await ctx.db.query("marketNewsSummary").order("desc").first();
    return latestSummary || null;
  },
});