import { cronJobs } from "convex/server";
import { api } from "./_generated/api";

const crons = cronJobs();

// Update historical market data every x
// This job will fetch historical data for existing assets
crons.interval(
  "update historical market data",
  { hours: 24 },
  api.marketData.updateHistoricalData,
);

// Update current market data every x
// This job will fetch latest prices for all tracked assets
crons.interval(
  "update current market prices",
  { hours: 2 }, 
  api.marketData.updateCurrentPrices,
);

export default crons;

// Update benchmark data every x
crons.interval(
  "update benchmark data",
  { minutes: 30 },
  api.marketData.updateBenchmarkData,
);