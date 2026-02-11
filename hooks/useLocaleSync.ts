"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { routing } from "@/i18n/routing";

/**
 * Reads the NEXT_LOCALE cookie value from document.cookie.
 * Returns undefined if not found or not in a browser context.
 */
function getCookieLocale(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/);
  return match?.[1];
}

/**
 * Sets the NEXT_LOCALE cookie with a 1-year expiry.
 */
function setCookieLocale(locale: string) {
  if (typeof document === "undefined") return;
  document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
}

/**
 * useLocaleSync — keeps the NEXT_LOCALE cookie in sync with the user's
 * Convex `userPreferences.language` preference.
 *
 * - Convex is the source of truth for authenticated users
 * - The cookie is a sync cache so next-intl's server-side rendering works
 * - On sign-out, resets cookie to the default locale ("en")
 * - Guards against infinite reload loops
 *
 * Call this hook once in a component that renders inside the auth boundary
 * (e.g. AuthenticatedWrapper or layout).
 */
export function useLocaleSync() {
  const { user: clerkUser, isSignedIn, isLoaded: isClerkLoaded } = useUser();

  const convexUser = useQuery(
    api.users.getUserByClerkId,
    isSignedIn && clerkUser?.id ? { clerkId: clerkUser.id } : "skip",
  );

  const userId = convexUser?._id;

  const userPreferences = useQuery(
    api.users.getUserPreferences,
    userId ? { userId } : "skip",
  );

  // Track the previous sign-in state to detect sign-out transitions
  const wasSignedIn = useRef<boolean | null>(null);

  // Guard: prevent multiple reloads in the same session
  const hasReloaded = useRef(false);

  // ── Sign-out cleanup ──────────────────────────────────────────────
  useEffect(() => {
    if (!isClerkLoaded) return;

    // Detect sign-out transition: was signed in, now isn't
    if (wasSignedIn.current === true && !isSignedIn) {
      setCookieLocale(routing.defaultLocale);
      hasReloaded.current = false; // Reset for next session
    }

    wasSignedIn.current = isSignedIn ?? false;
  }, [isSignedIn, isClerkLoaded]);

  // ── Sync Convex preference → cookie ───────────────────────────────
  useEffect(() => {
    // Skip if Clerk hasn't loaded yet
    if (!isClerkLoaded) return;

    // Skip for unauthenticated users — middleware handles Accept-Language fallback
    if (!isSignedIn) return;

    // Skip if Convex data is still loading (preferences === undefined means query in flight)
    if (userPreferences === undefined) return;

    // Skip if we already triggered a reload this session
    if (hasReloaded.current) return;

    // Determine the user's preferred locale from Convex
    const preferredLocale = userPreferences?.language || routing.defaultLocale;

    // Validate against supported locales
    const validLocale = routing.locales.includes(preferredLocale as any)
      ? preferredLocale
      : routing.defaultLocale;

    // Compare with current cookie value
    const currentCookie = getCookieLocale();

    if (currentCookie !== validLocale) {
      // Update cookie and reload so server components re-render in the correct locale
      setCookieLocale(validLocale);
      hasReloaded.current = true;
      window.location.reload();
    }
  }, [isClerkLoaded, isSignedIn, userPreferences]);
}
