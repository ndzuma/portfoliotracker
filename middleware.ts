import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api";

const isAdmin = createRouteMatcher(["/admin(.*)"]);

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default clerkMiddleware(async (auth, request) => {
  // Check for admin routes
  if (isAdmin(request)) {
    const { userId } = await auth();

    // If not authenticated, let Clerk handle it
    if (!userId) {
      return;
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
  // Allow access to demo routes without any Clerk intervention
  if (request.nextUrl.pathname.startsWith("/auth-demo")) {
    return;
  }

  // Allow access to auth pages without authentication
  if (
    request.nextUrl.pathname.startsWith("/sign-in") ||
    request.nextUrl.pathname.startsWith("/sign-up")
  ) {
    return;
  }

  // Check for v2 route access
  if (request.nextUrl.pathname.startsWith("/v2")) {
    const { userId } = await auth();

    // If not authenticated, let Clerk handle it
    if (!userId) {
      return;
    }

    try {
      // Check user's UI version preference
      const response = await fetch(
        `${request.nextUrl.origin}/api/check-ui-version`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        },
      );

      if (response.ok) {
        const { uiVersion, earlyAccess } = await response.json();

        // If user doesn't have v2 access, redirect to v1 equivalent
        if (uiVersion !== "v2" || !earlyAccess) {
          const v1Path = request.nextUrl.pathname.replace("/v2", "");
          const redirectUrl = new URL(v1Path || "/", request.url);
          return NextResponse.redirect(redirectUrl);
        }
      }
    } catch (error) {
      // On error, redirect to v1 (safe fallback)
      const v1Path = request.nextUrl.pathname.replace("/v2", "");
      const redirectUrl = new URL(v1Path || "/", request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // For other routes, apply normal auth logic
  // (This will be handled by the auth wrapper)
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
