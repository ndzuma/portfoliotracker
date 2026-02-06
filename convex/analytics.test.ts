// analytics.test.ts - Comprehensive test suite for portfolio analytics functions
import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import {
  calculateReturns,
  calculateVolatility,
  calculateMaxDrawdown,
  calculateBeta,
  calculateVaR,
  calculateSharpeRatio,
  calculateDownsideDeviation,
  getRiskFreeRate,
  calculateTotalReturn,
  calculateTimeWeightedReturn,
  calculateAnnualizedReturn,
  calculateRollingReturns,
  calculateMonthlyReturns,
  calculateYTDReturn,
  findBestPeriod,
  findWorstPeriod,
  calculateAlpha,
  calculateWinRate,
  calculateCumulativeOutperformance,
  calculateTrackingError,
  calculateUpMarketCapture,
  calculateDownMarketCapture,
  calculateInformationRatio,
  calculateCorrelation,
  calculateYearlyComparison,
  calculateAssetDiversification,
  calculateAllocationByType,
  countAssetTypes,
  calculateRiskMetrics,
  calculatePerformanceMetrics,
  calculateBenchmarkComparisons,
  calculateAssetAllocation,
  getEarliestDate,
  aggregateReturns,
  roundToDay,
  interpolateValue,
  calculateSimpleReturn,
  type PriceDataPoint,
  type ReturnDataPoint,
  type Transaction,
  type Asset,
  type BenchmarkData,
} from "./analytics";

import schema from "./schema";

// Test data fixtures
const samplePriceData: PriceDataPoint[] = [
  { date: "2023-01-01", value: 1000 },
  { date: "2023-01-02", value: 1050 },
  { date: "2023-01-03", value: 1020 },
  { date: "2023-01-04", value: 1080 },
  { date: "2023-01-05", value: 1100 },
];

const sampleReturnData: ReturnDataPoint[] = [
  { date: "2023-01-02", returnValue: 0.05 },
  { date: "2023-01-03", returnValue: -0.0286 },
  { date: "2023-01-04", returnValue: 0.0588 },
  { date: "2023-01-05", returnValue: 0.0185 },
];

const sampleBenchmarkData: BenchmarkData[] = [
  {
    _id: "benchmark1" as any,
    _creationTime: Date.now(),
    date: "2023-01-01",
    ticker: "SPY",
    open: 380,
    high: 385,
    low: 378,
    close: 382,
    volume: 1000000,
  },
  {
    _id: "benchmark2" as any,
    _creationTime: Date.now(),
    date: "2023-01-02",
    ticker: "SPY",
    open: 382,
    high: 390,
    low: 381,
    close: 388,
    volume: 1200000,
  },
];

const sampleAssets: Asset[] = [
  {
    _id: "asset1" as any,
    _creationTime: Date.now(),
    symbol: "AAPL",
    currency: "USD",
    currentPrice: 150,
    type: "stock",
    name: "Apple Inc.",
    portfolioId: "portfolio1" as any,
    transactions: [
      {
        assetId: "asset1",
        type: "buy",
        date: Date.parse("2023-01-01"),
        quantity: 10,
        price: 100,
        fees: 5,
      },
    ],
  },
  {
    _id: "asset2" as any,
    _creationTime: Date.now(),
    symbol: "GOOGL",
    currency: "USD",
    currentPrice: 2500,
    type: "stock",
    name: "Alphabet Inc.",
    portfolioId: "portfolio1" as any,
    transactions: [
      {
        assetId: "asset2",
        type: "buy",
        date: Date.parse("2023-01-01"),
        quantity: 2,
        price: 2000,
        fees: 10,
      },
    ],
  },
  {
    _id: "asset3" as any,
    _creationTime: Date.now(),
    symbol: "BTC",
    currency: "USD",
    currentPrice: 40000,
    type: "crypto",
    name: "Bitcoin",
    portfolioId: "portfolio1" as any,
    transactions: [
      {
        assetId: "asset3",
        type: "buy",
        date: Date.parse("2023-01-01"),
        quantity: 0.5,
        price: 30000,
        fees: 50,
      },
    ],
  },
];

const sampleTransactions: Transaction[] = [
  {
    assetId: "asset1",
    type: "buy",
    date: Date.parse("2023-01-01"),
    quantity: 10,
    price: 100,
    fees: 5,
  },
  {
    assetId: "asset1",
    type: "sell",
    date: Date.parse("2023-01-15"),
    quantity: 5,
    price: 110,
    fees: 3,
  },
  {
    assetId: "asset2",
    type: "dividend",
    date: Date.parse("2023-01-10"),
    price: 50,
  },
];

describe("Data Processing & Utility Functions", () => {
  test("calculateReturns should convert price data to returns correctly", async () => {
    const t = convexTest(schema);
    const returns = calculateReturns(samplePriceData);

    expect(returns).toHaveLength(4);
    expect(returns[0].returnValue).toBeCloseTo(0.05); // (1050-1000)/1000
    expect(returns[1].returnValue).toBeCloseTo(-0.0286, 3); // (1020-1050)/1050
    expect(returns[2].returnValue).toBeCloseTo(0.0588, 3); // (1080-1020)/1020
    expect(returns[3].returnValue).toBeCloseTo(0.0185, 3); // (1100-1080)/1080
  });

  test("calculateReturns should handle empty array", async () => {
    const t = convexTest(schema);
    const returns = calculateReturns([]);
    expect(returns).toHaveLength(0);
  });

  test("getEarliestDate should find the earliest date", async () => {
    const t = convexTest(schema);
    const earliest = getEarliestDate(samplePriceData);
    expect(earliest).toEqual(new Date("2023-01-01"));
  });

  test("getEarliestDate should return null for empty array", async () => {
    const t = convexTest(schema);
    const earliest = getEarliestDate([]);
    expect(earliest).toBeNull();
  });

  test("aggregateReturns should aggregate returns over periods", async () => {
    const t = convexTest(schema);
    const aggregated = aggregateReturns(sampleReturnData, 2);

    expect(aggregated).toHaveLength(2);
    expect(aggregated[0].returnValue).toBeCloseTo(0.01997, 4); // (1.05 × 0.9714) - 1
    expect(aggregated[1].returnValue).toBeCloseTo(0.0783878, 4); // (1.0588 × 1.0185) - 1
  });

  test("roundToDay should round timestamp to midnight", async () => {
    const t = convexTest(schema);
    const timestamp = Date.parse("2023-01-01T15:30:45.123Z");
    const rounded = roundToDay(timestamp);
    const expected = Date.parse("2023-01-01T00:00:00.000Z");
    expect(rounded).toBe(expected);
  });

  test("calculateSimpleReturn should calculate basic return", async () => {
    const t = convexTest(schema);
    const simpleReturn = calculateSimpleReturn(samplePriceData);
    expect(simpleReturn).toBeCloseTo(0.1); // (1100-1000)/1000
  });

  test("calculateSimpleReturn should handle insufficient data", async () => {
    const t = convexTest(schema);
    expect(calculateSimpleReturn([])).toBe(0);
    expect(calculateSimpleReturn([{ date: "2023-01-01", value: 1000 }])).toBe(
      0,
    );
  });
});

describe("Risk Metrics Functions", () => {
  test("calculateVolatility should calculate annualized volatility", async () => {
    const t = convexTest(schema);
    const volatility = calculateVolatility(sampleReturnData, "daily");
    expect(volatility).toBeGreaterThan(0);
    expect(volatility).toBeLessThan(1); // Should be reasonable for daily data
  });

  test("calculateVolatility should handle empty returns", async () => {
    const t = convexTest(schema);
    const volatility = calculateVolatility([], "daily");
    expect(volatility).toBe(0);
  });

  test("calculateMaxDrawdown should find maximum drawdown", async () => {
    const t = convexTest(schema);
    const drawdownData: PriceDataPoint[] = [
      { date: "2023-01-01", value: 1000 },
      { date: "2023-01-02", value: 1200 }, // Peak
      { date: "2023-01-03", value: 900 }, // Drawdown
      { date: "2023-01-04", value: 950 },
    ];

    const maxDrawdown = calculateMaxDrawdown(drawdownData);
    expect(maxDrawdown).toBeCloseTo(0.25); // (1200-900)/1200
  });

  test("calculateBeta should calculate beta coefficient", async () => {
    const t = convexTest(schema);
    const portfolioReturns = sampleReturnData;
    const benchmarkReturns = sampleReturnData.map((r) => ({
      ...r,
      returnValue: r.returnValue * 0.8,
    }));

    const beta = calculateBeta(portfolioReturns, benchmarkReturns);
    expect(beta).toBeGreaterThan(1); // Portfolio should be more volatile
  });

  test("calculateBeta should handle empty data", async () => {
    const t = convexTest(schema);
    const beta = calculateBeta([], sampleReturnData);
    expect(beta).toBe(0);
  });

  test("calculateVaR should calculate Value at Risk", async () => {
    const t = convexTest(schema);
    const negativeReturns: ReturnDataPoint[] = [
      { date: "2023-01-01", returnValue: -0.05 },
      { date: "2023-01-02", returnValue: -0.02 },
      { date: "2023-01-03", returnValue: -0.08 },
      { date: "2023-01-04", returnValue: -0.01 },
    ];

    const var95 = calculateVaR(negativeReturns, 0.95);
    expect(var95).toBeGreaterThan(0);
  });

  test("calculateSharpeRatio should calculate risk-adjusted return", async () => {
    const t = convexTest(schema);
    const riskFreeRate = 0.02 / 252; // Daily risk-free rate
    const sharpe = calculateSharpeRatio(
      sampleReturnData,
      riskFreeRate,
      "daily",
    );
    expect(typeof sharpe).toBe("number");
  });

  test("calculateDownsideDeviation should measure downside risk", async () => {
    const t = convexTest(schema);
    const downsideDeviation = calculateDownsideDeviation(
      sampleReturnData,
      0,
      "daily",
    );
    expect(downsideDeviation).toBeGreaterThanOrEqual(0);
  });

  test("getRiskFreeRate should return a reasonable rate", async () => {
    const t = convexTest(schema);
    const riskFreeRate = getRiskFreeRate();
    expect(riskFreeRate).toBeGreaterThan(0);
    expect(riskFreeRate).toBeLessThan(1);
  });
});

describe("Performance Metrics Functions", () => {
  test("calculateTotalReturn should calculate total return correctly", async () => {
    const t = convexTest(schema);
    const totalReturn = calculateTotalReturn(samplePriceData);
    expect(totalReturn).toBeCloseTo(0.1); // (1100-1000)/1000
  });

  test("calculateAnnualizedReturn should annualize returns", async () => {
    const t = convexTest(schema);
    const annualizedReturn = calculateAnnualizedReturn(
      samplePriceData,
      "daily",
    );
    expect(typeof annualizedReturn).toBe("number");
    expect(annualizedReturn).not.toBe(0);
  });

  test("calculateTimeWeightedReturn should handle transactions", async () => {
    const t = convexTest(schema);
    const twr = calculateTimeWeightedReturn(
      samplePriceData,
      sampleTransactions,
    );
    expect(typeof twr).toBe("number");
  });

  test("calculateTimeWeightedReturn should fall back to simple return with no transactions", async () => {
    const t = convexTest(schema);
    const twr = calculateTimeWeightedReturn(samplePriceData, []);
    const simpleReturn = calculateSimpleReturn(samplePriceData);
    expect(twr).toBeCloseTo(simpleReturn);
  });

  test("calculateRollingReturns should calculate multiple period returns", async () => {
    const t = convexTest(schema);
    const longData: PriceDataPoint[] = Array.from({ length: 300 }, (_, i) => ({
      date: new Date(2023, 0, i + 1).toISOString().split("T")[0],
      value: 1000 * (1 + Math.random() * 0.002 - 0.001), // Random walk
    }));

    const rollingReturns = calculateRollingReturns(longData, "daily");
    expect(rollingReturns).toHaveProperty("1Y");
    expect(rollingReturns).toHaveProperty("3Y");
    expect(rollingReturns).toHaveProperty("5Y");
  });

  test("calculateMonthlyReturns should group returns by month", () => {
    const monthlyData: PriceDataPoint[] = [
      { date: "2023-01-01", value: 1000 },
      { date: "2023-01-15", value: 1050 },
      { date: "2023-01-31", value: 1100 },
      { date: "2023-02-15", value: 1080 },
      { date: "2023-02-28", value: 1120 },
    ];

    const monthlyReturns = calculateMonthlyReturns(monthlyData, "daily");
    expect(monthlyReturns.length).toBeGreaterThan(0);
    expect(monthlyReturns[0]).toHaveProperty("month");
    expect(monthlyReturns[0]).toHaveProperty("return");
  });

  test("calculateYTDReturn should calculate year-to-date return", () => {
    const currentYear = new Date().getFullYear();
    const ytdData: PriceDataPoint[] = [
      { date: `${currentYear}-01-01`, value: 1000 },
      { date: `${currentYear}-06-01`, value: 1150 },
    ];

    const ytdReturn = calculateYTDReturn(ytdData);
    expect(ytdReturn).toBeCloseTo(0.15);
  });

  test("findBestPeriod should find best performing period", () => {
    const bestPeriod = findBestPeriod(sampleReturnData, 2);
    expect(bestPeriod).toHaveProperty("startDate");
    expect(bestPeriod).toHaveProperty("endDate");
    expect(bestPeriod).toHaveProperty("return");
  });

  test("findWorstPeriod should find worst performing period", () => {
    const worstPeriod = findWorstPeriod(sampleReturnData, 2);
    expect(worstPeriod).toHaveProperty("startDate");
    expect(worstPeriod).toHaveProperty("endDate");
    expect(worstPeriod).toHaveProperty("return");
  });

  test("calculateAlpha should calculate alpha", () => {
    const beta = 1.2;
    const alpha = calculateAlpha(sampleReturnData, sampleReturnData, beta);
    expect(typeof alpha).toBe("number");
  });

  test("calculateWinRate should calculate percentage of positive returns", () => {
    const winRate = calculateWinRate(sampleReturnData);
    expect(winRate).toBeGreaterThanOrEqual(0);
    expect(winRate).toBeLessThanOrEqual(100);
  });
});

describe("Benchmark Comparison Functions", () => {
  test("calculateCumulativeOutperformance should measure outperformance", () => {
    const outperformance = calculateCumulativeOutperformance(
      samplePriceData,
      sampleBenchmarkData,
    );
    expect(typeof outperformance).toBe("number");
  });

  test("calculateTrackingError should measure tracking error", () => {
    const benchmarkReturns = sampleReturnData.map((r) => ({
      ...r,
      returnValue: r.returnValue * 0.9,
    }));
    const trackingError = calculateTrackingError(
      sampleReturnData,
      benchmarkReturns,
    );
    expect(trackingError).toBeGreaterThanOrEqual(0);
  });

  test("calculateUpMarketCapture should measure up-market performance", () => {
    const positiveReturns: ReturnDataPoint[] = [
      { date: "2023-01-01", returnValue: 0.05 },
      { date: "2023-01-02", returnValue: 0.03 },
    ];
    const benchmarkPositive: ReturnDataPoint[] = [
      { date: "2023-01-01", returnValue: 0.04 },
      { date: "2023-01-02", returnValue: 0.02 },
    ];

    const upCapture = calculateUpMarketCapture(
      positiveReturns,
      benchmarkPositive,
    );
    expect(upCapture).toBeGreaterThan(0);
  });

  test("calculateDownMarketCapture should measure down-market performance", () => {
    const negativeReturns: ReturnDataPoint[] = [
      { date: "2023-01-01", returnValue: -0.03 },
      { date: "2023-01-02", returnValue: -0.02 },
    ];
    const benchmarkNegative: ReturnDataPoint[] = [
      { date: "2023-01-01", returnValue: -0.04 },
      { date: "2023-01-02", returnValue: -0.03 },
    ];

    const downCapture = calculateDownMarketCapture(
      negativeReturns,
      benchmarkNegative,
    );
    expect(downCapture).toBeGreaterThan(0);
  });

  test("calculateInformationRatio should calculate information ratio", () => {
    const trackingError = 0.05;
    const informationRatio = calculateInformationRatio(
      sampleReturnData,
      sampleReturnData,
      trackingError,
    );
    expect(typeof informationRatio).toBe("number");
  });

  test("calculateCorrelation should calculate correlation coefficient", () => {
    const correlation = calculateCorrelation(
      sampleReturnData,
      sampleReturnData,
    );
    expect(correlation).toBeCloseTo(1); // Perfect correlation with itself
  });

  test("calculateYearlyComparison should compare yearly performance", () => {
    const yearlyData: PriceDataPoint[] = [
      { date: "2022-01-01", value: 1000 },
      { date: "2022-12-31", value: 1100 },
      { date: "2023-01-01", value: 1100 },
      { date: "2023-12-31", value: 1200 },
    ];

    const benchmarkYearly: BenchmarkData[] = [
      { ...sampleBenchmarkData[0], date: "2022-01-01", close: 380 },
      { ...sampleBenchmarkData[0], date: "2022-12-31", close: 400 },
      { ...sampleBenchmarkData[0], date: "2023-01-01", close: 400 },
      { ...sampleBenchmarkData[0], date: "2023-12-31", close: 420 },
    ];

    const yearlyComparison = calculateYearlyComparison(
      yearlyData,
      benchmarkYearly,
      "daily",
    );
    expect(yearlyComparison.length).toBeGreaterThan(0);
    expect(yearlyComparison[0]).toHaveProperty("year");
    expect(yearlyComparison[0]).toHaveProperty("portfolioReturn");
    expect(yearlyComparison[0]).toHaveProperty("benchmarkReturn");
    expect(yearlyComparison[0]).toHaveProperty("outperformance");
  });
});

describe("Asset Allocation Functions", () => {
  test("calculateAssetDiversification should calculate diversification by count", () => {
    const diversification = calculateAssetDiversification(sampleAssets);
    expect(diversification).toHaveLength(2); // stock and crypto types
    expect(diversification[0]).toHaveProperty("type");
    expect(diversification[0]).toHaveProperty("percentage");

    // Should add up to 100%
    const totalPercentage = diversification.reduce(
      (sum, item) => sum + item.percentage,
      0,
    );
    expect(totalPercentage).toBeCloseTo(100);
  });

  test("calculateAllocationByType should calculate allocation by value", () => {
    const allocation = calculateAllocationByType(sampleAssets);
    expect(allocation).toHaveLength(2); // stock and crypto types
    expect(allocation[0]).toHaveProperty("type");
    expect(allocation[0]).toHaveProperty("percentage");
  });

  test("countAssetTypes should count assets by type", () => {
    const typeCounts = countAssetTypes(sampleAssets);
    expect(typeCounts).toHaveProperty("stock");
    expect(typeCounts).toHaveProperty("crypto");
    expect(typeCounts.stock).toBe(2); // AAPL and GOOGL
    expect(typeCounts.crypto).toBe(1); // BTC
  });
});

describe("High-Level Orchestration Functions", () => {
  test("calculateRiskMetrics should orchestrate all risk calculations", () => {
    const riskMetrics = calculateRiskMetrics(
      sampleReturnData,
      samplePriceData,
      sampleReturnData,
      sampleAssets,
      "daily",
    );

    expect(riskMetrics).toHaveProperty("volatility");
    expect(riskMetrics).toHaveProperty("maxDrawdown");
    expect(riskMetrics).toHaveProperty("beta");
    expect(riskMetrics).toHaveProperty("valueAtRisk");
    expect(riskMetrics.valueAtRisk).toHaveProperty("daily");
    expect(riskMetrics.valueAtRisk).toHaveProperty("monthly");
    expect(riskMetrics).toHaveProperty("sharpeRatio");
    expect(riskMetrics).toHaveProperty("downsideDeviation");
    expect(riskMetrics).toHaveProperty("assetDiversification");
  });

  test("calculatePerformanceMetrics should orchestrate all performance calculations", () => {
    const performanceMetrics = calculatePerformanceMetrics(
      sampleReturnData,
      samplePriceData,
      sampleTransactions,
      sampleReturnData,
      "daily",
      1.2, // beta
    );

    expect(performanceMetrics).toHaveProperty("totalReturn");
    expect(performanceMetrics).toHaveProperty("timeWeightedReturn");
    expect(performanceMetrics).toHaveProperty("annualizedReturn");
    expect(performanceMetrics).toHaveProperty("monthlyReturns");
    expect(performanceMetrics).toHaveProperty("ytdReturn");
    expect(performanceMetrics).toHaveProperty("rollingReturns");
    expect(performanceMetrics).toHaveProperty("bestWorstPeriods");
    expect(performanceMetrics.bestWorstPeriods).toHaveProperty("bestMonth");
    expect(performanceMetrics.bestWorstPeriods).toHaveProperty("worstMonth");
    expect(performanceMetrics.bestWorstPeriods).toHaveProperty("bestYear");
    expect(performanceMetrics.bestWorstPeriods).toHaveProperty("worstYear");
    expect(performanceMetrics).toHaveProperty("alpha");
    expect(performanceMetrics).toHaveProperty("winRate");
  });

  test("calculateBenchmarkComparisons should orchestrate all benchmark calculations", () => {
    const benchmarkComparisons = calculateBenchmarkComparisons(
      sampleReturnData,
      samplePriceData,
      sampleReturnData,
      sampleBenchmarkData,
      "daily",
    );

    expect(benchmarkComparisons).toHaveProperty("cumulativeOutperformance");
    expect(benchmarkComparisons).toHaveProperty("trackingError");
    expect(benchmarkComparisons).toHaveProperty("marketCapture");
    expect(benchmarkComparisons.marketCapture).toHaveProperty("upCapture");
    expect(benchmarkComparisons.marketCapture).toHaveProperty("downCapture");
    expect(benchmarkComparisons).toHaveProperty("informationRatio");
    expect(benchmarkComparisons).toHaveProperty("correlation");
    expect(benchmarkComparisons).toHaveProperty("yearlyComparison");
  });

  test("calculateAssetAllocation should orchestrate all allocation calculations", () => {
    const assetAllocation = calculateAssetAllocation(sampleAssets);

    expect(assetAllocation).toHaveProperty("byType");
    expect(Array.isArray(assetAllocation.byType)).toBe(true);
  });
});

describe("Edge Cases and Error Handling", () => {
  test("functions should handle empty data gracefully", async () => {
    const t = convexTest(schema);
    expect(calculateReturns([])).toEqual([]);
    expect(calculateVolatility([], "daily")).toBe(0);
    expect(calculateTotalReturn([])).toBe(0);
    expect(calculateBeta([], [])).toBe(0);
    expect(calculateCorrelation([], [])).toBe(0);
  });

  test("functions should handle single data point", async () => {
    const t = convexTest(schema);
    const singlePoint = [{ date: "2023-01-01", value: 1000 }];
    expect(calculateReturns(singlePoint)).toEqual([]);
    expect(calculateSimpleReturn(singlePoint)).toBe(0);
  });

  test("functions should handle zero values", async () => {
    const t = convexTest(schema);
    const zeroData: PriceDataPoint[] = [
      { date: "2023-01-01", value: 0 },
      { date: "2023-01-02", value: 100 },
    ];

    // Should not throw errors
    expect(() => calculateReturns(zeroData)).not.toThrow();
    expect(() => calculateSimpleReturn(zeroData)).not.toThrow();
  });

  test("weekly data source should use appropriate scaling", async () => {
    const t = convexTest(schema);
    const weeklyVolatility = calculateVolatility(sampleReturnData, "weekly");
    const dailyVolatility = calculateVolatility(sampleReturnData, "daily");

    // Weekly data should scale differently than daily
    expect(weeklyVolatility).not.toBe(dailyVolatility);
  });
});

describe("Integration Tests", () => {
  test("end-to-end analytics calculation should work", async () => {
    const t = convexTest(schema);
    // Simulate a complete analytics calculation
    const historicalData = samplePriceData;
    const transactions = sampleTransactions;
    const assets = sampleAssets;
    const benchmarkData = sampleBenchmarkData;
    const dataSource = "daily" as const;

    const returns = calculateReturns(historicalData, dataSource);
    const benchmarkReturns = calculateReturns(
      benchmarkData.map((d) => ({ date: d.date, value: d.close })),
      "daily",
    );

    const riskMetrics = calculateRiskMetrics(
      returns,
      historicalData,
      benchmarkReturns,
      assets,
      dataSource,
    );

    const performanceMetrics = calculatePerformanceMetrics(
      returns,
      historicalData,
      transactions,
      benchmarkReturns,
      dataSource,
      riskMetrics.beta,
    );

    const benchmarkComparisons = calculateBenchmarkComparisons(
      returns,
      historicalData,
      benchmarkReturns,
      benchmarkData,
      dataSource,
    );

    const assetAllocation = calculateAssetAllocation(assets);

    // Verify all metrics are calculated
    expect(riskMetrics).toBeDefined();
    expect(performanceMetrics).toBeDefined();
    expect(benchmarkComparisons).toBeDefined();
    expect(assetAllocation).toBeDefined();

    // Verify key values are reasonable
    expect(typeof riskMetrics.volatility).toBe("number");
    expect(typeof performanceMetrics.totalReturn).toBe("number");
    expect(typeof benchmarkComparisons.correlation).toBe("number");
    expect(Array.isArray(assetAllocation.byType)).toBe(true);
  });
});
