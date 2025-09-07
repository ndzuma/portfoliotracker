import { api, internal } from "./_generated/api";
import { query, mutation } from "./_generated/server";
import { GenericId, v } from "convex/values";

const aiPlaceholderSummary =
  "Strong tech performance (+18.2% MTD)** driving growth, but **underweight on dividends (2.3%)**. Consider adding **renewable energy stocks** and **international equities** (5-10%) to enhance diversification. Current **cash position (12%)** appropriate amid market volatility.";
const aiPlaceholderHeadline = "Portfolio Diversification Analysis";

// Get all portfolios for a user with computed fields
export const getUserPorfolios = query({
  args: {
    userId: v.optional(v.union(v.id("users"), v.string())),
  },
  handler: async (ctx, args) => {
    // Return empty array if userId is not provided
    if (!args.userId) {
      return [];
    }

    const portfolios = await ctx.db
      .query("portfolios")
      .withIndex("byUser", (q) => q.eq("userId", args.userId))
      .collect();

    const results = await Promise.all(
      portfolios.map(async (p) => {
        const assets = await ctx.db
          .query("assets")
          .withIndex("byPortfolio", (q) => q.eq("portfolioId", p._id))
          .collect();
        const assetIds = assets.map((a) => a._id);
        const transactionsByAsset: Record<string, any[]> = {};
        for (const assetId of assetIds) {
          const txns = await ctx.db
            .query("transactions")
            .withIndex("byAsset", (q) => q.eq("assetId", assetId))
            .collect();

          transactionsByAsset[assetId] = txns;
        }

        let portfolioCostBasis = 0;
        let portfolioCurrentValue = 0;

        for (const asset of assets) {
          const txns = transactionsByAsset[asset._id] || [];

          const quantity = txns.reduce(
            (q, t) => q + (t.type === "buy" ? t.quantity : -t.quantity),
            0,
          );
          const totalCost = txns.reduce(
            (sum, t) => sum + (t.type === "buy" ? t.quantity * t.price : 0),
            0,
          );

          // Check if there's a current price in marketCurrentData table
          let currentPrice = asset.currentPrice || 1;
          if (asset.symbol && typeof asset.symbol === "string") {
            const marketData = await ctx.db
              .query("marketCurrentData")
              .withIndex("byTicker", (q) => q.eq("ticker", asset.symbol))
              .first();
            if (marketData && marketData.price) {
              currentPrice = marketData.price;
            }
          }
          const currentValue = quantity * currentPrice;

          portfolioCostBasis += totalCost;
          portfolioCurrentValue += currentValue;
        }
        const change = portfolioCurrentValue - portfolioCostBasis;
        const changePercent = portfolioCostBasis
          ? (change / portfolioCostBasis) * 100
          : 0;

        return {
          ...p,
          costBasis: portfolioCostBasis,
          currentValue: portfolioCurrentValue,
          change,
          changePercent,
          assetsCount: assets.length,
        };
      }),
    );

    return results;
  },
});

export const canUserAccessPortfolio = query({
  args: {
    portfolioId: v.union(v.id("portfolios"), v.string()),
  },
  handler: async (ctx, args) => {
    const isUsers = await ctx.auth.getUserIdentity();
    if (!isUsers) {
      return false;
    }
    const { subject } = isUsers;
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), subject))
      .first();

    const portfolio = await ctx.db.get(args.portfolioId);
    if (!portfolio) {
      return false;
    }
    if (portfolio.userId !== user?._id) {
      return false;
    }
    return true;
  },
});

// Get a single portfolio by ID with computed fields and AI summary
export const getPortfolioById = query({
  args: {
    portfolioId: v.union(v.id("portfolios"), v.string()),
  },
  handler: async (ctx, args) => {
    const assets = await ctx.db
      .query("assets")
      .withIndex("byPortfolio", (q) => q.eq("portfolioId", args.portfolioId))
      .collect();
    const assetIds = assets.map((a) => a._id);
    const transactionsByAsset: Record<string, any[]> = {};
    for (const assetId of assetIds) {
      const txns = await ctx.db
        .query("transactions")
        .withIndex("byAsset", (q) => q.eq("assetId", assetId))
        .collect();

      transactionsByAsset[assetId] = txns;
    }

    let portfolioCostBasis = 0;
    let portfolioCurrentValue = 0;

    for (const asset of assets) {
      const txns = transactionsByAsset[asset._id] || [];

      const quantity = txns.reduce(
        (q, t) => q + (t.type === "buy" ? t.quantity : -t.quantity),
        0,
      );
      const totalCost = txns.reduce(
        (sum, t) => sum + (t.type === "buy" ? t.quantity * t.price : 0),
        0,
      );
      const averageBuyPrice = quantity ? totalCost / quantity : 0;

      // Check if there's a current price in marketCurrentData table
      let currentPrice = asset.currentPrice || 1;
      if (asset.symbol && typeof asset.symbol === "string") {
        const marketData = await ctx.db
          .query("marketCurrentData")
          .withIndex("byTicker", (q) => q.eq("ticker", asset.symbol))
          .first();
        if (marketData && marketData.price) {
          currentPrice = marketData.price;
        }
      }
      const currentValue = quantity * currentPrice;

      asset.currentPrice = currentPrice;
      asset.quantity = quantity;
      asset.avgBuyPrice = averageBuyPrice;
      asset.costBasis = totalCost;
      asset.currentValue = currentValue;
      asset.change = currentValue - totalCost;
      asset.changePercent = totalCost
        ? ((currentValue - totalCost) / totalCost) * 100
        : 0;

      portfolioCostBasis += totalCost;
      portfolioCurrentValue += currentValue;
    }

    for (const asset of assets) {
      asset.allocation = portfolioCurrentValue
        ? (asset.currentValue / portfolioCurrentValue) * 100
        : 0;
    }

    // Get the portfolio information
    const portfolio = await ctx.db.get(args.portfolioId);
    if (!portfolio) {
      throw new Error("Portfolio not found");
    }

    let aiHeadline = "";
    let aiSummary = "";

    if (assets.length === 0) {
      aiHeadline = "No assets in portfolio";
      aiSummary = "Add assets to your portfolio to get insights.";
    } else {
      const latestSnapshot = await ctx.db
        .query("portfolioSnapshots")
        .withIndex("byPortfolio", (q) => q.eq("portfolioId", args.portfolioId))
        .first();
      if (
        latestSnapshot &&
        latestSnapshot.aiHeadline &&
        latestSnapshot.aiSummary
      ) {
        aiHeadline = latestSnapshot.aiHeadline;
        aiSummary = latestSnapshot.aiSummary;
      } else {
        // temporary placeholder until AI integration is done
        aiHeadline = aiPlaceholderHeadline;
        aiSummary = aiPlaceholderSummary;
      }
    }

    const result = {
      ...portfolio,
      aiHeadline,
      aiSummary,
      costBasis: portfolioCostBasis,
      currentValue: portfolioCurrentValue,
      change: portfolioCurrentValue - portfolioCostBasis || 0,
      changePercent: portfolioCostBasis
        ? ((portfolioCurrentValue - portfolioCostBasis) / portfolioCostBasis) *
          100
        : 0 || 0,
      assets: assets,
    };
    return result;
  },
});

// Create a new portfolio
export const createPortfolio = mutation({
  args: {
    userId: v.union(v.id("users"), v.string()),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const portfolioId = await ctx.db.insert("portfolios", {
      userId: args.userId,
      name: args.name,
      description: args.description || "",
    });
    return portfolioId;
  },
});

// Update an existing portfolio
export const updatePortfolio = mutation({
  args: {
    portfolioId: v.union(v.id("portfolios"), v.string()),
    userId: v.union(v.id("users"), v.string()),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const portfolio = await ctx.db.get(args.portfolioId);
    if (!portfolio) {
      throw new Error("Portfolio not found");
    }
    if (portfolio.userId !== args.userId) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(args.portfolioId, {
      name: args.name ?? portfolio.name,
      description: args.description ?? portfolio.description,
    });
  },
});

// Delete a portfolio and its associated assets and transactions
export const deletePortfolio = mutation({
  args: {
    portfolioId: v.union(v.id("portfolios"), v.string()),
    userId: v.union(v.id("users"), v.string()),
  },
  handler: async (ctx, args) => {
    const portfolio = await ctx.db.get(args.portfolioId as v.id<"portfolios">);
    if (!portfolio) {
      throw new Error("Portfolio not found");
    }
    if (portfolio.userId !== args.userId) {
      throw new Error("Unauthorized");
    }

    // Delete associated assets and their transactions
    const assets = await ctx.db
      .query("assets")
      .withIndex("byPortfolio", (q) => q.eq("portfolioId", portfolio._id))
      .collect();

    for (const asset of assets) {
      // Delete transactions for this asset
      const transactions = await ctx.db
        .query("transactions")
        .withIndex("byAsset", (q) => q.eq("assetId", asset._id))
        .collect();

      for (const txn of transactions) {
        await ctx.db.delete(txn._id);
      }

      // Delete the asset
      await ctx.db.delete(asset._id);
    }

    // Finally, delete the portfolio
    await ctx.db.delete(args.portfolioId);
  },
});

// get portfolio analytics
export const getPortfolioAnalytics = query({
  args: {
    portfolioId: v.union(v.id("portfolios"), v.string()),
  },
  handler: async (ctx, args) => {
    const portfolio = await ctx.db.get(args.portfolioId);
    if (!portfolio) throw new Error("Portfolio not found");

    // Get assets in this portfolio
    const assets = await ctx.db
      .query("assets")
      .filter((q) => q.eq(q.field("portfolioId"), args.portfolioId))
      .collect();

    if (assets.length === 0) {
      return null;
    }

    for (const asset of assets) {
      const transactions = await ctx.db
        .query("transactions")
        .filter((q) => q.eq(q.field("assetId"), asset._id))
        .collect();
      asset.transactions = transactions;
    }

    let transactions: any[] = [];
    for (const asset of assets) {
      transactions = transactions.concat(asset.transactions || []);
    }

    transactions.sort((a, b) => a.date - b.date);

    // get current price for each asset if symbol is available
    for (const asset of assets) {
      if (asset.symbol && typeof asset.symbol === "string") {
        const marketData = await ctx.db
          .query("marketCurrentData")
          .withIndex("byTicker", (q) => q.eq("ticker", asset.symbol))
          .first();
        if (marketData && marketData.price) {
          asset.currentPrice = marketData.price;
        }
      }
    }

    const startDate = new Date("2015-01-01");
    const endDate = new Date();

    // Check if we have 52+ weeks of snapshots available
    const snapshotCount = await ctx.runQuery(
      internal.marketData.getPortfolioSnapshotCount,
      {
        portfolioId: args.portfolioId,
        startDate: startDate.getTime(),
        endDate: endDate.getTime(),
      },
    );

    let historicalData;
    let dataSource = "daily"; // Track data source for helper functions

    if (snapshotCount >= 52) {
      // Use weekly snapshots for analytics (52+ weeks available)
      historicalData = await ctx.runQuery(
        internal.marketData.getPortfolioSnapshotsForAnalytics,
        {
          portfolioId: args.portfolioId,
          startDate: startDate.getTime(),
          endDate: endDate.getTime(),
        },
      );
      dataSource = "weekly";
    } else {
      // Fall back to daily historical data
      historicalData = await ctx.runQuery(api.marketData.getHistoricalData, {
        portfolioId: args.portfolioId,
        isForChart: false,
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      });
      dataSource = "daily";
    }

    if (!historicalData || historicalData.length === 0) {
      return null;
    }

    // Always calculate current value live (not from snapshots)
    const currentValue = await ctx.runQuery(
      internal.marketData.calculatePortfolioValueAtDate,
      {
        portfolioId: args.portfolioId,
        date: endDate.getTime(),
      },
    );

    // Replace the last data point with live current value
    if (historicalData.length > 0) {
      const lastDataPoint = historicalData[historicalData.length - 1];
      const lastDataDate = new Date(lastDataPoint.date)
        .toISOString()
        .split("T")[0];
      const todayStr = endDate.toISOString().split("T")[0];

      if (lastDataDate === todayStr) {
        // Replace today's value with live calculation
        historicalData[historicalData.length - 1] = {
          ...lastDataPoint,
          value: currentValue,
        };
      } else {
        // Add today's live value if not present
        historicalData.push({
          date: todayStr,
          value: currentValue,
        });
      }
    }

    historicalData = historicalData.filter((data) => {
      const dataDate = new Date(data.date);
      return dataDate >= startDate;
    });

    if (historicalData.length === 0) {
      throw new Error("No historical data available for this portfolio");
    }

    const start = getEarliestDate(historicalData);
    const returns = calculateReturns(historicalData, dataSource);

    // Get benchmark data (always daily for consistency)
    const benchmarkData = await ctx.db
      .query("marketHistoricData")
      .withIndex("byTicker", (q) =>
        q
          .eq("ticker", "SPY")
          .gte("date", start?.toISOString().split("T")[0] || "2015-01-01"),
      )
      .collect();

    if (benchmarkData.length === 0) {
      throw new Error("No benchmark data available");
    }

    const formatedBenchmarkData = benchmarkData.map((d) => ({
      date: d.date,
      value: d.close,
    }));

    const benchmarkReturns = calculateReturns(formatedBenchmarkData, "daily");

    // Calculate Risk metrics (adjusted for data source)
    const riskMetrics = {
      volatility: calculateVolatility(returns, dataSource),
      maxDrawdown: calculateMaxDrawdown(historicalData),
      beta: calculateBeta(returns, benchmarkReturns),
      valueAtRisk: {
        daily: calculateVaR(returns, 0.95),
        monthly: calculateVaR(
          aggregateReturns(returns, dataSource === "weekly" ? 4 : 21),
          0.95,
        ), // 4 weeks for monthly with weekly data
      },
      sharpeRatio: calculateSharpeRatio(returns, getRiskFreeRate(), dataSource),
      downsideDeviation: calculateDownsideDeviation(returns),
      assetDiversification: calculateAssetDiversification(assets),
    };

    // Calculate Performance metrics (adjusted for data source)
    const performanceMetrics = {
      totalReturn: calculateTotalReturn(historicalData),
      timeWeightedReturn: calculateTimeWeightedReturn(
        historicalData,
        transactions,
      ),
      annualizedReturn: calculateAnnualizedReturn(historicalData, dataSource),
      monthlyReturns: calculateMonthlyReturns(historicalData, dataSource),
      ytdReturn: calculateYTDReturn(historicalData),
      rollingReturns: calculateRollingReturns(historicalData, dataSource),
      bestWorstPeriods: {
        bestMonth: findBestPeriod(returns, dataSource === "weekly" ? 4 : 21), // 4 weeks for monthly with weekly data
        worstMonth: findWorstPeriod(returns, dataSource === "weekly" ? 4 : 21),
        bestYear: findBestPeriod(returns, dataSource === "weekly" ? 52 : 252), // 52 weeks for yearly with weekly data
        worstYear: findWorstPeriod(returns, dataSource === "weekly" ? 52 : 252),
      },
      alpha: calculateAlpha(returns, benchmarkReturns, riskMetrics.beta),
      winRate: calculateWinRate(returns),
    };

    // Benchmark comparisons
    const benchmarkComparisons = {
      cumulativeOutperformance: calculateCumulativeOutperformance(
        historicalData,
        benchmarkData,
      ),
      trackingError: calculateTrackingError(returns, benchmarkReturns),
      marketCapture: {
        upCapture: calculateUpMarketCapture(returns, benchmarkReturns),
        downCapture: calculateDownMarketCapture(returns, benchmarkReturns),
      },
      informationRatio: calculateInformationRatio(
        returns,
        benchmarkReturns,
        calculateTrackingError(returns, benchmarkReturns),
      ),
      correlation: calculateCorrelation(returns, benchmarkReturns),
      yearlyComparison: calculateYearlyComparison(
        historicalData,
        benchmarkData,
        dataSource,
      ),
    };
    const assetAllocation = {
      // Breakdown by asset type
      byType: calculateAllocationByType(assets),
      // todo add:
      // Current allocation vs historical (if historical allocation data available)
      // Contribution to performance by asset type
      // Risk contribution by asset type
    };

    return {
      riskMetrics,
      performanceMetrics,
      benchmarkComparisons,
      assetAllocation,
      metadata: {
        calculatedAt: new Date().toISOString(),
        dataPoints: historicalData.length,
        dataSource, // Track whether we used weekly snapshots or daily data
        dateRange: {
          start: historicalData[0]?.date || startDate.toISOString(),
          end:
            historicalData[historicalData.length - 1]?.date ||
            new Date().toISOString(),
        },
        assetCount: assets.length,
        assetTypes: countAssetTypes(assets),
      },
    };
  },
});

// Helper functions returns {date, returnValue}[]
function calculateReturns(
  priceData: any[],
  dataSource: "daily" | "weekly" = "daily",
) {
  // Convert price/value series to returns
  const returns = [];
  for (let i = 1; i < priceData.length; i++) {
    const prev = priceData[i - 1];
    const curr = priceData[i];
    const returnValue = (curr.value - prev.value) / prev.value;
    returns.push({ date: curr.date, returnValue });
  }
  return returns;
}

// Legacy function for backward compatibility
function calculateDailyReturns(priceData: any[]) {
  return calculateReturns(priceData, "daily");
}

// get earliest date. the data is in format {date: string, value: number}[]
function getEarliestDate(dates: { date: string; value: number }[]) {
  if (dates.length === 0) return null;
  let earliest = new Date(dates[0].date);
  for (const d of dates) {
    const current = new Date(d.date);
    if (current < earliest) {
      earliest = current;
    }
  }
  return earliest;
}
function calculateVolatility(
  returns: { date: any; returnValue: number }[],
  dataSource: "daily" | "weekly" = "daily",
) {
  const n = returns.length;
  if (n === 0) return 0;
  const mean = returns.reduce((sum, r) => sum + r.returnValue, 0) / n;
  const variance =
    returns.reduce((sum, r) => sum + (r.returnValue - mean) ** 2, 0) / n;
  const periodVolatility = Math.sqrt(variance);

  // Annualize based on data frequency
  const periodsPerYear = dataSource === "weekly" ? 52 : 252;
  const annualizedVolatility = periodVolatility * Math.sqrt(periodsPerYear);
  return annualizedVolatility;
}

function calculateMaxDrawdown(
  historicalData: { date: string; value: number }[],
) {
  let peak = historicalData[0].value;
  let maxDrawdown = 0;

  for (const data of historicalData) {
    if (data.value > peak) {
      peak = data.value;
    }
    const drawdown = (peak - data.value) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }
  return maxDrawdown;
}

function calculateBeta(
  returns: { date: any; returnValue: number }[],
  benchmarkReturns: { date: any; returnValue: number }[],
) {
  if (returns.length === 0 || benchmarkReturns.length === 0) return 0;
  const n = Math.min(returns.length, benchmarkReturns.length);
  const meanR = returns.reduce((sum, r) => sum + r.returnValue, 0) / n;
  const meanB = benchmarkReturns.reduce((sum, r) => sum + r.returnValue, 0) / n;

  let covariance = 0;
  let varianceB = 0;

  for (let i = 0; i < n; i++) {
    covariance +=
      (returns[i].returnValue - meanR) *
      (benchmarkReturns[i].returnValue - meanB);
    varianceB += (benchmarkReturns[i].returnValue - meanB) ** 2;
  }

  covariance /= n;
  varianceB /= n;

  return varianceB === 0 ? 0 : covariance / varianceB;
}

function calculateVaR(
  returns: { date: any; returnValue: number }[],
  confidenceLevel: number,
) {
  if (returns.length === 0) return 0;
  const sortedReturns = returns.map((r) => r.returnValue).sort((a, b) => a - b);
  const index = Math.floor((1 - confidenceLevel) * sortedReturns.length);
  return Math.abs(sortedReturns[index]);
}

function aggregateReturns(
  returns: { date: any; returnValue: number }[],
  periods: number,
): { date: any; returnValue: number }[] {
  const aggregated = [];

  if (returns.length <= periods) {
    return returns;
  }

  for (let i = 0; i < returns.length; i += periods) {
    const chunk = returns.slice(i, i + periods);
    if (chunk.length === 0) continue;
    const totalReturn = chunk.reduce((sum, r) => sum + r.returnValue, 0);
    aggregated.push({
      date: chunk[chunk.length - 1].date,
      returnValue: totalReturn,
    });
  }
  return aggregated;
}

function calculateSharpeRatio(
  returns: { date: any; returnValue: number }[],
  riskFreeRate: number,
  dataSource: "daily" | "weekly" = "daily",
) {
  const n = returns.length;
  if (n === 0) return 0;
  const meanReturn = returns.reduce((sum, r) => sum + r.returnValue, 0) / n;
  const periodsPerYear = dataSource === "weekly" ? 52 : 252;
  const stdDev =
    calculateVolatility(returns, dataSource) / Math.sqrt(periodsPerYear);
  const excessReturn = meanReturn - riskFreeRate;
  return stdDev === 0 ? 0 : (excessReturn / stdDev) * Math.sqrt(periodsPerYear);
}

function getRiskFreeRate(): any {
  // Placeholder: return a fixed risk-free rate (e.g., 3% annualized)
  return 0.03 / 252; // Daily risk-free rate
}

function calculateDownsideDeviation(
  returns: { date: any; returnValue: number }[],
) {
  const n = returns.length;
  if (n === 0) return 0;
  const mean = returns.reduce((sum, r) => sum + r.returnValue, 0) / n;
  const downsideReturns = returns
    .map((r) => (r.returnValue < mean ? r.returnValue - mean : 0))
    .filter((r) => r < 0);
  const downsideVariance =
    downsideReturns.reduce((sum, r) => sum + r ** 2, 0) / n;
  return Math.sqrt(downsideVariance) * Math.sqrt(252); // Annualized downside deviation
}

function calculateAssetDiversification(
  assets: {
    _id: GenericId<"assets">;
    _creationTime: number;
    symbol?: string | undefined;
    currency?: string | undefined;
    currentPrice?: number | undefined;
    notes?: string | undefined;
    type:
      | "stock"
      | "bond"
      | "commodity"
      | "real estate"
      | "cash"
      | "crypto"
      | "other";
    name: string;
    portfolioId: GenericId<"portfolios">;
  }[],
) {
  const typeCounts: Record<string, number> = {};
  for (const asset of assets) {
    typeCounts[asset.type] = (typeCounts[asset.type] || 0) + 1;
  }
  const totalAssets = assets.length;
  const diversification = Object.entries(typeCounts).map(([type, count]) => ({
    type,
    percentage: (count / totalAssets) * 100,
  }));
  return diversification;
}

function calculateAnnualizedReturn(
  historicalData: { date: string; value: number }[],
  dataSource: "daily" | "weekly" = "daily",
) {
  if (historicalData.length === 0) return 0;
  const startValue = historicalData[0].value;
  const endValue = historicalData[historicalData.length - 1].value;
  const startDate = new Date(historicalData[0].date);
  const endDate = new Date(historicalData[historicalData.length - 1].date);

  // Calculate time period based on data frequency
  const timeDiff = endDate.getTime() - startDate.getTime();
  const periodsPerYear = dataSource === "weekly" ? 52 : 252;
  const totalPeriods =
    (timeDiff / (1000 * 60 * 60 * 24)) *
    (periodsPerYear / (dataSource === "weekly" ? 7 : 365.25));

  return totalPeriods > 0
    ? Math.pow(endValue / startValue, 1 / totalPeriods) - 1
    : 0;
}

function calculateRollingReturns(
  historicalData: { date: string; value: number }[],
  dataSource: "daily" | "weekly" = "daily",
) {
  const rollingPeriods = [1, 3, 5]; // in years
  const rollingReturns: Record<string, number> = {};
  const n = historicalData.length;
  if (n === 0) return rollingReturns;

  // Adjust periods based on data frequency
  const periodsPerYear = dataSource === "weekly" ? 52 : 252;

  for (const period of rollingPeriods) {
    const periodPoints = period * periodsPerYear;
    if (n > periodPoints) {
      const startValue = historicalData[n - periodPoints - 1].value;
      const endValue = historicalData[n - 1].value;
      rollingReturns[`${period}Y`] = (endValue - startValue) / startValue;
    } else {
      rollingReturns[`${period}Y`] = 0; // Not enough data
    }
  }
  return rollingReturns;
}

function calculateTotalReturn(
  historicalData: { date: string; value: number }[],
) {
  if (historicalData.length === 0) return 0;
  const startValue = historicalData[0].value;
  const endValue = historicalData[historicalData.length - 1].value;
  return (endValue - startValue) / startValue;
}

function calculateMonthlyReturns(
  historicalData: { date: string; value: number }[],
  dataSource: "daily" | "weekly" = "daily",
) {
  if (historicalData.length === 0) return [];

  if (dataSource === "weekly") {
    // For weekly data, group by month (approximately 4 weeks per month)
    const monthlyReturns: Record<
      string,
      { startValue: number; endValue: number }
    > = {};

    for (const data of historicalData) {
      const date = new Date(data.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

      if (!monthlyReturns[monthKey]) {
        monthlyReturns[monthKey] = {
          startValue: data.value,
          endValue: data.value,
        };
      } else {
        monthlyReturns[monthKey].endValue = data.value;
      }
    }

    return Object.entries(monthlyReturns).map(([month, values]) => ({
      month,
      return: (values.endValue - values.startValue) / values.startValue,
    }));
  } else {
    // Original daily logic
    const monthlyReturns: Record<
      string,
      { startValue: number; endValue: number }
    > = {};

    for (const data of historicalData) {
      const date = new Date(data.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

      if (!monthlyReturns[monthKey]) {
        monthlyReturns[monthKey] = {
          startValue: data.value,
          endValue: data.value,
        };
      } else {
        monthlyReturns[monthKey].endValue = data.value;
      }
    }

    return Object.entries(monthlyReturns).map(([month, values]) => ({
      month,
      return: (values.endValue - values.startValue) / values.startValue,
    }));
  }
}

function calculateYTDReturn(historicalData: { date: string; value: number }[]) {
  if (historicalData.length === 0) return 0;
  const currentYear = new Date().getFullYear();
  const startOfYearData = historicalData.find((d) => {
    const date = new Date(d.date);
    return date.getFullYear() === currentYear && date.getMonth() === 0; // January of current year
  });
  if (!startOfYearData) return 0;
  const startValue = startOfYearData.value;
  const endValue = historicalData[historicalData.length - 1].value;
  return (endValue - startValue) / startValue;
}

function findBestPeriod(
  returns: { date: any; returnValue: number }[],
  periods: number,
) {
  if (returns.length === 0) return null;
  let bestPeriod = null;
  let bestReturn = -Infinity;

  if (returns.length <= periods) {
    const totalReturn = returns.reduce((sum, r) => sum + r.returnValue, 0);
    return {
      startDate: returns[0].date,
      endDate: returns[returns.length - 1].date,
      return: totalReturn,
    };
  }

  for (let i = 0; i <= returns.length - periods; i++) {
    const periodReturns = returns.slice(i, i + periods);
    const totalReturn = periodReturns.reduce(
      (sum, r) => sum + r.returnValue,
      0,
    );
    if (totalReturn > bestReturn) {
      bestReturn = totalReturn;
      bestPeriod = {
        startDate: periodReturns[0].date,
        endDate: periodReturns[periodReturns.length - 1].date,
        return: totalReturn,
      };
    }
  }
  return bestPeriod ?? 0;
}
function findWorstPeriod(
  returns: { date: any; returnValue: number }[],
  periods: number,
) {
  if (returns.length === 0) return null;
  let worstPeriod = null;
  let worstReturn = Infinity;

  if (returns.length <= periods) {
    const totalReturn = returns.reduce((sum, r) => sum + r.returnValue, 0);
    return {
      startDate: returns[0].date,
      endDate: returns[returns.length - 1].date,
      return: totalReturn,
    };
  }

  for (let i = 0; i <= returns.length - periods; i++) {
    const periodReturns = returns.slice(i, i + periods);
    const totalReturn = periodReturns.reduce(
      (sum, r) => sum + r.returnValue,
      0,
    );
    if (totalReturn < worstReturn) {
      worstReturn = totalReturn;
      worstPeriod = {
        startDate: periodReturns[0].date,
        endDate: periodReturns[periodReturns.length - 1].date,
        return: totalReturn,
      };
    }
  }
  return worstPeriod ?? 0;
}

function calculateAlpha(
  returns: { date: any; returnValue: number }[],
  benchmarkReturns: { date: any; returnValue: number }[],
  beta: number,
) {
  if (returns.length === 0 || benchmarkReturns.length === 0) return 0;
  const n = Math.min(returns.length, benchmarkReturns.length);
  const meanR = returns.reduce((sum, r) => sum + r.returnValue, 0) / n;
  const meanB = benchmarkReturns.reduce((sum, r) => sum + r.returnValue, 0) / n;
  return meanR - beta * meanB;
}

function calculateWinRate(returns: { date: any; returnValue: number }[]) {
  if (returns.length === 0) return 0;
  const wins = returns.filter((r) => r.returnValue > 0).length;
  return (wins / returns.length) * 100;
}
function calculateCumulativeOutperformance(
  historicalData: { date: string; value: number }[],
  benchmarkData: {
    _id: GenericId<"marketHistoricData">;
    _creationTime: number;
    date: string;
    ticker: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[],
) {
  if (historicalData.length === 0 || benchmarkData.length === 0) return 0;
  const startValue = historicalData[0].value;
  const endValue = historicalData[historicalData.length - 1].value;
  const benchmarkStartValue = benchmarkData[0].close;
  const benchmarkEndValue = benchmarkData[benchmarkData.length - 1].close;

  const portfolioReturn = (endValue - startValue) / startValue;
  const benchmarkReturn =
    (benchmarkEndValue - benchmarkStartValue) / benchmarkStartValue;

  return portfolioReturn - benchmarkReturn;
}

function calculateTrackingError(
  returns: { date: any; returnValue: number }[],
  benchmarkReturns: { date: any; returnValue: number }[],
) {
  if (returns.length === 0 || benchmarkReturns.length === 0) return 0;
  const n = Math.min(returns.length, benchmarkReturns.length);
  const diffs = [];
  for (let i = 0; i < n; i++) {
    diffs.push(returns[i].returnValue - benchmarkReturns[i].returnValue);
  }
  const meanDiff = diffs.reduce((sum, d) => sum + d, 0) / n;
  const variance = diffs.reduce((sum, d) => sum + (d - meanDiff) ** 2, 0) / n;
  return Math.sqrt(variance) * Math.sqrt(252); // Annualized tracking error
}

// Calculates the up-market capture ratio, which measures how well a portfolio performs in up markets compared to a benchmark.
function calculateUpMarketCapture(
  returns: { date: any; returnValue: number }[],
  benchmarkReturns: { date: any; returnValue: number }[],
) {
  if (returns.length === 0 || benchmarkReturns.length === 0) return 0;
  let upMarketReturns = 0;
  let portfolioUpReturns = 0;
  let count = 0;

  for (let i = 0; i < Math.min(returns.length, benchmarkReturns.length); i++) {
    if (benchmarkReturns[i].returnValue > 0) {
      upMarketReturns += benchmarkReturns[i].returnValue;
      portfolioUpReturns += returns[i].returnValue;
      count++;
    }
  }

  return upMarketReturns === 0
    ? 0
    : (portfolioUpReturns / upMarketReturns) * 100;
}

// Calculates the down-market capture ratio, which measures how well a portfolio performs in down markets compared to a benchmark.
// A lower down-market capture ratio indicates better performance during market downturns.
// For example, a down-market capture ratio of 80% means the portfolio loses only 80% of what the benchmark loses in down markets.
// but a negative ratio means the portfolio actually gained when the benchmark lost money.
function calculateDownMarketCapture(
  returns: { date: any; returnValue: number }[],
  benchmarkReturns: { date: any; returnValue: number }[],
) {
  if (returns.length === 0 || benchmarkReturns.length === 0) return 0;
  let downMarketReturns = 0;
  let portfolioDownReturns = 0;
  let count = 0;

  for (let i = 0; i < Math.min(returns.length, benchmarkReturns.length); i++) {
    if (benchmarkReturns[i].returnValue < 0) {
      downMarketReturns += benchmarkReturns[i].returnValue;
      portfolioDownReturns += returns[i].returnValue;
      count++;
    }
  }

  return downMarketReturns === 0
    ? 0
    : (portfolioDownReturns / downMarketReturns) * 100;
}

// Information Ratio: Measures the portfolio's excess return relative to a benchmark per unit of tracking error.
// A higher information ratio indicates better risk-adjusted performance relative to the benchmark.
// Typically, an information ratio above 0.5 is considered good, above 1.0 is excellent.
function calculateInformationRatio(
  returns: { date: any; returnValue: number }[],
  benchmarkReturns: { date: any; returnValue: number }[],
  arg2: number,
) {
  if (returns.length === 0 || benchmarkReturns.length === 0) return 0;
  const n = Math.min(returns.length, benchmarkReturns.length);
  const excessReturns = [];
  for (let i = 0; i < n; i++) {
    excessReturns.push(
      returns[i].returnValue - benchmarkReturns[i].returnValue,
    );
  }
  const meanExcessReturn = excessReturns.reduce((sum, r) => sum + r, 0) / n;
  return arg2 === 0 ? 0 : (meanExcessReturn * Math.sqrt(252)) / arg2; // Annualized Information Ratio
}

// Correlation to Benchmark: Measures the degree to which the portfolio's returns move in relation to the benchmark's returns.
// A correlation of +1 indicates perfect positive correlation, -1 indicates perfect negative correlation, and 0 indicates no correlation.
function calculateCorrelation(
  returns: { date: any; returnValue: number }[],
  benchmarkReturns: { date: any; returnValue: number }[],
) {
  if (returns.length === 0 || benchmarkReturns.length === 0) return 0;
  const n = Math.min(returns.length, benchmarkReturns.length);
  const meanR = returns.reduce((sum, r) => sum + r.returnValue, 0) / n;
  const meanB = benchmarkReturns.reduce((sum, r) => sum + r.returnValue, 0) / n;

  let covariance = 0;
  let varianceR = 0;
  let varianceB = 0;

  for (let i = 0; i < n; i++) {
    covariance +=
      (returns[i].returnValue - meanR) *
      (benchmarkReturns[i].returnValue - meanB);
    varianceR += (returns[i].returnValue - meanR) ** 2;
    varianceB += (benchmarkReturns[i].returnValue - meanB) ** 2;
  }

  covariance /= n;
  varianceR /= n;
  varianceB /= n;

  const stdDevR = Math.sqrt(varianceR);
  const stdDevB = Math.sqrt(varianceB);

  return stdDevR === 0 || stdDevB === 0 ? 0 : covariance / (stdDevR * stdDevB);
}

// Yearly Comparison: Compares the portfolio's annual returns to the benchmark's annual returns to see how they performed each year.
function calculateYearlyComparison(
  historicalData: { date: string; value: number }[],
  benchmarkData: {
    _id: GenericId<"marketHistoricData">;
    _creationTime: number;
    date: string;
    ticker: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[],
  dataSource: "daily" | "weekly" = "daily",
) {
  if (historicalData.length === 0 || benchmarkData.length === 0) return [];

  if (dataSource === "weekly") {
    // For weekly data, group by year (approximately 52 weeks per year)
    const portfolioByYear: Record<
      string,
      { startValue: number; endValue: number }
    > = {};
    const benchmarkByYear: Record<
      string,
      { startValue: number; endValue: number }
    > = {};

    for (const data of historicalData) {
      const date = new Date(data.date);
      const year = date.getFullYear().toString();

      if (!portfolioByYear[year]) {
        portfolioByYear[year] = {
          startValue: data.value,
          endValue: data.value,
        };
      } else {
        portfolioByYear[year].endValue = data.value;
      }
    }

    for (const data of benchmarkData) {
      const date = new Date(data.date);
      const year = date.getFullYear().toString();

      if (!benchmarkByYear[year]) {
        benchmarkByYear[year] = {
          startValue: data.close,
          endValue: data.close,
        };
      } else {
        benchmarkByYear[year].endValue = data.close;
      }
    }

    const years = Object.keys(portfolioByYear).filter((year) =>
      benchmarkByYear.hasOwnProperty(year),
    );

    return years.map((year) => {
      const pData = portfolioByYear[year];
      const bData = benchmarkByYear[year];
      const portfolioReturn =
        (pData.endValue - pData.startValue) / pData.startValue;
      const benchmarkReturn =
        (bData.endValue - bData.startValue) / bData.startValue;
      return {
        year,
        portfolioReturn,
        benchmarkReturn,
        outperformance: portfolioReturn - benchmarkReturn,
      };
    });
  } else {
    // Original daily logic
    const portfolioByYear: Record<
      string,
      { startValue: number; endValue: number }
    > = {};
    const benchmarkByYear: Record<
      string,
      { startValue: number; endValue: number }
    > = {};

    for (const data of historicalData) {
      const date = new Date(data.date);
      const year = date.getFullYear().toString();

      if (!portfolioByYear[year]) {
        portfolioByYear[year] = {
          startValue: data.value,
          endValue: data.value,
        };
      } else {
        portfolioByYear[year].endValue = data.value;
      }
    }

    for (const data of benchmarkData) {
      const date = new Date(data.date);
      const year = date.getFullYear().toString();

      if (!benchmarkByYear[year]) {
        benchmarkByYear[year] = {
          startValue: data.close,
          endValue: data.close,
        };
      } else {
        benchmarkByYear[year].endValue = data.close;
      }
    }

    const years = Object.keys(portfolioByYear).filter((year) =>
      benchmarkByYear.hasOwnProperty(year),
    );

    return years.map((year) => {
      const pData = portfolioByYear[year];
      const bData = benchmarkByYear[year];
      const portfolioReturn =
        (pData.endValue - pData.startValue) / pData.startValue;
      const benchmarkReturn =
        (bData.endValue - bData.startValue) / bData.startValue;
      return {
        year,
        portfolioReturn,
        benchmarkReturn,
        outperformance: portfolioReturn - benchmarkReturn,
      };
    });
  }
}

function calculateAllocationByType(
  assets: {
    _id: GenericId<"assets">;
    _creationTime: number;
    symbol?: string | undefined;
    currency?: string | undefined;
    currentPrice?: number | undefined;
    notes?: string | undefined;
    type:
      | "stock"
      | "bond"
      | "commodity"
      | "real estate"
      | "cash"
      | "crypto"
      | "other";
    name: string;
    portfolioId: GenericId<"portfolios">;
  }[],
) {
  const typeValues: Record<string, number> = {};
  let totalValue = 0;

  for (const asset of assets) {
    let quantity = 0;
    for (const txn of asset.transactions || []) {
      if (txn.type === "buy") {
        quantity += txn.quantity;
      } else if (txn.type === "sell") {
        quantity -= txn.quantity;
      }
    }
    const assetValue = (asset.currentPrice || 0) * quantity;

    typeValues[asset.type] = (typeValues[asset.type] || 0) + assetValue;
    totalValue += assetValue;
  }

  const allocation = Object.entries(typeValues).map(([type, value]) => ({
    type,
    percentage: totalValue ? (value / totalValue) * 100 : 0,
  }));
  return allocation;
}
function countAssetTypes(
  assets: {
    _id: GenericId<"assets">;
    _creationTime: number;
    symbol?: string | undefined;
    currency?: string | undefined;
    currentPrice?: number | undefined;
    notes?: string | undefined;
    type:
      | "stock"
      | "bond"
      | "commodity"
      | "real estate"
      | "cash"
      | "crypto"
      | "other";
    name: string;
    portfolioId: GenericId<"portfolios">;
  }[],
) {
  const typeCounts: Record<string, number> = {};
  for (const asset of assets) {
    typeCounts[asset.type] = (typeCounts[asset.type] || 0) + 1;
  }
  return typeCounts;
}

function calculateTimeWeightedReturn(
  historicalData: { date: string; value: number }[],
  transactions: Array<{
    assetId: string;
    type: "buy" | "sell" | "dividend";
    date: number; // timestamp
    quantity?: number;
    price?: number;
    fees?: number;
  }>,
): number {
  if (historicalData.length === 0) return 0;

  // Sort historical data by date
  const sortedHistoricalData = [...historicalData].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  // Convert to timestamp format for easier comparison
  const timestampedData = sortedHistoricalData.map((entry) => ({
    date: new Date(entry.date).getTime(),
    value: entry.value,
  }));

  // Sort transactions by date
  const sortedTransactions = [...transactions].sort((a, b) => a.date - b.date);

  // If no transactions or only one data point, return simple return
  if (sortedTransactions.length === 0 || timestampedData.length <= 1) {
    return calculateSimpleReturn(sortedHistoricalData);
  }

  // Group transactions by date
  const transactionsByDate = new Map<number, number>();

  for (const transaction of sortedTransactions) {
    // Round timestamp to nearest day for consistency
    const dayTimestamp = roundToDay(transaction.date);

    let cashFlowAmount = 0;

    if (transaction.type === "buy") {
      // Buy is negative cash flow (money leaving portfolio)
      cashFlowAmount = -(
        (transaction.quantity || 0) * (transaction.price || 0) +
        (transaction.fees || 0)
      );
    } else if (transaction.type === "sell") {
      // Sell is positive cash flow (money entering portfolio)
      cashFlowAmount =
        (transaction.quantity || 0) * (transaction.price || 0) -
        (transaction.fees || 0);
    } else if (transaction.type === "dividend") {
      // Dividend is positive cash flow
      cashFlowAmount = transaction.price || 0;
    }

    const existingAmount = transactionsByDate.get(dayTimestamp) || 0;
    transactionsByDate.set(dayTimestamp, existingAmount + cashFlowAmount);
  }

  // Calculate TWR
  let cumulativeReturn = 1;
  let previousValue = timestampedData[0].value;
  let previousDate = timestampedData[0].date;

  // Check if first day has transactions
  const firstDayTransactions =
    transactionsByDate.get(roundToDay(previousDate)) || 0;
  if (firstDayTransactions !== 0) {
    // If first day has transactions, we need to adjust the starting value
    previousValue = Math.max(0.01, previousValue - firstDayTransactions); // Ensure not zero
  }

  // Process each historical data point
  for (let i = 1; i < timestampedData.length; i++) {
    const currentEntry = timestampedData[i];
    const currentDate = roundToDay(currentEntry.date);
    const prevDate = roundToDay(previousDate);

    // Skip if same day (after rounding)
    if (currentDate === prevDate) continue;

    // Check if there were transactions between previous and current dates
    let transactionsInBetween = false;
    let adjustedPrevValue = previousValue;

    // Process all transaction dates between previous and current
    for (const [txDate, cashFlow] of transactionsByDate.entries()) {
      if (txDate > prevDate && txDate <= currentDate) {
        transactionsInBetween = true;

        // Find portfolio value just before this transaction
        const valueBefore = interpolateValue(
          timestampedData,
          txDate,
          previousDate,
        );

        // Calculate period return up to this transaction
        if (adjustedPrevValue > 0) {
          // Prevent division by zero
          const periodReturn = valueBefore / adjustedPrevValue;
          cumulativeReturn *= periodReturn;
        }

        // Update for next sub-period
        adjustedPrevValue = Math.max(0.01, valueBefore + cashFlow); // Ensure not zero
      }
    }

    // If no transactions between dates, calculate period return directly
    if (!transactionsInBetween && adjustedPrevValue > 0) {
      const periodReturn = currentEntry.value / adjustedPrevValue;
      cumulativeReturn *= periodReturn;
    }

    // Update for next iteration
    previousValue = currentEntry.value;
    previousDate = currentEntry.date;
  }

  // Return the final TWR as percentage
  return cumulativeReturn - 1;
}

// Helper function to round timestamp to nearest day (midnight)
function roundToDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

// Helper function to interpolate portfolio value at a specific date
function interpolateValue(
  data: { date: number; value: number }[],
  targetDate: number,
  fallbackDate: number,
): number {
  // Find closest data points before and after target date
  let beforeEntry = null;
  let afterEntry = null;

  for (const entry of data) {
    if (entry.date <= targetDate) {
      if (!beforeEntry || entry.date > beforeEntry.date) {
        beforeEntry = entry;
      }
    }

    if (entry.date >= targetDate) {
      if (!afterEntry || entry.date < afterEntry.date) {
        afterEntry = entry;
      }
    }
  }

  // If we have both before and after, interpolate
  if (beforeEntry && afterEntry && beforeEntry.date !== afterEntry.date) {
    const ratio =
      (targetDate - beforeEntry.date) / (afterEntry.date - beforeEntry.date);
    return beforeEntry.value + ratio * (afterEntry.value - beforeEntry.value);
  }

  // If we only have before, use that
  if (beforeEntry) {
    return beforeEntry.value;
  }

  // If we only have after, use that
  if (afterEntry) {
    return afterEntry.value;
  }

  // If we have neither, use fallback value from a previous period
  // This is a fallback that should rarely happen with sufficient data
  const fallbackEntry = data.find((entry) => entry.date <= fallbackDate);
  return fallbackEntry ? fallbackEntry.value : data[0].value;
}

// Simple return calculation for comparison
function calculateSimpleReturn(
  historicalData: { date: string; value: number }[],
): number {
  if (historicalData.length < 2) return 0;

  const startValue = historicalData[0].value;
  const endValue = historicalData[historicalData.length - 1].value;

  // Avoid division by zero
  return startValue > 0 ? (endValue - startValue) / startValue : 0;
}
