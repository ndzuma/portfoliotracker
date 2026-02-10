/**
 * Client-side currency formatting utilities.
 *
 * NO conversion logic here — conversion happens server-side in Convex.
 * This file only handles display formatting via Intl.NumberFormat.
 */

/** Currency metadata for display purposes */
export interface CurrencyMeta {
  code: string;
  symbol: string;
  name: string;
  flag: string;
  decimals: number;
}

/**
 * Supported currencies with display metadata.
 * Ordered by global usage / likely user preference.
 */
export const CURRENCIES: CurrencyMeta[] = [
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸", decimals: 2 },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺", decimals: 2 },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧", decimals: 2 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵", decimals: 0 },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc", flag: "🇨🇭", decimals: 2 },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦", decimals: 2 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "🇦🇺", decimals: 2 },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", flag: "🇳🇿", decimals: 2 },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", flag: "🇨🇳", decimals: 2 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳", decimals: 2 },
  { code: "KRW", symbol: "₩", name: "South Korean Won", flag: "🇰🇷", decimals: 0 },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", flag: "🇸🇬", decimals: 2 },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", flag: "🇭🇰", decimals: 2 },
  { code: "SEK", symbol: "kr", name: "Swedish Krona", flag: "🇸🇪", decimals: 2 },
  { code: "NOK", symbol: "kr", name: "Norwegian Krone", flag: "🇳🇴", decimals: 2 },
  { code: "DKK", symbol: "kr", name: "Danish Krone", flag: "🇩🇰", decimals: 2 },
  { code: "PLN", symbol: "zł", name: "Polish Złoty", flag: "🇵🇱", decimals: 2 },
  { code: "ZAR", symbol: "R", name: "South African Rand", flag: "🇿🇦", decimals: 2 },
  { code: "BRL", symbol: "R$", name: "Brazilian Real", flag: "🇧🇷", decimals: 2 },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso", flag: "🇲🇽", decimals: 2 },
  { code: "TRY", symbol: "₺", name: "Turkish Lira", flag: "🇹🇷", decimals: 2 },
  { code: "RUB", symbol: "₽", name: "Russian Ruble", flag: "🇷🇺", decimals: 2 },
  { code: "THB", symbol: "฿", name: "Thai Baht", flag: "🇹🇭", decimals: 2 },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", flag: "🇮🇩", decimals: 0 },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", flag: "🇲🇾", decimals: 2 },
  { code: "PHP", symbol: "₱", name: "Philippine Peso", flag: "🇵🇭", decimals: 2 },
  { code: "TWD", symbol: "NT$", name: "Taiwan Dollar", flag: "🇹🇼", decimals: 0 },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", flag: "🇦🇪", decimals: 2 },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal", flag: "🇸🇦", decimals: 2 },
  { code: "ILS", symbol: "₪", name: "Israeli Shekel", flag: "🇮🇱", decimals: 2 },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira", flag: "🇳🇬", decimals: 2 },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling", flag: "🇰🇪", decimals: 2 },
  { code: "EGP", symbol: "E£", name: "Egyptian Pound", flag: "🇪🇬", decimals: 2 },
  { code: "CZK", symbol: "Kč", name: "Czech Koruna", flag: "🇨🇿", decimals: 2 },
  { code: "HUF", symbol: "Ft", name: "Hungarian Forint", flag: "🇭🇺", decimals: 0 },
  { code: "RON", symbol: "lei", name: "Romanian Leu", flag: "🇷🇴", decimals: 2 },
  { code: "CLP", symbol: "CL$", name: "Chilean Peso", flag: "🇨🇱", decimals: 0 },
  { code: "COP", symbol: "CO$", name: "Colombian Peso", flag: "🇨🇴", decimals: 0 },
  { code: "ARS", symbol: "AR$", name: "Argentine Peso", flag: "🇦🇷", decimals: 2 },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee", flag: "🇵🇰", decimals: 2 },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka", flag: "🇧🇩", decimals: 2 },
  { code: "VND", symbol: "₫", name: "Vietnamese Dong", flag: "🇻🇳", decimals: 0 },
];

// ─── Formatter cache (avoid re-creating Intl objects) ────────────────────────
const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(currency: string, compact = false): Intl.NumberFormat {
  const key = `${currency}-${compact ? "c" : "f"}`;
  let fmt = formatterCache.get(key);
  if (!fmt) {
    const meta = CURRENCIES.find((c) => c.code === currency);
    fmt = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: compact ? 0 : (meta?.decimals ?? 2),
      maximumFractionDigits: compact ? 1 : (meta?.decimals ?? 2),
      ...(compact ? { notation: "compact" } : {}),
    });
    formatterCache.set(key, fmt);
  }
  return fmt;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Format a monetary amount with full precision.
 *
 * @example formatMoney(1234.56, "GBP") → "£1,234.56"
 * @example formatMoney(1234.56, "JPY") → "¥1,235"
 */
export function formatMoney(amount: number, currency = "USD"): string {
  return getFormatter(currency).format(amount);
}

/**
 * Format a monetary amount in compact notation.
 *
 * @example formatCompact(1234567, "USD") → "$1.2M"
 * @example formatCompact(45000, "GBP")   → "£45K"
 */
export function formatCompact(amount: number, currency = "USD"): string {
  return getFormatter(currency, true).format(amount);
}

/**
 * Format a percentage with sign.
 *
 * @example formatPercent(12.345)  → "+12.35%"
 * @example formatPercent(-3.1)    → "-3.10%"
 */
export function formatPercent(value: number, decimals = 2): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Get the currency symbol for a given code.
 *
 * @example currencySymbol("GBP") → "£"
 * @example currencySymbol("ZAR") → "R"
 */
export function currencySymbol(code: string): string {
  const meta = CURRENCIES.find((c) => c.code === code);
  if (meta) return meta.symbol;
  // Fallback: use Intl to extract symbol
  try {
    const parts = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
    }).formatToParts(0);
    return parts.find((p) => p.type === "currency")?.value ?? code;
  } catch {
    return code;
  }
}

/**
 * Search currencies by code, name, or symbol.
 * Used by currency picker components.
 */
export function searchCurrencies(query: string): CurrencyMeta[] {
  if (!query) return CURRENCIES;
  const q = query.toLowerCase();
  return CURRENCIES.filter(
    (c) =>
      c.code.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.symbol.toLowerCase().includes(q),
  );
}
