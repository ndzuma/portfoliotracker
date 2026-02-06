// analytics.simple.test.ts - Simple test to verify testing setup
import { convexTest } from "convex-test";
import { expect, test, describe } from "vitest";
import {
  calculateReturns,
  calculateTotalReturn,
  calculateVolatility,
  getEarliestDate,
  type PriceDataPoint,
} from "./analytics";

import schema from "./schema";

describe("Simple Analytics Tests", () => {
  test("calculateReturns works with basic data", async () => {
    const t = convexTest(schema);
    const priceData: PriceDataPoint[] = [
      { date: "2023-01-01", value: 1000 },
      { date: "2023-01-02", value: 1100 },
      { date: "2023-01-03", value: 1050 },
    ];

    const returns = calculateReturns(priceData);

    expect(returns).toHaveLength(2);
    expect(returns[0].returnValue).toBeCloseTo(0.1); // 10% gain
    expect(returns[1].returnValue).toBeCloseTo(-0.0454, 3); // ~4.5% loss
  });

  test("calculateTotalReturn calculates correctly", async () => {
    const t = convexTest(schema);
    const priceData: PriceDataPoint[] = [
      { date: "2023-01-01", value: 1000 },
      { date: "2023-01-05", value: 1200 },
    ];

    const totalReturn = calculateTotalReturn(priceData);
    expect(totalReturn).toBeCloseTo(0.2); // 20% total return
  });

  test("calculateVolatility handles empty data", async () => {
    const t = convexTest(schema);
    const volatility = calculateVolatility([], "daily");
    expect(volatility).toBe(0);
  });

  test("getEarliestDate finds earliest date", async () => {
    const t = convexTest(schema);
    const priceData: PriceDataPoint[] = [
      { date: "2023-01-05", value: 1000 },
      { date: "2023-01-01", value: 1100 },
      { date: "2023-01-03", value: 1050 },
    ];

    const earliest = getEarliestDate(priceData);
    expect(earliest).toEqual(new Date("2023-01-01"));
  });

  test("getEarliestDate handles empty array", async () => {
    const t = convexTest(schema);
    const earliest = getEarliestDate([]);
    expect(earliest).toBeNull();
  });
});
