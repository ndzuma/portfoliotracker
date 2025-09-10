import React from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export default function AuthDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider defaultTheme="system" storageKey="portfolio-theme">
          <div className="min-h-screen bg-background">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}