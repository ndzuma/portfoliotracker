"use client";

import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { useCallback, useMemo } from "react";
import { api } from "@/convex/_generated/api";
import {
  formatMoney,
  formatCompact,
  formatPercent,
  currencySymbol,
  buildCurrencyList,
  CURRENCIES,
  type CurrencyMeta,
} from "@/lib/currency";

/**
 * useCurrency — reads the user's base currency from Convex preferences
 * and returns formatting functions. No conversion logic (that's server-side).
 *
 * @example
 * const { format, compact, symbol, currency } = useCurrency();
 * <span>{format(1234.56)}</span>  // → "£1,234.56" (if user's base is GBP)
 * <span>{compact(1200000)}</span> // → "£1.2M"
 */
export function useCurrency() {
  const { user } = useUser();

  const convexUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id || "",
  });

  const userId = convexUser?._id;

  const userPreferences = useQuery(
    api.users.getUserPreferences,
    userId ? { userId } : "skip",
  );

  const currency = userPreferences?.currency || "USD";
  const loading = userPreferences === undefined && !!userId;

  const format = useCallback(
    (amount: number) => formatMoney(amount, currency),
    [currency],
  );

  const compact = useCallback(
    (amount: number) => formatCompact(amount, currency),
    [currency],
  );

  const percent = useCallback(
    (value: number, decimals?: number) => formatPercent(value, decimals),
    [],
  );

  const symbol = useMemo(() => currencySymbol(currency), [currency]);

  return {
    /** The user's base currency code, e.g. "GBP", "USD", "ZAR" */
    currency,
    /** Format a full-precision monetary value: format(1234.56) → "£1,234.56" */
    format,
    /** Format a compact monetary value: compact(1200000) → "£1.2M" */
    compact,
    /** Format a percentage with sign: percent(12.3) → "+12.30%" */
    percent,
    /** The currency symbol, e.g. "£", "$", "R" */
    symbol,
    /** True while preferences are still loading */
    loading,
  } as const;
}

/**
 * useAvailableCurrencies — fetches all currency codes available from the
 * backend fxRates table and merges them with the enriched hardcoded metadata.
 *
 * Returns 160+ currencies when backend data is available, falling back to
 * the 42-currency hardcoded list while loading or when no FX data exists.
 *
 * @example
 * const { currencies, loading } = useAvailableCurrencies();
 * // currencies = [{ code: "USD", symbol: "$", name: "US Dollar", ... }, ...]
 */
export function useAvailableCurrencies(): {
  currencies: CurrencyMeta[];
  loading: boolean;
} {
  const backendCodes = useQuery(api.marketData.getAvailableCurrencies);

  const currencies = useMemo(() => {
    if (!backendCodes || backendCodes.length === 0) return CURRENCIES;
    return buildCurrencyList(backendCodes);
  }, [backendCodes]);

  return {
    /** Full merged currency list — enriched entries first, then auto-generated */
    currencies,
    /** True while the backend query is still in flight */
    loading: backendCodes === undefined,
  };
}
