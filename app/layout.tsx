import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { AuthenticatedWrapper } from "./auth-wrapper";
import { PostHogProvider } from "./PostHogProvider";

export const metadata: Metadata = {
  title: "PulsePortfolio App - Manage Your Investments",
  description:
    "Monitor stocks, crypto, real estate, and more with powerful tools for investors. Track multiple portfolios and get AI-powered insights to optimize your investments.",
  keywords:
    "portfolio tracker, investment management, stock tracker, crypto tracker, real estate investments, financial dashboard, multiple portfolios",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "PulsePortfolio App - Investment Dashboard",
    description:
      "Monitor your entire financial picture in one place with powerful analytics and AI insights.",
    images: ["/LoadingScreen.png"],
    url: "https://app.pulsefolio.net",
  },
  twitter: {
    card: "summary_large_image",
    title: "PulsePortfolio App - Investment Dashboard",
    description:
      "Monitor your entire financial picture in one place with powerful analytics and AI insights.",
    images: ["/LoadingScreen.png"],
    //creator: "@pulseportfolio",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <PostHogProvider>
          <ThemeProvider defaultTheme="system" storageKey="portfolio-theme">
            <ClerkProvider
              signInUrl="/sign-in"
              signUpUrl="/sign-up"
              signInForceRedirectUrl="/"
              signUpForceRedirectUrl="/onboarding"
            >
              <ConvexClientProvider>
                <Suspense fallback={<div>Loading...</div>}>
                  <AuthenticatedWrapper>{children}</AuthenticatedWrapper>
                </Suspense>
                <Toaster position="top-right" richColors />
              </ConvexClientProvider>
            </ClerkProvider>
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}