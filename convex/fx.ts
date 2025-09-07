import { api, internal } from "./_generated/api";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { v } from "convex/values";
import { marketDataUrl } from "./marketData";

/**
 * Initialize FX rates with sample data
 * This is a temporary action to populate initial data
 */
export const initializeFxRates = action({
  handler: async (ctx) => {
    try {
      // Sample FX rates relative to USD
      const sampleRates = {
        "EUR": 0.85,
        "GBP": 0.75, 
        "CAD": 1.35,
        "JPY": 110.0,
        "AUD": 1.45,
        "CHF": 0.92
      };
      
      const today = new Date().toISOString().split("T")[0];
      
      // Store each exchange rate
      for (const [currency, rate] of Object.entries(sampleRates)) {
        await ctx.runMutation(internal.fx.upsertFxRate, {
          baseCurrency: "USD",
          targetCurrency: currency,
          rate: rate,
          date: today,
        });
      }
      
      console.log("Sample FX rates initialized successfully");
    } catch (error) {
      console.error("Error initializing FX rates:", error);
    }
  },
});

/**
 * Fetch and update FX rates from the market data API
 */
export const updateFxRates = action({
  handler: async (ctx) => {
    try {
      const response = await fetch(`${marketDataUrl}/fx`);
      if (!response.ok) {
        console.error("Failed to fetch FX rates:", response.statusText);
        return;
      }
      
      const fxData = await response.json();
      const today = new Date().toISOString().split("T")[0];
      
      // Store each exchange rate
      for (const [currency, rate] of Object.entries(fxData)) {
        if (typeof rate === "number") {
          await ctx.runMutation(internal.fx.upsertFxRate, {
            baseCurrency: "USD",
            targetCurrency: currency,
            rate: rate,
            date: today,
          });
        }
      }
      
      console.log("FX rates updated successfully");
    } catch (error) {
      console.error("Error updating FX rates:", error);
    }
  },
});

/**
 * Internal mutation to insert or update an FX rate
 */
export const upsertFxRate = internalMutation({
  args: {
    baseCurrency: v.string(),
    targetCurrency: v.string(),
    rate: v.number(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("currencyRates")
      .withIndex("byCurrency", (q) =>
        q
          .eq("baseCurrency", args.baseCurrency)
          .eq("targetCurrency", args.targetCurrency)
          .eq("date", args.date)
      )
      .first();

    if (existing) {
      // Update existing rate
      await ctx.db.patch(existing._id, {
        rate: args.rate,
        updatedAt: Date.now(),
      });
    } else {
      // Insert new rate
      await ctx.db.insert("currencyRates", {
        baseCurrency: args.baseCurrency,
        targetCurrency: args.targetCurrency,
        rate: args.rate,
        date: args.date,
        updatedAt: Date.now(),
      });
    }
  },
});

/**
 * Get the latest FX rate for a currency pair
 */
export const getLatestFxRate = query({
  args: {
    baseCurrency: v.string(),
    targetCurrency: v.string(),
  },
  handler: async (ctx, args) => {
    // If same currency, return 1
    if (args.baseCurrency === args.targetCurrency) {
      return 1;
    }

    const rate = await ctx.db
      .query("currencyRates")
      .withIndex("byCurrency", (q) =>
        q
          .eq("baseCurrency", args.baseCurrency)
          .eq("targetCurrency", args.targetCurrency)
      )
      .order("desc")
      .first();

    return rate?.rate || null;
  },
});

/**
 * Get all available currencies that have FX rates
 */
export const getAvailableCurrencies = query({
  handler: async (ctx) => {
    const rates = await ctx.db.query("currencyRates").collect();
    
    const currencies = new Set<string>();
    rates.forEach(rate => {
      currencies.add(rate.baseCurrency);
      currencies.add(rate.targetCurrency);
    });
    
    return Array.from(currencies).sort();
  },
});

/**
 * Convert an amount from one currency to another
 * This is a utility function that can be used in other queries
 */
export const convertCurrency = query({
  args: {
    amount: v.number(),
    fromCurrency: v.string(),
    toCurrency: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.fromCurrency === args.toCurrency) {
      return args.amount;
    }

    // Get the exchange rate
    const rate = await ctx.runQuery(api.fx.getLatestFxRate, {
      baseCurrency: args.fromCurrency,
      targetCurrency: args.toCurrency,
    });

    if (rate === null) {
      // If no direct rate, try inverse
      const inverseRate = await ctx.runQuery(api.fx.getLatestFxRate, {
        baseCurrency: args.toCurrency,
        targetCurrency: args.fromCurrency,
      });
      
      if (inverseRate !== null && inverseRate !== 0) {
        return args.amount / inverseRate;
      }
      
      // If no rate available, return original amount
      console.warn(`No exchange rate found for ${args.fromCurrency} to ${args.toCurrency}`);
      return args.amount;
    }

    return args.amount * rate;
  },
});