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
  const isOnboardingPage = pathname === "/onboarding";
  return (
    <>
      <Authenticated>
        {isOnboardingPage ? (
          <main className="h-screen bg-background">{children}</main>
        ) : (
          <div className="flex h-screen bg-background">
            <Sidebar />
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        )}
      </Authenticated>
      <Unauthenticated>
        <RedirectToSignIn />
      </Unauthenticated>
    </>
  );
}
