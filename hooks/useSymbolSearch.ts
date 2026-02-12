import { useState, useEffect, useRef } from "react";

// ─── Types ───────────────────────────────────────────────────────
export interface SymbolResult {
  symbol: string;
  name: string;
  currency: string;
  exchange: string;
  mic_code: string;
  country: string;
  type: string;
  category: string;
  figi_code: string;
  cfi_code: string;
}

interface SearchResponse {
  data: SymbolResult[];
  total: number;
  limit: number;
  offset: number;
}

interface UseSymbolSearchReturn {
  results: SymbolResult[];
  loading: boolean;
  error: string | null;
  total: number;
}

// ─── Asset type → API type param (1:1 mapping) ──────────────────
// Maps the app's internal asset types to the Market Data API's
// AssetCategory enum values passed as `type` query param.
const TYPE_MAP: Record<string, string> = {
  stock: "stock",
  crypto: "crypto",
  bond: "bond",
  commodity: "commodity",
  "real estate": "reit",
  cash: "currency",
};

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

// ─── Hook ────────────────────────────────────────────────────────
export function useSymbolSearch(
  query: string,
  assetType?: string,
  limit: number = 8,
): UseSymbolSearchReturn {
  const [results, setResults] = useState<SymbolResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // AbortController ref to cancel in-flight requests
  const abortRef = useRef<AbortController | null>(null);
  // Timer ref for debounce
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear previous debounce timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const trimmed = query.trim();

    // Reset if query too short
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setTotal(0);
      setLoading(false);
      setError(null);
      // Cancel any in-flight request
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
      return;
    }

    // Show loading immediately for responsiveness
    setLoading(true);

    // Debounce the actual fetch
    timerRef.current = setTimeout(async () => {
      // Abort previous request
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const params = new URLSearchParams({
          q: trimmed,
          limit: String(limit),
          offset: "0",
        });

        // Pass the type param for server-side filtering
        if (assetType && TYPE_MAP[assetType]) {
          params.set("type", TYPE_MAP[assetType]);
        }

        const response = await fetch(
          `/api/market-data/search?${params.toString()}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }

        const json: SearchResponse = await response.json();

        // Only update state if this request wasn't aborted
        if (!controller.signal.aborted) {
          setResults(json.data || []);
          setTotal(json.total || 0);
          setError(null);
          setLoading(false);
        }
      } catch (err: unknown) {
        // Ignore abort errors — they're intentional
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Search failed");
          setResults([]);
          setTotal(0);
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    // Cleanup on unmount or query change
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, [query, assetType, limit]);

  return { results, loading, error, total };
}
