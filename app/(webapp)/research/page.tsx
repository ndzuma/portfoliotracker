"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BinocularsIcon, Search, TrendingUp, BarChart3 } from "lucide-react";

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-foreground mb-2">
              Research
            </h1>
            <p className="text-muted-foreground">
              In-depth analysis and research tools for smarter investments
            </p>
          </div>
          <div className="flex gap-2">
            <Input 
              placeholder="Search stocks, ETFs, crypto..." 
              className="w-64"
            />
            <Button>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Market Screener
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Find stocks based on your criteria
                </p>
                <Button variant="outline" className="w-full">
                  Launch Screener
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Technical Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Advanced charting and indicators
                </p>
                <Button variant="outline" className="w-full">
                  View Charts
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BinocularsIcon className="h-5 w-5 text-purple-500" />
                  Fundamental Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Financial statements and ratios
                </p>
                <Button variant="outline" className="w-full">
                  Explore Data
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Research Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BinocularsIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Research Tools Coming Soon</p>
                <p className="text-muted-foreground">
                  Advanced research capabilities are being developed
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}