"use client";

import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { useMemo } from "react";
import { api } from "@/convex/_generated/api";

/**
 * useFeatureFlag — checks whether a feature flag is enabled for the current user.
 *
 * Wraps `api.flags.getFlag` with auto-injected Clerk user email for targeting.
 *
 * @param key - The flag key to check (e.g. "watchlist", "earnings", "research")
 * @returns `undefined` while loading, `true` if enabled, `false` if disabled
 *
 * @example
 * const enabled = useFeatureFlag("watchlist");
 * if (enabled === undefined) return null; // loading
 * if (!enabled) { router.replace("/404"); return null; }
 * // render gated content
 */
export function useFeatureFlag(key: string): boolean | undefined {
  const { user, isLoaded } = useUser();

  const userEmail = useMemo(
    () => user?.emailAddresses?.[0]?.emailAddress ?? undefined,
    [user],
  );

  const result = useQuery(
    api.flags.getFlag,
    isLoaded ? { key, userEmail } : "skip",
  );

  // Still loading Clerk or Convex query
  if (!isLoaded || result === undefined) return undefined;

  return result;
}
