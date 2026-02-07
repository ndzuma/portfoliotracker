"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import type React from "react";

import { RedirectToSignIn } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

export function AuthenticatedWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isOnboardingOrAuthPage =
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up");
  const isAuthPage =
    pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");

  return (
    <>
      <Authenticated>
        {isOnboardingOrAuthPage ? (
          <main className="h-screen bg-background">{children}</main>
        ) : (
          <main className="bg-background">{children}</main>
        )}
      </Authenticated>
      <Unauthenticated>
        {isAuthPage ? children : <RedirectToSignIn redirectUrl="/sign-in" />}
      </Unauthenticated>
    </>
  );
}
