// analytics.convex.test.ts - Convex-integrated analytics tests
import { convexTest } from "convex-test";
import { expect, test, describe, beforeEach } from "vitest";
import { api } from "./_generated/api";
import {
  calculateRiskMetrics,
  calculatePerformanceMetrics,
  calculateBenchmarkComparisons,
  calculateAssetAllocation,
  calculateReturns,
  type Asset,
  type Transaction,
  type PriceDataPoint,
  type BenchmarkData,
} from "./analytics";
import { modules } from "./test-setup";
import schema from "./schema";

describe("Analytics Integration with Convex", () => {
  describe("Analytics with Mock Database Data", () => {
    test("should calculate analytics for portfolio with database integration", async () => {
      const t = convexTest(schema, modules);

      // Create test data in the mock database
      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          email: "test@example.com",
          name: "Test User",
        });
      });

      const portfolioId = await t.run(async (ctx) => {
        return await ctx.db.insert("portfolios", {
          userId: userId,
          name: "Test Portfolio",
          description: "A portfolio for testing",
        });
      });

      // Create assets
      const assetId1 = await t.run(async (ctx) => {
        return await ctx.db.insert("assets", {
          portfolioId: portfolioId,
          name: "Apple Inc.",
          symbol: "AAPL",
          type: "stock",
          currentPrice: 150,
        });
      });

      const assetId2 = await t.run(async (ctx) => {
        return await ctx.db.insert("assets", {
          portfolioId: portfolioId,
          name: "Bitcoin",
          symbol: "BTC",
          type: "crypto",
          currentPrice: 45000,
        });
      });

      // Create transactions
      await t.run(async (ctx) => {
        await ctx.db.insert("transactions", {
          assetId: assetId1,
          type: "buy",
          date: Date.parse("2023-01-01"),
          quantity: 10,
          price: 120,
          fees: 5,
        });

        await ctx.db.insert("transactions", {
          assetId: assetId2,
          type: "buy",
          date: Date.parse("2023-01-01"),
          quantity: 0.5,
          price: 40000,
          fees: 25,
        });
      });

      // Create historical market data
      await t.run(async (ctx) => {
        const dates = ["2023-01-01", "2023-01-02", "2023-01-03", "2023-01-04", "2023-01-05"];
        const prices = [382, 388, 395, 390, 398];

        for (let i = 0; i < dates.length; i++) {
          await ctx.db.insert("marketHistoricData", {
            ticker: "SPY",
            date: dates[i],
            open: prices[i] - 2,
            high: prices[i] + 3,
            low: prices[i] - 3,
            close: prices[i],
            volume: 1000000 + i * 100000,
          });
        }
      });

      // Now simulate what the analytics function would do
      const assets = await t.run(async (ctx) => {
        const portfolioAssets = await ctx.db
          .query("assets")
          .filter((q) => q.eq(q.field("portfolioId"), portfolioId))
          .collect();

        const assetsWithTransactions: Asset[] = [];

        for (const asset of portfolioAssets) {
          const transactions = await ctx.db
            .query("transactions")
            .filter((q) => q.eq(q.field("assetId"), asset._id))
            .collect();

          const typedTransactions: Transaction[] = transactions.map((txn) => ({
            assetId: txn.assetId,
            type: txn.type,
            date: txn.date,
            quantity: txn.quantity,
            price: txn.price,
            fees: txn.fees,
          }));

          assetsWithTransactions.push({
            ...asset,
            transactions: typedTransactions,
          });
        }

        return assetsWithTransactions;
      });

      const benchmarkData = await t.run(async (ctx) => {
        return await ctx.db
          .query("marketHistoricData")
          .filter((q) => q.eq(q.field("ticker"), "SPY"))
          .collect();
      });

      // Create sample historical data for the portfolio
      const historicalData: PriceDataPoint[] = [
        { date: "2023-01-01", value: 42500 }, // Initial value
        { date: "2023-01-02", value: 43200 },
        { date: "2023-01-03", value: 44000 },
        { date: "2023-01-04", value: 43500 },
        { date: "2023-01-05", value: 45000 },
      ];

      const transactions: Transaction[] = assets.flatMap(
        (asset) => asset.transactions || []
      );

      // Test analytics calculations
      const returns = calculateReturns(historicalData);
      const benchmarkReturns = calculateReturns(
        benchmarkData.map((d) => ({ date: d.date, value: d.close }))
      );

      // Test risk metrics
      const riskMetrics = calculateRiskMetrics(
        returns,
        historicalData,
        benchmarkReturns,
        assets,
        "daily"
      );

      expect(riskMetrics).toBeDefined();
      expect(riskMetrics.volatility).toBeGreaterThanOrEqual(0);
      expect(riskMetrics.maxDrawdown).toBeGreaterThanOrEqual(0);
      expect(typeof riskMetrics.beta).toBe("number");
      expect(riskMetrics.assetDiversification).toHaveLength(2); // stock and crypto

      // Test performance metrics
      const performanceMetrics = calculatePerformanceMetrics(
        returns,
        historicalData,
        transactions,
        benchmarkReturns,
        "daily",
        riskMetrics.beta
      );

      expect(performanceMetrics).toBeDefined();
      expect(typeof performanceMetrics.totalReturn).toBe("number");
      expect(typeof performanceMetrics.timeWeightedReturn).toBe("number");
      expect(typeof performanceMetrics.annualizedReturn).toBe("number");
      expect(Array.isArray(performanceMetrics.monthlyReturns)).toBe(true);

      // Test benchmark comparisons
      const benchmarkComparisons = calculateBenchmarkComparisons(
        returns,
        historicalData,
        benchmarkReturns,
        benchmarkData,
        "daily"
      );

      expect(benchmarkComparisons).toBeDefined();
      expect(typeof benchmarkComparisons.correlation).toBe("number");
      expect(typeof benchmarkComparisons.trackingError).toBe("number");
      expect(Array.isArray(benchmarkComparisons.yearlyComparison)).toBe(true);

      // Test asset allocation
      const assetAllocation = calculateAssetAllocation(assets);

      expect(assetAllocation).toBeDefined();
      expect(Array.isArray(assetAllocation.byType)).toBe(true);
      expect(assetAllocation.byType).toHaveLength(2); // stock and crypto

      // Verify asset allocation percentages sum to 100%
      const totalPercentage = assetAllocation.byType.reduce(
        (sum, allocation) => sum + allocation.percentage,
        0
      );
      expect(totalPercentage).toBeCloseTo(100, 1);
    });
  });

  describe("Analytics Function Error Handling", () => {
    test("should handle portfolio with no assets gracefully", async () => {
      const t = convexTest(schema, modules);

      const emptyAssets: Asset[] = [];
      const emptyHistoricalData: PriceDataPoint[] = [];
      const emptyTransactions: Transaction[] = [];
      const emptyReturns = calculateReturns(emptyHistoricalData);
      const emptyBenchmarkData: BenchmarkData[] = [];

      // Test that functions handle empty data gracefully
      const riskMetrics = calculateRiskMetrics(
        emptyReturns,
        emptyHistoricalData,
        emptyReturns,
        emptyAssets,
        "daily"
      );

      expect(riskMetrics.volatility).toBe(0);
      expect(riskMetrics.maxDrawdown).toBe(0);
      expect(riskMetrics.beta).toBe(0);
      expect(riskMetrics.assetDiversification).toEqual([]);

      const performanceMetrics = calculatePerformanceMetrics(
        emptyReturns,
        emptyHistoricalData,
        emptyTransactions,
        emptyReturns,
        "daily",
        0
      );

      expect(performanceMetrics.totalReturn).toBe(0);
      expect(performanceMetrics.timeWeightedReturn).toBe(0);
      expect(performanceMetrics.monthlyReturns).toEqual([]);

      const assetAllocation = calculateAssetAllocation(emptyAssets);
      expect(assetAllocation.byType).toEqual([]);
    });

    test("should handle assets without transactions", async () => {
      const t = convexTest(schema, modules);

      const assetsWithoutTransactions: Asset[] = [
        {
          _id: "asset1" as any,
          _creationTime: Date.now(),
          symbol: "AAPL",
          type: "stock",
          name: "Apple Inc.",
          portfolioId: "portfolio1" as any,
          currentPrice: 150,
          transactions: [], // No transactions
        },
      ];

      const assetAllocation = calculateAssetAllocation(assetsWithoutTransactions);

      expect(assetAllocation.byType).toHaveLength(1);
      expect(assetAllocation.byType[0].type).toBe("stock");
      expect(assetAllocation.byType[0].percentage).toBe(0); // No value since no transactions
    });
  });

  describe("Data Source Variations", () => {
    test("should handle weekly data source correctly", async () => {
      const t = convexTest(schema, modules);

      const weeklyData: PriceDataPoint[] = [
        { date: "2023-01-01", value: 1000 },
        { date: "2023-01-08", value: 1050 },
        { date: "2023-01-15", value: 1100 },
        { date: "2023-01-22", value: 1080 },
        { date: "2023-01-29", value: 1120 },
      ];

      const weeklyReturns = calculateReturns(weeklyData, "weekly");
      const dailyReturns = calculateReturns(weeklyData, "daily");

      // Both should work but may have different implications for annualized calculations
      expect(weeklyReturns).toHaveLength(4);
      expect(dailyReturns).toHaveLength(4);
    });
  });

  describe("Authentication Context", () => {
    test("should work with authenticated user context", async () => {
      const t = convexTest(schema, modules);
      const asUser = t.withIdentity({ name: "Test User", email: "test@example.com" });

      // This would be useful when testing functions that require authentication
      // For pure analytics functions, authentication isn't needed, but this shows the pattern
      await asUser.run(async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        expect(identity?.name).toBe("Test User");
        expect(identity?.email).toBe("test@example.com");
      });
    });
  });

  describe("Real-world Scenarios", () => {
    test("should handle mixed asset types with varying transaction patterns", async () => {
      const t = convexTest(schema, modules);

      const mixedAssets: Asset[] = [
        {
          _id: "asset1" as any,
          _creationTime: Date.now(),
          symbol: "AAPL",
          type: "stock",
          name: "Apple Inc.",
          portfolioId: "portfolio1" as any,
          currentPrice: 150,
          transactions: [
            {
              assetId: "asset1",
              type: "buy",
              date: Date.parse("2023-01-01"),
              quantity: 10,
              price: 120,
              fees: 5,
            },
            {
              assetId: "asset1",
              type: "sell",
              date: Date.parse("2023-02-01"),
              quantity: 5,
              price: 140,
              fees: 3,
            },
          ],
        },
        {
          _id: "asset2" as any,
          _creationTime: Date.now(),
          symbol: "VTIAX",
          type: "bond",
          name: "Vanguard Total Bond Market",
          portfolioId: "portfolio1" as any,
          currentPrice: 110,
          transactions: [
            {
              assetId: "asset2",
              type: "buy",
              date: Date.parse("2023-01-15"),
              quantity: 100,
              price: 100,
              fees: 10,
            },
          ],
        },
        {
          _id: "asset3" as any,
          _creationTime: Date.now(),
          symbol: "BTC",
          type: "crypto",
          name: "Bitcoin",
          portfolioId: "portfolio1" as any,
          currentPrice: 45000,
          transactions: [
            {
              assetId: "asset3",
              type: "buy",
              date: Date.parse("2023-01-10"),
              quantity: 0.5,
              price: 40000,
              fees: 25,
            },
            {
              assetId: "asset3",
              type: "dividend",
              date: Date.parse("2023-03-01"),
              price: 100, // Dividend payment
            },
          ],
        },
      ];

      const assetAllocation = calculateAssetAllocation(mixedAssets);

      expect(assetAllocation.byType).toHaveLength(3); // stock, bond, crypto
      expect(assetAllocation.byType.find(a => a.type === "stock")).toBeDefined();
      expect(assetAllocation.byType.find(a => a.type === "bond")).toBeDefined();
      expect(assetAllocation.byType.find(a => a.type === "crypto")).toBeDefined();

      // Test that percentages are reasonable (should sum to ~100%)
      const totalPercentage = assetAllocation.byType.reduce(
        (sum, allocation) => sum + allocation.percentage,
        0
      );
      expect(totalPercentage).toBeCloseTo(100, 1);
    });

    test("should handle portfolio with significant volatility", async () => {
      const t = convexTest(schema, modules);

      const volatileData: PriceDataPoint[] = [
        { date: "2023-01-01", value: 10000 },
        { date: "2023-01-02", value: 12000 }, // +20%
        { date: "2023-01-03", value: 9500 },  // -20.8%
        { date: "2023-01-04", value: 11500 }, // +21%
        { date: "2023-01-05", value: 8000 },  // -30.4%
        { date: "2023-01-06", value: 10500 }, // +31.25%
      ];

      const returns = calculateReturns(volatileData);

      const riskMetrics = calculateRiskMetrics(
        returns,
        volatileData,
        returns, // Using same returns as benchmark for simplicity
        [],
        "daily"
      );

      expect(riskMetrics.volatility).toBeGreaterThan(0);
      expect(riskMetrics.maxDrawdown).toBeGreaterThan(0);
      expect(riskMetrics.maxDrawdown).toBeLessThanOrEqual(1); // Max 100%

      // High volatility should be reflected in the metrics
      expect(riskMetrics.volatility).toBeGreaterThan(0.5); // Expect high volatility
    });
  });
});
