"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import type React from "react";
import { Sidebar } from "@/components/sidebar";
import { RedirectToSignIn } from "@clerk/nextjs";

export function AuthenticatedWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Authenticated>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </Authenticated>
      <Unauthenticated>
        <RedirectToSignIn />
      </Unauthenticated>
    </>
  );
}
