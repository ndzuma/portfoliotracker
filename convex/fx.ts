/**
 * FX Conversion Utility — Pure functions, no Convex imports.
 *
 * All rates are EUR-based (from ExchangeRatesAPI).
 * To convert between any two currencies:
 *   amount_in_TARGET = amount_in_SOURCE × (EUR_TARGET / EUR_SOURCE)
 *
 * That's it. One line of math.
 */

/** The rates object shape stored in the fxRates table */
export type FxRates = Record<string, number>;

/**
 * Convert an amount from one currency to another using EUR-based rates.
 *
 * @param amount    - The value to convert
 * @param from      - Source currency code (e.g. "USD", "ZAR")
 * @param to        - Target currency code (e.g. "GBP", "EUR")
 * @param rates     - EUR-based rate map: { USD: 1.19, GBP: 0.87, ZAR: 18.94, ... }
 * @returns         - The converted amount, or the original amount if conversion isn't possible
 */
export function convert(
  amount: number,
  from: string,
  to: string,
  rates: FxRates,
): number {
  if (from === to || !from || !to) return amount;
  if (!amount || !isFinite(amount)) return amount;

  const fromRate = from === "EUR" ? 1 : rates[from];
  const toRate = to === "EUR" ? 1 : rates[to];

  // If we don't have a rate for either currency, return unconverted (graceful fallback)
  if (!fromRate || !toRate) return amount;

  return amount * (toRate / fromRate);
}

/**
 * Get the exchange rate from one currency to another.
 *
 * @returns The rate multiplier, or 1 if conversion isn't possible
 */
export function getRate(
  from: string,
  to: string,
  rates: FxRates,
): number {
  if (from === to || !from || !to) return 1;

  const fromRate = from === "EUR" ? 1 : rates[from];
  const toRate = to === "EUR" ? 1 : rates[to];

  if (!fromRate || !toRate) return 1;

  return toRate / fromRate;
}

/**
 * Resolve the effective currency for an asset.
 * Assets with an explicit `currency` field use that.
 * Otherwise, defaults to "USD" (Twelve Data returns USD prices for US equities).
 */
export function resolveAssetCurrency(assetCurrency: string | undefined): string {
  return assetCurrency?.toUpperCase() || "USD";
}
