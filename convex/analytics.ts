// analytics.ts - Pure calculation functions for portfolio analytics
// These functions are extracted from portfolios.ts for better testability and organization

import { GenericId } from "./_generated/dataModel";

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface PriceDataPoint {
  date: string;
  value: number;
}

export interface ReturnDataPoint {
  date: any;
  returnValue: number;
}

export interface Transaction {
  assetId: string;
  type: "buy" | "sell" | "dividend";
  date: number; // timestamp
  quantity?: number;
  price?: number;
  fees?: number;
}

export interface Asset {
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
  transactions?: Transaction[];
}

export interface BenchmarkData {
  _id: GenericId<"marketHistoricData">;
  _creationTime: number;
  date: string;
  ticker: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type DataSourceType = "daily" | "weekly";

export interface RiskMetrics {
  volatility: number;
  maxDrawdown: number;
  beta: number;
  valueAtRisk: {
    daily: number;
    monthly: number;
  };
  sharpeRatio: number;
  downsideDeviation: number;
  assetDiversification: Array<{
    type: string;
    percentage: number;
  }>;
}

export interface PerformanceMetrics {
  totalReturn: number;
  timeWeightedReturn: number;
  annualizedReturn: number;
  monthlyReturns: Array<{
    month: string;
    return: number;
  }>;
  ytdReturn: number;
  rollingReturns: Record<string, number>;
  bestWorstPeriods: {
    bestMonth: any;
    worstMonth: any;
    bestYear: any;
    worstYear: any;
  };
  alpha: number;
  winRate: number;
}

export interface BenchmarkComparisons {
  cumulativeOutperformance: number;
  trackingError: number;
  marketCapture: {
    upCapture: number;
    downCapture: number;
  };
  informationRatio: number;
  correlation: number;
  yearlyComparison: Array<{
    year: string;
    portfolioReturn: number;
    benchmarkReturn: number;
    outperformance: number;
  }>;
}

export interface AssetAllocation {
  byType: Array<{
    type: string;
    percentage: number;
  }>;
}

// ============================================================================
// Data Processing & Utility Functions
// ============================================================================

export function calculateReturns(
  priceData: PriceDataPoint[],
  dataSource: DataSourceType = "daily",
): ReturnDataPoint[] {
  // Convert price/value series to returns
  const returns: ReturnDataPoint[] = [];
  for (let i = 1; i < priceData.length; i++) {
    const prev = priceData[i - 1];
    const curr = priceData[i];
    const returnValue = (curr.value - prev.value) / prev.value;
    returns.push({ date: curr.date, returnValue });
  }
  return returns;
}

export function getEarliestDate(dates: PriceDataPoint[]): Date | null {
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

export function aggregateReturns(
  returns: ReturnDataPoint[],
  periods: number,
): ReturnDataPoint[] {
  const aggregated: ReturnDataPoint[] = [];

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

export function roundToDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function interpolateValue(
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

export function calculateSimpleReturn(
  historicalData: PriceDataPoint[],
): number {
  if (historicalData.length < 2) return 0;

  const startValue = historicalData[0].value;
  const endValue = historicalData[historicalData.length - 1].value;

  // Avoid division by zero
  return startValue > 0 ? (endValue - startValue) / startValue : 0;
}

// ============================================================================
// Risk Metrics Functions
// ============================================================================

export function calculateVolatility(
  returns: ReturnDataPoint[],
  dataSource: DataSourceType = "daily",
): number {
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

export function calculateMaxDrawdown(historicalData: PriceDataPoint[]): number {
  if (historicalData.length === 0) return 0;
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

export function calculateBeta(
  returns: ReturnDataPoint[],
  benchmarkReturns: ReturnDataPoint[],
): number {
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

export function calculateVaR(
  returns: ReturnDataPoint[],
  confidenceLevel: number,
): number {
  if (returns.length === 0) return 0;
  const sortedReturns = returns.map((r) => r.returnValue).sort((a, b) => a - b);
  const index = Math.floor((1 - confidenceLevel) * sortedReturns.length);
  return Math.abs(sortedReturns[index]);
}

export function calculateSharpeRatio(
  returns: ReturnDataPoint[],
  riskFreeRate: number,
  dataSource: DataSourceType = "daily",
): number {
  const n = returns.length;
  if (n === 0) return 0;
  const meanReturn = returns.reduce((sum, r) => sum + r.returnValue, 0) / n;
  const periodsPerYear = dataSource === "weekly" ? 52 : 252;
  const stdDev =
    calculateVolatility(returns, dataSource) / Math.sqrt(periodsPerYear);
  const excessReturn = meanReturn - riskFreeRate;
  return stdDev === 0 ? 0 : (excessReturn / stdDev) * Math.sqrt(periodsPerYear);
}

export function calculateDownsideDeviation(returns: ReturnDataPoint[]): number {
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

export function getRiskFreeRate(): number {
  // Placeholder: return a fixed risk-free rate (e.g., 3% annualized)
  return 0.03 / 252; // Daily risk-free rate
}

// ============================================================================
// Performance Metrics Functions
// ============================================================================

export function calculateTotalReturn(historicalData: PriceDataPoint[]): number {
  if (historicalData.length < 2) return 0;
  const startValue = historicalData[0].value;
  const endValue = historicalData[historicalData.length - 1].value;
  return (endValue - startValue) / startValue;
}

export function calculateTimeWeightedReturn(
  historicalData: PriceDataPoint[],
  transactions: Transaction[],
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

export function calculateAnnualizedReturn(
  historicalData: PriceDataPoint[],
  dataSource: DataSourceType = "daily",
): number {
  if (historicalData.length < 2) return 0;
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

export function calculateRollingReturns(
  historicalData: PriceDataPoint[],
  dataSource: DataSourceType = "daily",
): Record<string, number> {
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

export function calculateMonthlyReturns(
  historicalData: PriceDataPoint[],
  dataSource: DataSourceType = "daily",
): Array<{ month: string; return: number }> {
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

export function calculateYTDReturn(historicalData: PriceDataPoint[]): number {
  if (historicalData.length < 2) return 0;
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

export function findBestPeriod(returns: ReturnDataPoint[], periods: number) {
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

export function findWorstPeriod(returns: ReturnDataPoint[], periods: number) {
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

export function calculateAlpha(
  returns: ReturnDataPoint[],
  benchmarkReturns: ReturnDataPoint[],
  beta: number,
): number {
  if (returns.length === 0 || benchmarkReturns.length === 0) return 0;
  const n = Math.min(returns.length, benchmarkReturns.length);
  const meanR = returns.reduce((sum, r) => sum + r.returnValue, 0) / n;
  const meanB = benchmarkReturns.reduce((sum, r) => sum + r.returnValue, 0) / n;
  return meanR - beta * meanB;
}

export function calculateWinRate(returns: ReturnDataPoint[]): number {
  if (returns.length === 0) return 0;
  const wins = returns.filter((r) => r.returnValue > 0).length;
  return (wins / returns.length) * 100;
}

// ============================================================================
// Benchmark Comparison Functions
// ============================================================================

export function calculateCumulativeOutperformance(
  historicalData: PriceDataPoint[],
  benchmarkData: BenchmarkData[],
): number {
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

export function calculateTrackingError(
  returns: ReturnDataPoint[],
  benchmarkReturns: ReturnDataPoint[],
): number {
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

export function calculateUpMarketCapture(
  returns: ReturnDataPoint[],
  benchmarkReturns: ReturnDataPoint[],
): number {
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

export function calculateDownMarketCapture(
  returns: ReturnDataPoint[],
  benchmarkReturns: ReturnDataPoint[],
): number {
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

export function calculateInformationRatio(
  returns: ReturnDataPoint[],
  benchmarkReturns: ReturnDataPoint[],
  trackingError: number,
): number {
  if (returns.length === 0 || benchmarkReturns.length === 0) return 0;
  const n = Math.min(returns.length, benchmarkReturns.length);
  const excessReturns = [];
  for (let i = 0; i < n; i++) {
    excessReturns.push(
      returns[i].returnValue - benchmarkReturns[i].returnValue,
    );
  }
  const meanExcessReturn = excessReturns.reduce((sum, r) => sum + r, 0) / n;
  return trackingError === 0
    ? 0
    : (meanExcessReturn * Math.sqrt(252)) / trackingError; // Annualized Information Ratio
}

export function calculateCorrelation(
  returns: ReturnDataPoint[],
  benchmarkReturns: ReturnDataPoint[],
): number {
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

export function calculateYearlyComparison(
  historicalData: PriceDataPoint[],
  benchmarkData: BenchmarkData[],
  dataSource: DataSourceType = "daily",
): Array<{
  year: string;
  portfolioReturn: number;
  benchmarkReturn: number;
  outperformance: number;
}> {
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

// ============================================================================
// Asset Allocation Functions
// ============================================================================

export function calculateAssetDiversification(assets: Asset[]): Array<{
  type: string;
  percentage: number;
}> {
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

export function calculateAllocationByType(assets: Asset[]): Array<{
  type: string;
  percentage: number;
}> {
  const typeValues: Record<string, number> = {};
  let totalValue = 0;

  for (const asset of assets) {
    let quantity = 0;
    for (const txn of asset.transactions || []) {
      if (txn.type === "buy") {
        quantity += txn.quantity || 0;
      } else if (txn.type === "sell") {
        quantity -= txn.quantity || 0;
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

export function countAssetTypes(assets: Asset[]): Record<string, number> {
  const typeCounts: Record<string, number> = {};
  for (const asset of assets) {
    typeCounts[asset.type] = (typeCounts[asset.type] || 0) + 1;
  }
  return typeCounts;
}

// ============================================================================
// High-Level Orchestration Functions
// ============================================================================

export function calculateRiskMetrics(
  returns: ReturnDataPoint[],
  historicalData: PriceDataPoint[],
  benchmarkReturns: ReturnDataPoint[],
  assets: Asset[],
  dataSource: DataSourceType,
): RiskMetrics {
  return {
    volatility: calculateVolatility(returns, dataSource),
    maxDrawdown:
      historicalData.length > 0 ? calculateMaxDrawdown(historicalData) : 0,
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
}

export function calculatePerformanceMetrics(
  returns: ReturnDataPoint[],
  historicalData: PriceDataPoint[],
  transactions: Transaction[],
  benchmarkReturns: ReturnDataPoint[],
  dataSource: DataSourceType,
  beta: number,
): PerformanceMetrics {
  return {
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
    alpha: calculateAlpha(returns, benchmarkReturns, beta),
    winRate: calculateWinRate(returns),
  };
}

export function calculateBenchmarkComparisons(
  returns: ReturnDataPoint[],
  historicalData: PriceDataPoint[],
  benchmarkReturns: ReturnDataPoint[],
  benchmarkData: BenchmarkData[],
  dataSource: DataSourceType,
): BenchmarkComparisons {
  const trackingError = calculateTrackingError(returns, benchmarkReturns);

  return {
    cumulativeOutperformance: calculateCumulativeOutperformance(
      historicalData,
      benchmarkData,
    ),
    trackingError,
    marketCapture: {
      upCapture: calculateUpMarketCapture(returns, benchmarkReturns),
      downCapture: calculateDownMarketCapture(returns, benchmarkReturns),
    },
    informationRatio: calculateInformationRatio(
      returns,
      benchmarkReturns,
      trackingError,
    ),
    correlation: calculateCorrelation(returns, benchmarkReturns),
    yearlyComparison: calculateYearlyComparison(
      historicalData,
      benchmarkData,
      dataSource,
    ),
  };
}

export function calculateAssetAllocation(assets: Asset[]): AssetAllocation {
  return {
    byType: calculateAllocationByType(assets),
  };
}
