import { query } from "./_generated/server";
import { v } from "convex/values";

// Get all portfolios for a user with computed fields
export const getUserPorfolios = query({
  args: { userId: v.id("users") || v.string() },
  handler: async (ctx, args) => {
    const portfolios = await ctx.db.query("portfolios").withIndex("byUser", (q) =>
      q.eq("userId", args.userId)
    ).collect();
    
    const results = await Promise.all(
      portfolios.map(async (p) => { 
        const assets = await ctx.db
          .query("assets")
          .withIndex("byPortfolio", (q) => q.eq("portfolioId", p._id))
          .collect();
        const assetIds = assets.map(a => a._id);
        const transactionsByAsset: Record<string, any[]> = {};
        for (const assetId of assetIds) {
          const txns = await ctx.db
            .query("transactions")
            .withIndex("byAsset", q => q.eq("assetId", assetId))
            .collect();
          
          transactionsByAsset[assetId] = txns;
        }
        
        let portfolioCostBasis = 0;
        let portfolioCurrentValue = 0;

        for (const asset of assets) { 
          const txns = transactionsByAsset[asset._id] || [];
          
          const quantity = txns.reduce((q, t) => q + (t.type === "buy" ? t.quantity : -t.quantity), 0);
          const totalCost = txns.reduce((sum, t) => sum + (t.type === "buy" ? t.quantity * t.price : 0), 0);
          
          const currentPrice = asset.currentPrice || 1;
          const currentValue = quantity * currentPrice;

          portfolioCostBasis += totalCost;
          portfolioCurrentValue += currentValue;
        }
        const change = portfolioCurrentValue - portfolioCostBasis;
        const changePercent = portfolioCostBasis ? (change / portfolioCostBasis) * 100 : 0;
        
        return {
          ...p,
          costBasis: portfolioCostBasis,
          currentValue: portfolioCurrentValue,
          change,
          changePercent,
          assetsCount: assets.length,
        };
      })
    )
    
    return results;
  },
});

export const getPortfolioById = query({
  args: { portfolioId: v.id("portfolios") || v.string() },
  handler: async (ctx, args) => {
    const portfolio = await ctx.db.get(args.portfolioId);
    if (!portfolio) {
      throw new Error("Portfolio not found");
    }
    const assets = await ctx.db
      .query("assets")
      .withIndex("byPortfolio", (q) => q.eq("portfolioId", portfolio._id))
      .collect();
    const assetIds = assets.map(a => a._id);
    const transactionsByAsset: Record<string, any[]> = {};
    for (const assetId of assetIds) {
      const txns = await ctx.db
        .query("transactions")
        .withIndex("byAsset", q => q.eq("assetId", assetId))
        .collect();
      
      transactionsByAsset[assetId] = txns;
    }
    
    let portfolioCostBasis = 0;
    let portfolioCurrentValue = 0;
    
    for (const asset of assets) { 
      const txns = transactionsByAsset[asset._id] || [];
      
      const quantity = txns.reduce((q, t) => q + (t.type === "buy" ? t.quantity : -t.quantity), 0);
      const totalCost = txns.reduce((sum, t) => sum + (t.type === "buy" ? t.quantity * t.price : 0), 0);
      const averageBuyPrice = quantity ? totalCost / quantity : 0;
      
      const currentPrice = asset.currentPrice || 1;
      const currentValue = quantity * currentPrice;
      
      asset.quantity = quantity;
      asset.avgBuyPrice = averageBuyPrice;
      asset.costBasis = totalCost;
      asset.currentValue = currentValue;
      asset.change = currentValue - totalCost;
      asset.changePercent = totalCost ? ((currentValue - totalCost) / totalCost) * 100 : 0;
      
      portfolioCostBasis += totalCost;
      portfolioCurrentValue += currentValue;
    }
    
    for (const asset of assets) {
      asset.allocation = portfolioCurrentValue ? (asset.currentValue / portfolioCurrentValue) * 100 : 0;
    }
    
    const result = {
      ...portfolio,
      costBasis: portfolioCostBasis,
      currentValue: portfolioCurrentValue,
      change: portfolioCurrentValue - portfolioCostBasis || 0,
      changePercent: portfolioCostBasis ? ((portfolioCurrentValue - portfolioCostBasis) / portfolioCostBasis) * 100 : 0 || 0,
      assets: assets
    };
    console.log("Portfolio Details:", result);
    return result;
  },
});