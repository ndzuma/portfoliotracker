import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Portfolio Manager",
  description: "Professional portfolio management dashboard",
  generator: "v0.app",
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
          <ConvexClientProvider>
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
            <Toaster position="top-right" richColors />
          </ConvexClientProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
