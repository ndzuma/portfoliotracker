"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import type React from "react";
import { Sidebar } from "@/components/sidebar";
import { RedirectToSignIn } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

export function AuthenticatedWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isRedesignPage = pathname.startsWith("/redesign");
  const isOnboardingOrAuthPage = pathname.startsWith("/onboarding") || pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up") || isRedesignPage;
  const isAuthPage = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
  
  return (
    <>
      <Authenticated>
        {isOnboardingOrAuthPage ? (
          <main className="h-screen bg-background">{children}</main>
        ) : (
          <div className="flex h-screen bg-background">
            <Sidebar />
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        )}
      </Authenticated>
      <Unauthenticated>
        {isAuthPage ? (
          children
        ) : (
          <RedirectToSignIn redirectUrl="/sign-in" />
        )}
      </Unauthenticated>
    </>
  );
}
