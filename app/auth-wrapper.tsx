"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import type React from "react";
import { PortfolioSidebar } from "@/components/portfolio-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
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
          <SidebarProvider>
            <PortfolioSidebar />
            <SidebarInset>
              <header className="flex h-16 shrink-0 items-center gap-2 border-b">
                <div className="flex items-center gap-2 px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                  />
                  <h2 className="text-lg font-semibold">Portfolio Tracker</h2>
                </div>
              </header>
              <main className="flex-1 overflow-auto">{children}</main>
            </SidebarInset>
          </SidebarProvider>
        )}
      </Authenticated>
      <Unauthenticated>
        <RedirectToSignIn />
      </Unauthenticated>
    </>
  );
}
