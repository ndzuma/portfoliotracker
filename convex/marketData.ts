import { api, internal } from "./_generated/api";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { v } from "convex/values";

export const marketDataUrl = process.env.MARKET_DATA_SERVICE_URL || process.env.MARKET_DATA_URL || "https://market-data-api.up.railway.app";

export const updateHistoricalData = action({
  handler: async (ctx) => {
    const data = await ctx.runQuery(
      internal.marketData.getAssetsWithoutHistoricalData,
    );

    // split data into chunks of 5 by splitting the array into subarrays of 5 elements each
    const chunkSize = 5;
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      const response = await fetch(
        `${marketDataUrl}/historical/${chunk.join(",").replace(/\//g, "_")}`,
      );
      if (!response.ok) {
        console.error(
          `Failed to fetch historical data for chunk: ${chunk.join(",").replace(/\//g, "_")}`,
        );
        continue;
      }
      const historicalData = await response.json();

      if (chunk.length === 1) {
        for (const record of historicalData) {
          await ctx.runMutation(internal.marketData.addHistoricalData, {
            ticker: chunk[0].replace(/_/g, "/"),
            date: record.datetime,
            open: Number(record.open),
            high: Number(record.high),
            low: Number(record.low),
            close: Number(record.close),
            volume: Number(record.volume),
          });
        }
      } else {
        for (const symbol in historicalData) {
          for (const record of historicalData[symbol]) {
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
      new Set(assets.map((asset) => asset.symbol).filter(Boolean)),
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
export const getHistoricalData = query({
  args: {
    portfolioId: v.union(v.id("portfolios"), v.string()),
  },
  handler: async (ctx, args) => {
    // get portfolio assets and transactions and format the data into {symbol, date, quantity, price, type}
    const assets = await ctx.db
      .query("assets")
      .withIndex("byPortfolio", (q) => q.eq("portfolioId", args.portfolioId))
      .collect();
    if (assets.length === 0) {
      return [];
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
    // get historicalData for each symbol from the earliest date to today
    // mind you the historical data date is in YYYY-MM-DD format but the transaction date is in ISO format
    const historicalData: Record<string, any[]> = {};
    let formattedStartDate: string;
    for (const symbol in symbolEarliestDate) {
      const startDate = new Date(symbolEarliestDate[symbol]);
      formattedStartDate = startDate.toISOString().split("T")[0];
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
    const today = new Date();
    for (
      let date = new Date(portfolioStartDate);
      date <= today;
      date.setDate(date.getDate() + 1)
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
            const assetValue =
              transaction.quantity *
              transaction.price *
              (transaction.type === "buy" ? 1 : -1);
            dailyValue += assetValue;
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
        dailyValue += quantityHeld * priceRecord.close;
      }

      result.push({
        date: formattedDate,
        value: dailyValue,
      });
    }
    return result;
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

    for (const [symbol, benchmarkData] of Object.entries(benchmarks)) {
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
