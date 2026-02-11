"use client";

import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookmarkSimple, Plus, MagnifyingGlass } from "@phosphor-icons/react";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";

export default function WatchlistPage() {
  const enabled = useFeatureFlag("watchlist");

  // Still loading — render nothing
  if (enabled === undefined) return null;

  // Flag disabled — trigger Next.js not-found boundary
  if (enabled === false) notFound();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-foreground mb-2">
              Watchlist
            </h1>
            <p className="text-muted-foreground">
              Track stocks and assets you're interested in
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Symbol
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookmarkSimple className="h-5 w-5" />
                Your Watchlist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BookmarkSimple className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  No watchlist items yet
                </p>
                <p className="text-muted-foreground mb-6">
                  Start tracking stocks, ETFs, and other assets you're
                  interested in
                </p>
                <Button variant="outline">
                  <MagnifyingGlass className="h-4 w-4 mr-2" />
                  Search Symbols
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
