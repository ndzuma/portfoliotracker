import { api, internal } from "./_generated/api";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { convert, resolveAssetCurrency, type FxRates } from "./fx";

export const marketDataUrl =
  process.env.MARKET_DATA_SERVICE_URL ||
  process.env.MARKET_DATA_URL ||
  "https://market-data-api.up.railway.app";

export const updateHistoricalData = action({
  handler: async (ctx) => {
    const data = await ctx.runQuery(
      internal.marketData.getAssetsForHistoricalUpdate,
    );

    // Process each symbol individually to use correct start_date
    for (const item of data) {
      if (!item.symbol) continue;
      const symbol = item.symbol;
      const startDate = item.lastDate
        ? (() => {
            const nextDay = new Date(item.lastDate);
            nextDay.setDate(nextDay.getDate() + 1);
            return nextDay.toISOString().split("T")[0];
          })()
        : "2015-01-01";

      const url = `${marketDataUrl}/historical/${symbol.replace(/\//g, "_")}?start_date=${startDate}`;

      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Failed to fetch historical data for ${symbol}`);
        continue;
      }
      const historicalData = await response.json();

      for (const record of historicalData) {
        await ctx.runMutation(internal.marketData.addHistoricalData, {
          ticker: symbol,
          date: record.datetime,
          open: Number(record.open),
          high: Number(record.high),
          low: Number(record.low),
          close: Number(record.close),
          volume: Number(record.volume),
        });
      }
    }

    // Trigger snapshot updates for all portfolios that had historical data updated
    if (data.length > 0) {
      // Get all portfolios that have assets with the updated symbols
      const allAssets = await ctx.runQuery(
        internal.marketData.getAllAssetsForSnapshots,
      );
      const updatedPortfolios = new Set<string | Id<"portfolios">>();

      for (const asset of allAssets) {
        if (asset.symbol && data.some((item) => item.symbol === asset.symbol)) {
          updatedPortfolios.add(asset.portfolioId);
        }
      }

      // Trigger snapshot updates for each affected portfolio
      for (const portfolioId of updatedPortfolios) {
        await ctx.scheduler.runAfter(
          0,
          internal.marketData.triggerSnapshotUpdate,
          {
            portfolioId: portfolioId as Id<"portfolios">,
            reason: "historical_data_updated",
            startDate: Date.now(), // Start from today for historical data updates
          },
        );
      }
    }
  },
});

export const createHistoricalData = action({
  args: {
    ticker: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.runQuery(
      internal.marketData.doesHistoricalDataExist,
      {
        ticker: args.ticker,
      },
    );
    if (existing) {
      console.log(`Historical data for ${args.ticker} already exists`);
      return;
    }

    const response = await fetch(
      `${marketDataUrl}/historical/${args.ticker.replace(/\//g, "_")}`,
    );
    if (!response.ok) {
      console.error(
        `Failed to fetch historical data for ${args.ticker.replace(/\//g, "_")}`,
      );
      return;
    }
    const historicalData = await response.json();

    for (const record of historicalData) {
      await ctx.runMutation(internal.marketData.addHistoricalData, {
        ticker: args.ticker,
        date: record.datetime,
        open: Number(record.open),
        high: Number(record.high),
        low: Number(record.low),
        close: Number(record.close),
        volume: Number(record.volume),
      });
    }
  },
});

export const doesHistoricalDataExist = internalQuery({
  args: {
    ticker: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("marketHistoricData")
      .withIndex("byTicker", (q) => q.eq("ticker", args.ticker))
      .first();
    if (existing) {
      return true;
    }
    return false;
  },
});

// get assets without historical data
export const getAssetsWithoutHistoricalData = internalQuery({
  handler: async (ctx) => {
    const assets = await ctx.db.query("assets").collect();

    // extract each unique symbol
    const symbols = Array.from(
      new Set(
        assets
          .map((asset) => asset.symbol)
          .filter((s): s is string => s != null),
      ),
    );

    // get historical data for each symbol
    const historicalData = await ctx.db.query("marketHistoricData").collect();

    const assetsWithoutData = [];
    for (const symbol of symbols) {
      if (!historicalData.find((data) => data.ticker === symbol)) {
        assetsWithoutData.push(symbol);
      }
    }

    return assetsWithoutData;
  },
});

// get assets with their latest historical data date for updating
export const getAssetsForHistoricalUpdate = internalQuery({
  handler: async (ctx) => {
    const assets = await ctx.db.query("assets").collect();

    // extract each unique symbol
    const symbols = Array.from(
      new Set(assets.map((asset) => asset.symbol).filter(Boolean)),
    );

    const result = [];
    for (const symbol of symbols) {
      const latestData = await ctx.db
        .query("marketHistoricData")
        .withIndex("byTicker", (q) => q.eq("ticker", symbol))
        .order("desc")
        .first();

      result.push({
        symbol,
        lastDate: latestData ? latestData.date : null,
      });
    }

    return result;
  },
});

// add historical data for a given asset
export const addHistoricalData = internalMutation({
  args: {
    ticker: v.string(),
    date: v.string(),
    open: v.number(),
    high: v.number(),
    low: v.number(),
    close: v.number(),
    volume: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("marketHistoricData")
      .withIndex("byTicker", (q) =>
        q.eq("ticker", args.ticker).eq("date", args.date),
      )
      .first();

    if (existing) {
      // already exists, do nothing
      return;
    }

    await ctx.db.insert("marketHistoricData", {
      ticker: args.ticker,
      date: args.date,
      open: args.open,
      high: args.high,
      low: args.low,
      close: args.close,
      volume: args.volume,
    });
  },
});

// get HistoricalData for the charts
// Values are converted to the user's base currency using current FX rates.
export const getHistoricalData = query({
  args: {
    portfolioId: v.union(v.id("portfolios"), v.string()),
    isForChart: v.optional(v.boolean()),
    endDate: v.optional(v.string()), // YYYY-MM-DD format
    startDate: v.optional(v.string()), // YYYY-MM-DD format
  },
  handler: async (ctx, args) => {
    // ── FX context ──────────────────────────────────────────────────────
    const portfolio = await ctx.db.get(args.portfolioId as Id<"portfolios">);
    if (!portfolio) return [];

    const fxDoc = await ctx.db.query("fxRates").first();
    const rates: FxRates = fxDoc?.rates ?? {};

    let baseCurrency = "USD";
    const portfolioUserId = portfolio.userId;
    if (portfolioUserId) {
      const prefs = await ctx.db
        .query("userPreferences")
        .withIndex("byUser", (q: any) => q.eq("userId", portfolioUserId))
        .first();
      if (prefs?.currency) baseCurrency = prefs.currency;
    }

    // Determine data granularity and date range
    const today = new Date();
    const endDate = args.endDate ? new Date(args.endDate) : today;
    const defaultStartDate = new Date();
    defaultStartDate.setFullYear(defaultStartDate.getFullYear() - 1); // Default to 1 year ago
    const startDate = args.startDate
      ? new Date(args.startDate)
      : defaultStartDate;

    const daysDifference = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const isLongTerm = daysDifference > 365;
    const isShortTerm = daysDifference <= 90; // 3 months or less

    // Determine data granularity
    let dataGranularity: "daily" | "weekly" | "monthly" = "daily";
    if (isLongTerm) {
      dataGranularity = "monthly";
    } else if (!isShortTerm) {
      dataGranularity = "weekly";
    }

    // Use snapshots for charts when view is 3+ months, or for analytics
    const useSnapshots =
      (args.isForChart && daysDifference > 90) || !args.isForChart;

    // get portfolio assets and transactions and format the data into {symbol, date, quantity, price, type}
    const assets = await ctx.db
      .query("assets")
      .withIndex("byPortfolio", (q) => q.eq("portfolioId", args.portfolioId))
      .collect();
    if (assets.length === 0) {
      return [];
    }

    // Build symbol → currency map for FX conversion during value calculation
    const symbolCurrencyMap: Record<string, string> = {};
    const assetIdCurrencyMap: Record<string, string> = {};
    for (const asset of assets) {
      const ccy = resolveAssetCurrency(asset.currency);
      if (asset.symbol) symbolCurrencyMap[asset.symbol] = ccy;
      assetIdCurrencyMap[asset._id] = ccy;
    }

    const allTransactions: any[] = [];
    for (const asset of assets) {
      const transactions = await ctx.db
        .query("transactions")
        .withIndex("byAsset", (q) => q.eq("assetId", asset._id))
        .collect();
      for (const transaction of transactions) {
        allTransactions.push({
          transactionId: transaction._id,
          name: asset.name,
          symbol: asset.symbol,
          assetId: asset._id,
          date: transaction.date,
          quantity: transaction.quantity,
          price: transaction.price,
          type: transaction.type,
        });
      }
    }
    // sort by date ascending
    allTransactions.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    if (allTransactions.length === 0) {
      return [];
    }
    // make a kv pair of symbol and earliest date
    const symbolEarliestDate: Record<string, string> = {};
    for (const transaction of allTransactions) {
      if (!transaction.symbol) continue;
      if (!symbolEarliestDate[transaction.symbol]) {
        symbolEarliestDate[transaction.symbol] = transaction.date;
      } else {
        const existingDate = new Date(symbolEarliestDate[transaction.symbol]);
        const transactionDate = new Date(transaction.date);
        if (transactionDate < existingDate) {
          symbolEarliestDate[transaction.symbol] = transaction.date;
        }
      }
    }
    // Check if we should use snapshots for efficiency
    if (useSnapshots) {
      const snapshots = await ctx.db
        .query("portfolioSnapshots")
        .withIndex("byPortfolio", (q) =>
          q
            .eq("portfolioId", args.portfolioId)
            .gte("date", startDate.getTime())
            .lte("date", endDate.getTime()),
        )
        .collect();

      if (snapshots.length > 0) {
        // Use snapshots for historical data, but calculate today's value separately
        // Note: snapshots were stored in mixed native currencies pre-FX.
        // We apply a blanket conversion from USD→baseCurrency as an approximation
        // until snapshots are recalculated with per-asset FX conversion.
        const snapshotRate =
          baseCurrency !== "USD"
            ? (() => {
                const fromRate = rates["USD"];
                const toRate = baseCurrency === "EUR" ? 1 : rates[baseCurrency];
                return fromRate && toRate ? toRate / fromRate : 1;
              })()
            : 1;

        const result = snapshots.map((snapshot) => ({
          date: new Date(snapshot.date).toISOString().split("T")[0],
          value: snapshot.totalValue * snapshotRate,
        }));

        // Add today's value if not already included (always calculate live)
        const todayStr = today.toISOString().split("T")[0];
        const hasTodayValue = result.some((item) => item.date === todayStr);

        if (!hasTodayValue) {
          const todayValue = await ctx.runQuery(
            internal.marketData.calculatePortfolioValueAtDate,
            {
              portfolioId: args.portfolioId as Id<"portfolios">,
              date: today.getTime(),
              baseCurrency,
            },
          );
          result.push({
            date: todayStr,
            value: todayValue,
          });
        }

        // Sort results by date
        result.sort((a, b) => a.date.localeCompare(b.date));

        return result.sort((a, b) => a.date.localeCompare(b.date));
      }
    }

    // get historicalData for each symbol from the earliest date to today
    // mind you the historical data date is in YYYY-MM-DD format but the transaction date is in ISO format
    const historicalData: Record<string, any[]> = {};
    let formattedStartDate: string;
    for (const symbol in symbolEarliestDate) {
      const assetStartDate = new Date(symbolEarliestDate[symbol]);
      formattedStartDate = assetStartDate.toISOString().split("T")[0];
      const data = await ctx.db
        .query("marketHistoricData")
        .withIndex("byTicker", (q) =>
          q.eq("ticker", symbol).gte("date", formattedStartDate),
        )
        .collect();
      historicalData[symbol] = data;
    }

    // calculate the values for each date and return the data
    // in the format {date, value}
    const result: { date: string; value: number }[] = [];
    const portfolioStartDate = new Date(
      Math.min(
        ...Object.values(symbolEarliestDate).map((date) =>
          new Date(date).getTime(),
        ),
      ),
    );

    // Adjust start date based on requested range
    const effectiveStartDate =
      startDate > portfolioStartDate ? startDate : portfolioStartDate;

    // Calculate date increment based on granularity
    const getNextDate = (currentDate: Date): Date => {
      const next = new Date(currentDate);
      switch (dataGranularity) {
        case "monthly":
          next.setMonth(next.getMonth() + 1);
          break;
        case "weekly":
          next.setDate(next.getDate() + 7);
          break;
        case "daily":
        default:
          next.setDate(next.getDate() + 1);
          break;
      }
      return next;
    };

    for (
      let date = new Date(effectiveStartDate);
      date <= endDate;
      date = getNextDate(date)
    ) {
      const formattedDate = date.toISOString().split("T")[0];
      let dailyValue = 0;
      let calculatedAssets: any[] = [];
      for (const transaction of allTransactions) {
        if (calculatedAssets.includes(transaction.transactionId)) {
          continue;
        }
        if (!transaction.symbol) {
          //if the asset has no symbol, calculate it if the transaction date is on or before the current date
          if (new Date(transaction.date) <= date) {
            const assetValueNative =
              transaction.quantity *
              transaction.price *
              (transaction.type === "buy" ? 1 : -1);
            const assetCcy = assetIdCurrencyMap[transaction.assetId] || "USD";
            dailyValue += convert(
              assetValueNative,
              assetCcy,
              baseCurrency,
              rates,
            );
            calculatedAssets.push(transaction.transactionId);
          }
          continue;
        }
        const symbol = transaction.symbol;
        const txnDate = new Date(transaction.date);
        if (txnDate > date) continue; // skip transactions that are after the current date
        const historicalPrices = historicalData[symbol] || [];
        // find the closest historical price on or before the current date
        let priceRecord = null;
        for (let i = historicalPrices.length - 1; i >= 0; i--) {
          const recordDate = new Date(historicalPrices[i].date);
          if (recordDate <= date) {
            priceRecord = historicalPrices[i];
            break;
          }
        }
        if (!priceRecord) continue; // no price data available for this date

        // Check if we're processing today's date to use current market data
        const isToday =
          date.toISOString().split("T")[0] ===
          today.toISOString().split("T")[0];
        if (isToday) {
          // Look up current price from marketCurrentData table
          const currentMarketData = await ctx.db
            .query("marketCurrentData")
            .withIndex("byTicker", (q) => q.eq("ticker", symbol))
            .first();

          // If we have current market data, use it instead of historical data
          if (currentMarketData && currentMarketData.price) {
            // Replace the historical close price with current market price
            priceRecord = {
              ...priceRecord, // Keep other fields if they exist
              close: currentMarketData.price,
            };
          }
        }

        // calculate quantity held up to this date
        let quantityHeld = 0;
        for (const txn of allTransactions) {
          if (txn.symbol !== symbol) continue;
          const txnDate = new Date(txn.date);
          if (txnDate > date) continue; // skip transactions that are after the current date
          quantityHeld += txn.type === "buy" ? txn.quantity : -txn.quantity;
          calculatedAssets.push(txn.transactionId);
        }
        const assetCcy = symbolCurrencyMap[symbol] || "USD";
        dailyValue += convert(
          quantityHeld * priceRecord.close,
          assetCcy,
          baseCurrency,
          rates,
        );
      }

      result.push({
        date: formattedDate,
        value: dailyValue,
      });
    }
    return result;
  },
});

// Internal queries for snapshot calculations
export const getAllAssetsForSnapshots = internalQuery({
  handler: async (ctx) => {
    return await ctx.db.query("assets").collect();
  },
});

export const getAssetsByPortfolio = internalQuery({
  args: { portfolioId: v.union(v.id("portfolios"), v.string()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("assets")
      .withIndex("byPortfolio", (q) => q.eq("portfolioId", args.portfolioId))
      .collect();
  },
});

export const getTransactionsByAsset = internalQuery({
  args: { assetId: v.id("assets") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("transactions")
      .withIndex("byAsset", (q) => q.eq("assetId", args.assetId))
      .collect();
  },
});

export const getLatestPortfolioSnapshot = internalQuery({
  args: { portfolioId: v.union(v.id("portfolios"), v.string()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("portfolioSnapshots")
      .withIndex("byPortfolio", (q) => q.eq("portfolioId", args.portfolioId))
      .order("desc")
      .first();
  },
});

export const getPortfolioSnapshotCount = internalQuery({
  args: {
    portfolioId: v.union(v.id("portfolios"), v.string()),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const snapshots = await ctx.db
      .query("portfolioSnapshots")
      .withIndex("byPortfolio", (q) =>
        q
          .eq("portfolioId", args.portfolioId)
          .gte("date", args.startDate)
          .lte("date", args.endDate),
      )
      .collect();

    return snapshots.length;
  },
});

export const getPortfolioSnapshotsForAnalytics = internalQuery({
  args: {
    portfolioId: v.union(v.id("portfolios"), v.string()),
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const snapshots = await ctx.db
      .query("portfolioSnapshots")
      .withIndex("byPortfolio", (q) =>
        q
          .eq("portfolioId", args.portfolioId)
          .gte("date", args.startDate)
          .lte("date", args.endDate),
      )
      .collect();

    // Convert to the same format as historical data for compatibility
    return snapshots.map((snapshot) => ({
      date: new Date(snapshot.date).toISOString().split("T")[0],
      value: snapshot.totalValue,
    }));
  },
});

export const calculatePortfolioValueAtDate = internalQuery({
  args: {
    portfolioId: v.union(v.id("portfolios"), v.string()),
    date: v.number(),
    baseCurrency: v.optional(v.string()), // if omitted, looks up user preference
  },
  handler: async (ctx, args) => {
    const assets = await ctx.db
      .query("assets")
      .withIndex("byPortfolio", (q) => q.eq("portfolioId", args.portfolioId))
      .collect();

    // ── FX context ──────────────────────────────────────────────────────
    const fxDoc = await ctx.db.query("fxRates").first();
    const fxRates: FxRates = fxDoc?.rates ?? {};

    let baseCurrency = args.baseCurrency || "USD";
    if (!args.baseCurrency) {
      const portfolio = await ctx.db.get(args.portfolioId as Id<"portfolios">);
      if (portfolio) {
        const portfolioUserId = portfolio.userId;
        if (portfolioUserId) {
          const prefs = await ctx.db
            .query("userPreferences")
            .withIndex("byUser", (q: any) => q.eq("userId", portfolioUserId))
            .first();
          if (prefs?.currency) baseCurrency = prefs.currency;
        }
      }
    }

    let totalValue = 0;
    const targetDate = new Date(args.date);

    for (const asset of assets) {
      const assetCcy = resolveAssetCurrency(asset.currency);

      if (!asset.symbol) {
        // Handle assets without symbols (cash, etc.)
        const transactions = await ctx.db
          .query("transactions")
          .withIndex("byAsset", (q) => q.eq("assetId", asset._id))
          .collect();

        let quantityHeld = 0;
        for (const transaction of transactions) {
          const txnDate = new Date(transaction.date);
          if (txnDate <= targetDate) {
            quantityHeld +=
              transaction.type === "buy"
                ? transaction.quantity
                : -transaction.quantity;
          }
        }

        if (asset.currentPrice) {
          totalValue += convert(
            quantityHeld * asset.currentPrice,
            assetCcy,
            baseCurrency,
            fxRates,
          );
        }
      } else {
        // Handle assets with symbols
        const transactions = await ctx.db
          .query("transactions")
          .withIndex("byAsset", (q) => q.eq("assetId", asset._id))
          .collect();

        let quantityHeld = 0;
        for (const transaction of transactions) {
          const txnDate = new Date(transaction.date);
          if (txnDate <= targetDate) {
            quantityHeld +=
              transaction.type === "buy"
                ? transaction.quantity
                : -transaction.quantity;
          }
        }

        // Get price for the specific date
        const priceData = await ctx.db
          .query("marketHistoricData")
          .withIndex("byTicker", (q) =>
            q
              .eq("ticker", asset.symbol)
              .lte("date", targetDate.toISOString().split("T")[0]),
          )
          .order("desc")
          .first();

        if (priceData && priceData.close != null) {
          totalValue += convert(
            quantityHeld * priceData.close,
            assetCcy,
            baseCurrency,
            fxRates,
          );
        } else if (asset.currentPrice) {
          // Fallback to current price if no historical data
          totalValue += convert(
            quantityHeld * asset.currentPrice,
            assetCcy,
            baseCurrency,
            fxRates,
          );
        }
      }
    }

    return totalValue;
  },
});

// Internal mutations for snapshot management
export const deletePortfolioSnapshots = internalMutation({
  args: { portfolioId: v.union(v.id("portfolios"), v.string()) },
  handler: async (ctx, args) => {
    const existingSnapshots = await ctx.db
      .query("portfolioSnapshots")
      .withIndex("byPortfolio", (q) => q.eq("portfolioId", args.portfolioId))
      .collect();

    for (const snapshot of existingSnapshots) {
      await ctx.db.delete(snapshot._id);
    }
  },
});

export const createPortfolioSnapshot = internalMutation({
  args: {
    snapshot: v.object({
      portfolioId: v.union(v.id("portfolios"), v.string()),
      date: v.number(),
      totalValue: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("portfolioSnapshots", args.snapshot);
  },
});

// Function to calculate and store weekly portfolio snapshots
export const calculatePortfolioSnapshots = internalAction({
  args: {
    portfolioId: v.id("portfolios"),
    forceRecalculate: v.optional(v.boolean()), // Override all snapshots if true
    startFromDate: v.optional(v.number()), // Start recalculation from this date
  },
  handler: async (ctx, args) => {
    // Get portfolio assets and earliest transaction date
    const assets = await ctx.runQuery(
      internal.marketData.getAssetsByPortfolio,
      {
        portfolioId: args.portfolioId,
      },
    );

    if (assets.length === 0) return;

    // Find earliest transaction date
    let earliestDate = new Date();
    for (const asset of assets) {
      const transactions = await ctx.runQuery(
        internal.marketData.getTransactionsByAsset,
        {
          assetId: asset._id,
        },
      );

      for (const transaction of transactions) {
        const txnDate = new Date(transaction.date);
        if (txnDate < earliestDate) {
          earliestDate = txnDate;
        }
      }
    }

    // If force recalculate, delete existing snapshots
    if (args.forceRecalculate) {
      await ctx.runMutation(internal.marketData.deletePortfolioSnapshots, {
        portfolioId: args.portfolioId as Id<"portfolios">,
      });
    }

    // Check latest snapshot date
    const latestSnapshot = await ctx.runQuery(
      internal.marketData.getLatestPortfolioSnapshot,
      {
        portfolioId: args.portfolioId as Id<"portfolios">,
      },
    );

    // Determine start date for recalculation
    let startDate: Date;
    if (args.startFromDate) {
      // Start from specified date (for modifications/additions)
      startDate = new Date(args.startFromDate);
    } else if (latestSnapshot && !args.forceRecalculate) {
      // Continue from latest snapshot
      startDate = new Date(latestSnapshot.date + 24 * 60 * 60 * 1000);
    } else {
      // Start from earliest transaction
      startDate = earliestDate;
    }

    const today = new Date();
    const snapshotsToCreate: any[] = [];

    // Generate weekly snapshots from start date to today
    for (
      let date = new Date(startDate);
      date <= today;
      date.setDate(date.getDate() + 7)
    ) {
      const value = await ctx.runQuery(
        internal.marketData.calculatePortfolioValueAtDate,
        {
          portfolioId: args.portfolioId as Id<"portfolios">,
          date: date.getTime(),
        },
      );
      snapshotsToCreate.push({
        portfolioId: args.portfolioId as Id<"portfolios">,
        date: date.getTime(),
        totalValue: value,
      });
    }

    // Store snapshots in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < snapshotsToCreate.length; i += batchSize) {
      const batch = snapshotsToCreate.slice(i, i + batchSize);
      await Promise.all(
        batch.map((snapshot) =>
          ctx.runMutation(internal.marketData.createPortfolioSnapshot, {
            snapshot,
          }),
        ),
      );
    }
  },
});

// Function to trigger snapshot updates when assets or transactions change
export const triggerSnapshotUpdate = internalAction({
  args: {
    portfolioId: v.id("portfolios"),
    reason: v.union(
      v.literal("asset_added"),
      v.literal("transaction_added"),
      v.literal("historical_data_updated"),
      v.literal("periodic_update"),
      v.literal("asset_modified"),
      v.literal("transaction_modified"),
    ),
    startDate: v.optional(v.number()), // For date-based recalculation
  },
  handler: async (ctx, args) => {
    // Determine recalculation strategy based on reason
    let forceRecalculate = false;
    let startFromDate: Date | null = null;

    switch (args.reason) {
      case "historical_data_updated":
        forceRecalculate = true;
        break;
      case "asset_modified":
      case "transaction_modified":
        // For modifications, recalculate from the event date
        if (args.startDate) {
          startFromDate = new Date(args.startDate);
        }
        break;
      case "asset_added":
      case "transaction_added":
        // For additions, only update from the addition date
        if (args.startDate) {
          startFromDate = new Date(args.startDate);
        }
        break;
      case "periodic_update":
        // For periodic updates, only update recent snapshots
        startFromDate = new Date();
        startFromDate.setDate(startFromDate.getDate() - 7); // Last week
        break;
    }

    await ctx.scheduler.runAfter(
      0,
      internal.marketData.calculatePortfolioSnapshots,
      {
        portfolioId: args.portfolioId,
        forceRecalculate,
        startFromDate: startFromDate?.getTime(),
      },
    );
  },
});

// Periodic snapshot update for all portfolios (for cron jobs)
export const updateAllPortfolioSnapshots = action({
  handler: async (ctx) => {
    // Get all portfolios
    const portfolios = await ctx.runQuery(internal.marketData.getAllPortfolios);

    if (portfolios.length === 0) {
      console.log("No portfolios found for snapshot update");
      return;
    }

    console.log(
      `Starting periodic snapshot update for ${portfolios.length} portfolios`,
    );

    // Update snapshots for each portfolio
    for (const portfolio of portfolios) {
      try {
        await ctx.scheduler.runAfter(
          0,
          internal.marketData.triggerSnapshotUpdate,
          {
            portfolioId: portfolio._id,
            reason: "periodic_update",
          },
        );
      } catch (error) {
        console.error(
          `Failed to update snapshots for portfolio ${portfolio._id}:`,
          error,
        );
      }
    }

    console.log(
      `Periodic snapshot update scheduled for ${portfolios.length} portfolios`,
    );
  },
});

export const getAllPortfolios = internalQuery({
  handler: async (ctx) => {
    const portfolios = await ctx.db.query("portfolios").collect();
    return portfolios;
  },
});

export const updateCurrentPrices = action({
  handler: async (ctx) => {
    const symbols = await ctx.runQuery(internal.marketData.getAllAssetSymbols);

    if (symbols.length === 0) {
      console.log("No assets with symbols found");
      return;
    }

    const chunkSize = 5;
    for (let i = 0; i < symbols.length; i += chunkSize) {
      const chunk = symbols.slice(i, i + chunkSize);
      const chunkJoin = chunk
        .filter((symbol): symbol is string => symbol !== undefined)
        .join(",")
        .replace(/\//g, "_");
      const response = await fetch(`${marketDataUrl}/price/${chunkJoin}`);
      if (!response.ok) {
        console.error(
          `Failed to fetch market data for chunk: ${chunk.join(",")}`,
        );
        continue;
      }
      const marketData = await response.json();

      if (chunk.length === 1) {
        const existing = await ctx.runQuery(
          internal.marketData.doesAssetExistMarketData,
          { ticker: chunk[0].replace(/_/g, "/") },
        );
        if (existing) {
          await ctx.runMutation(internal.marketData.updateAssetCurrentPrice, {
            ticker: chunk[0].replace(/_/g, "/"),
            price: Number(marketData.price),
          });
        } else {
          const asset = await ctx.runQuery(api.assets.getAssetBySymbol, {
            symbol: chunk[0].replace(/_/g, "/"),
          });
          if (!asset) {
            console.error(
              `Asset with symbol ${chunk[0].replace(/_/g, "/")} not found in assets table`,
            );
            continue;
          }
          await ctx.runMutation(
            internal.marketData.createAssetMarketCurrentData,
            {
              ticker: chunk[0].replace(/_/g, "/"),
              name: asset.name,
              type: asset.type,
              price: Number(marketData.price),
            },
          );
        }
      } else {
        for (const symbol in marketData) {
          const existing = await ctx.runQuery(
            internal.marketData.doesAssetExistMarketData,
            { ticker: symbol },
          );
          if (existing) {
            await ctx.runMutation(internal.marketData.updateAssetCurrentPrice, {
              ticker: symbol,
              price: Number(marketData[symbol].price),
            });
          } else {
            const asset = await ctx.runQuery(api.assets.getAssetBySymbol, {
              symbol: symbol,
            });
            if (!asset) {
              console.error(
                `Asset with symbol ${symbol} not found in assets table`,
              );
              continue;
            }
            await ctx.runMutation(
              internal.marketData.createAssetMarketCurrentData,
              {
                ticker: symbol,
                name: asset.name,
                type: asset.type,
                price: Number(marketData[symbol].price),
              },
            );
          }
        }
      }
    }
  },
});

export const doesAssetExistMarketData = internalQuery({
  args: {
    ticker: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("marketCurrentData")
      .withIndex("byTicker", (q) => q.eq("ticker", args.ticker))
      .first();
    if (existing) {
      return true;
    }
    return false;
  },
});

export const createAssetMarketCurrentData = internalMutation({
  args: {
    ticker: v.string(),
    logo: v.optional(v.string()),
    name: v.optional(v.string()),
    type: v.union(
      v.literal("stock"),
      v.literal("bond"),
      v.literal("commodity"),
      v.literal("real estate"),
      v.literal("cash"),
      v.literal("crypto"),
      v.literal("other"),
    ),
    price: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("marketCurrentData")
      .withIndex("byTicker", (q) => q.eq("ticker", args.ticker))
      .first();

    if (existing) {
      return;
    }
    if (!args.name) {
      await ctx.db.insert("marketCurrentData", {
        ticker: args.ticker,
        type: args.type,
        price: args.price || 0,
        updatedAt: Date.now(),
      });
      return;
    } else {
      await ctx.db.insert("marketCurrentData", {
        ticker: args.ticker,
        name: args.name,
        type: args.type,
        price: args.price || 0,
        updatedAt: Date.now(),
      });
      return;
    }
  },
});

// you need to fix this, get all the assets without a logo, and then fetch the logo from the market data api,
// and then update the asset with the logo
export const updateAssetLogos = internalAction({
  args: {
    ticker: v.string(),
  },
  handler: async (_ctx, args) => {
    const response = await fetch(`${marketDataUrl}/logo/${args.ticker}`);
    if (response.ok) {
      const data = await response.json();
    }
  },
});

export const updateAssetCurrentPrice = internalMutation({
  args: {
    ticker: v.string(),
    price: v.number(),
  },
  handler: async (ctx, args) => {
    const asset = await ctx.db
      .query("marketCurrentData")
      .withIndex("byTicker", (q) => q.eq("ticker", args.ticker))
      .first();

    if (asset) {
      await ctx.db.patch(asset._id, {
        price: args.price,
        updatedAt: Date.now(),
      });
    }
    return;
  },
});

export const getAllAssetSymbols = internalQuery({
  handler: async (ctx) => {
    const assets = await ctx.db.query("assets").collect();

    // extract each unique symbol only if the type is stock, or crypto
    const symbols = Array.from(
      new Set(
        assets
          .filter(
            (asset) =>
              asset.symbol &&
              (asset.type === "stock" || asset.type === "crypto"),
          )
          .map((asset) => asset.symbol),
      ),
    );

    const arrayOfSymbols = [];
    for (const symbol of symbols) {
      if (symbol) {
        arrayOfSymbols.push(symbol);
      }
    }

    return arrayOfSymbols;
  },
});

// update benchmark data
export const updateBenchmarkData = action({
  handler: async (ctx) => {
    const data = await fetch(`${marketDataUrl}/benchmark`);
    if (!data.ok) {
      console.error("Failed to fetch benchmark data");
      return;
    }
    const benchmarks = await data.json();

    for (const [symbol, benchmarkData] of Object.entries(benchmarks) as [
      string,
      any,
    ][]) {
      const exists = await ctx.runQuery(
        internal.marketData.doesBenchmarkExist,
        { ticker: symbol },
      );
      if (exists) {
        await ctx.runMutation(internal.marketData.patchBenchmarkDataClose, {
          ticker: symbol,
          close: Number(benchmarkData.close),
          percentageChange: Number(benchmarkData.percent_change),
          isMarketOpen: Boolean(benchmarkData.is_market_open),
        });
      } else {
        await ctx.runMutation(internal.marketData.addBenchmarkData, {
          name: benchmarkData.name,
          ticker: benchmarkData.symbol,
          exchange: benchmarkData.exchange,
          close: Number(benchmarkData.close),
          percentageChange: Number(benchmarkData.percent_change),
          isMarketOpen: Boolean(benchmarkData.is_market_open),
        });
      }
    }
  },
});

// add benchmark data
export const addBenchmarkData = internalMutation({
  args: {
    name: v.string(),
    ticker: v.string(),
    exchange: v.string(),
    close: v.number(),
    percentageChange: v.number(),
    isMarketOpen: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("marketBenchmarks")
      .withIndex("byTicker", (q) => q.eq("ticker", args.ticker))
      .first();

    if (existing) {
      return;
    }

    await ctx.db.insert("marketBenchmarks", {
      name: args.name,
      ticker: args.ticker,
      exchange: args.exchange,
      close: args.close,
      percentageChange: args.percentageChange,
      isMarketOpen: args.isMarketOpen,
      updatedAt: Date.now(),
    });
  },
});

// patch benchmark data
export const patchBenchmarkDataClose = internalMutation({
  args: {
    ticker: v.string(),
    close: v.number(),
    percentageChange: v.number(),
    isMarketOpen: v.boolean(),
  },
  handler: async (ctx, args) => {
    const benchmark = await ctx.db
      .query("marketBenchmarks")
      .withIndex("byTicker", (q) => q.eq("ticker", args.ticker))
      .first();

    if (benchmark) {
      await ctx.db.patch(benchmark._id, {
        close: args.close,
        percentageChange: args.percentageChange,
        isMarketOpen: args.isMarketOpen,
        updatedAt: Date.now(),
      });
    }
  },
});

// does benchmark exit
export const doesBenchmarkExist = internalQuery({
  args: {
    ticker: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("marketBenchmarks")
      .withIndex("byTicker", (q) => q.eq("ticker", args.ticker))
      .first();
    if (existing) {
      return true;
    }
    return false;
  },
});

// get benchmark data
export const getBenchmarkData = query({
  handler: async (ctx) => {
    const benchmarks = await ctx.db.query("marketBenchmarks").collect();
    return benchmarks;
  },
});

// ─── FX Rates ───────────────────────────────────────────────────────────────────
// Fetches EUR-based rates from ExchangeRatesAPI via the market data service,
// stores them in Convex. One document, updated daily.

/** Store FX rates into the fxRates table (upsert — single document) */
export const storeFxRates = internalMutation({
  args: {
    base: v.string(),
    rates: v.any(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("fxRates").first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        base: args.base,
        rates: args.rates,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("fxRates", {
        base: args.base,
        rates: args.rates,
        updatedAt: Date.now(),
      });
    }
  },
});

/** Fetch FX rates from market data service and store in Convex */
export const fetchFxRates = action({
  handler: async (ctx) => {
    const response = await fetch(`${marketDataUrl}/fx`);
    if (!response.ok) {
      console.error(`Failed to fetch FX rates: ${response.statusText}`);
      return;
    }

    const json = await response.json();
    const data = json.Data || json;

    if (!data.rates || !data.base) {
      console.error("Invalid FX response shape — missing rates or base");
      return;
    }

    await ctx.runMutation(internal.marketData.storeFxRates, {
      base: data.base,
      rates: data.rates,
    });

    console.log(
      `FX rates updated: ${Object.keys(data.rates).length} currencies, base=${data.base}`,
    );
  },
});

/** Read the current FX rates (for use in queries) */
export const getFxRates = query({
  handler: async (ctx) => {
    const doc = await ctx.db.query("fxRates").first();
    return doc || null;
  },
});

/** Internal version for use in other queries */
export const getFxRatesInternal = internalQuery({
  handler: async (ctx) => {
    const doc = await ctx.db.query("fxRates").first();
    return doc
      ? { base: doc.base, rates: doc.rates as Record<string, number> }
      : null;
  },
});

/**
 * Returns all currency codes available for conversion.
 * Extracts keys from the fxRates document (EUR-based pairs)
 * and includes "EUR" itself (the base, which isn't in the rates map).
 */
export const getAvailableCurrencies = query({
  handler: async (ctx) => {
    const doc = await ctx.db.query("fxRates").first();
    if (!doc || !doc.rates) return [];
    const rates = doc.rates as Record<string, number>;
    const codes = Object.keys(rates);
    // EUR is the base currency and won't appear as a key in rates
    if (!codes.includes("EUR")) {
      codes.unshift("EUR");
    }
    return codes.sort();
  },
});
