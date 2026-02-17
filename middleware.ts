import { clerkMiddleware, createRouteMatcher, auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api";
import { routing } from "./i18n/routing";

const isAdmin = createRouteMatcher(["/admin(.*)"]);
const isProRoute = createRouteMatcher([
  "/research(.*)",
  "/watchlist(.*)",
  "/earnings(.*)",
]);

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * Resolve the locale from the NEXT_LOCALE cookie, falling back to the
 * browser's Accept-Language header, then to the default locale.
 * Does NOT rewrite URLs — locale is cookie-only (source of truth is Convex).
 */
function resolveLocale(request: Request): string {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(/NEXT_LOCALE=([^;]+)/);
  if (match && routing.locales.includes(match[1] as any)) {
    return match[1];
  }

  // Parse Accept-Language header for a supported locale
  const acceptLang = request.headers.get("accept-language") || "";
  for (const part of acceptLang.split(",")) {
    const lang = part.split(";")[0].trim().toLowerCase();
    // Check exact match first (e.g. "pt"), then prefix (e.g. "pt-PT" → "pt")
    if (routing.locales.includes(lang as any)) return lang;
    const prefix = lang.split("-")[0];
    if (routing.locales.includes(prefix as any)) return prefix;
  }

  return routing.defaultLocale;
}

export default clerkMiddleware(async (auth, request) => {
  // ── Locale resolution (cookie-based, no URL rewrite) ──────────────
  const locale = resolveLocale(request);

  // Ensure the NEXT_LOCALE cookie is always set so next-intl's
  // getRequestConfig can read it on the server side.
  const response = NextResponse.next();
  const existingCookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (existingCookie !== locale) {
    response.cookies.set("NEXT_LOCALE", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
    });
  }

  // ── Admin route protection ────────────────────────────────────────
  if (isAdmin(request)) {
    const { userId } = await auth();

    // If not authenticated, let Clerk handle it
    if (!userId) {
      return response;
    }

    try {
      // Get user from Convex database to check admin status
      const user = await convex.query(api.users.getUserByClerkId, {
        clerkId: userId,
      });

      if (!user?.isAdmin) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    } catch (error) {
      return new NextResponse(null, { status: 404 });
    }
  }

  // ── Pro-only route protection ─────────────────────────────────────
  if (isProRoute(request)) {
    const { has, userId } = await auth();
    if (!userId) return response;
    const hasPro = has({ plan: "pro" });
    if (!hasPro) {
      return NextResponse.redirect(new URL("/?upgrade=true", request.url));
    }
  }

  // Allow access to auth pages without authentication
  if (
    request.nextUrl.pathname.startsWith("/sign-in") ||
    request.nextUrl.pathname.startsWith("/sign-up")
  ) {
    return response;
  }

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
