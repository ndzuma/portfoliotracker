import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware((auth, request) => {
  // Allow access to demo routes without any Clerk intervention
  if (request.nextUrl.pathname.startsWith('/auth-demo')) {
    return;
  }
  
  // Allow access to auth pages without authentication
  if (request.nextUrl.pathname.startsWith('/sign-in') || 
      request.nextUrl.pathname.startsWith('/sign-up')) {
    return;
  }
  
  // For other routes, apply normal auth logic
  // (This will be handled by the auth wrapper)
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
