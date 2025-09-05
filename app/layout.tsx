import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { AuthenticatedWrapper } from "./auth-wrapper";

export const metadata: Metadata = {
  title: "Pulseportfolio",
  description: "Track and manage your investments with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider defaultTheme="system" storageKey="portfolio-theme">
          <ClerkProvider>
            <ConvexClientProvider>
              <Suspense fallback={<div>Loading...</div>}>
                <AuthenticatedWrapper>{children}</AuthenticatedWrapper>;
              </Suspense>
              <Toaster position="top-right" richColors />
            </ConvexClientProvider>
          </ClerkProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
