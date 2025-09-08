"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Briefcase, TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";

export default function ThemeDemo() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header with theme toggle */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Portfolio Tracker</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Theme Demo</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Investment Dashboard</h2>
          <p className="text-muted-foreground">
            This demo showcases the light and dark theme functionality. 
            Use the toggle in the top-right corner to switch themes.
          </p>
        </div>

        {/* Portfolio cards grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">$45,231.89</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +20.1% from last month
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Daily Change</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">+$573.25</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +2.4%
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Holdings</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">47</div>
              <p className="text-xs text-muted-foreground">assets in portfolio</p>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-card-foreground">Performance</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">+12.5%</div>
              <p className="text-xs text-muted-foreground">yearly return</p>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio details card */}
        <Card className="border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-card-foreground">Recent Activity</CardTitle>
            <CardDescription className="text-muted-foreground">
              Your latest portfolio transactions and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <div>
                <p className="font-medium text-foreground">Purchased AAPL</p>
                <p className="text-sm text-muted-foreground">10 shares at $185.50</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">$1,855.00</p>
                <p className="text-sm text-muted-foreground">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <div>
                <p className="font-medium text-foreground">Sold MSFT</p>
                <p className="text-sm text-muted-foreground">5 shares at $412.30</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">$2,061.50</p>
                <p className="text-sm text-muted-foreground">1 day ago</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <div>
                <p className="font-medium text-foreground">Dividend received</p>
                <p className="text-sm text-muted-foreground">VXUS quarterly dividend</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-foreground">+$47.82</p>
                <p className="text-sm text-muted-foreground">3 days ago</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="mt-8 flex gap-4">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Add Investment
          </Button>
          <Button variant="outline" className="border-border hover:bg-accent">
            View Reports
          </Button>
          <Button variant="secondary" className="bg-secondary hover:bg-secondary/90">
            Export Data
          </Button>
        </div>
      </main>
    </div>
  );
}