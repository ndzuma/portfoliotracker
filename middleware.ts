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

  // Allow access to auth pages without authentication
  if (
    request.nextUrl.pathname.startsWith("/sign-in") ||
    request.nextUrl.pathname.startsWith("/sign-up")
  ) {
    return;
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
