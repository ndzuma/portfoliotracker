/**
 * Utility functions for currency conversion and formatting
 */

/**
 * Format a number as currency with the appropriate symbol and formatting
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  const formatters: Record<string, Intl.NumberFormat> = {
    USD: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }),
    EUR: new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }),
    GBP: new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }),
    CAD: new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }),
    JPY: new Intl.NumberFormat("ja-JP", { style: "currency", currency: "JPY" }),
    AUD: new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }),
    CHF: new Intl.NumberFormat("de-CH", { style: "currency", currency: "CHF" }),
  };

  const formatter = formatters[currency] || formatters.USD;
  return formatter.format(amount);
}

/**
 * Get currency symbol for a given currency code
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    CAD: "C$",
    JPY: "¥",
    AUD: "A$",
    CHF: "CHF",
  };

  return symbols[currency] || currency;
}

/**
 * Get list of supported currencies with their full names
 */
export function getSupportedCurrencies(): Array<{ code: string; name: string; symbol: string }> {
  return [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$" },
    { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  ];
}

/**
 * Convert amount from USD to target currency using exchange rate
 */
export function convertFromUSD(amountUSD: number, targetCurrency: string, exchangeRate: number): number {
  if (targetCurrency === "USD" || exchangeRate === 0) {
    return amountUSD;
  }
  return amountUSD * exchangeRate;
}

/**
 * Convert amount from any currency to USD using exchange rate
 */
export function convertToUSD(amount: number, fromCurrency: string, exchangeRate: number): number {
  if (fromCurrency === "USD" || exchangeRate === 0) {
    return amount;
  }
  return amount / exchangeRate;
}