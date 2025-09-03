"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Newspaper, Filter, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@clerk/nextjs";
import { NewsCard } from "./components/NewsCard";
import { AISummaryCard } from "./components/AISummaryCard";
import { MarketOverviewCard } from "./components/MarketOverviewCard";
import { NewsLoadingSkeleton } from "./components/NewsLoadingSkeleton";

interface NewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  source: string;
  summary: string;
  url: string;
}

interface NewsData {
  Data: NewsItem[];
}


export default function NewsPage() {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const { user } = useUser();

  useEffect(() => {
    // Simulate API call - replace with your actual API
    const fetchNews = async () => {
      try {
        // In production, replace this with your actual API call
        // const response = await fetch("/api/news");
        // const data = await response.json();

        // Sample data based on your provided format
        const sampleData: NewsData = {
          Data: [
            {
              category: "top news",
              datetime: 1756838460,
              headline:
                "Why the Fed may soon stop pulling money out of the financial system",
              id: 7511691,
              image:
                "https://static2.finnhub.io/file/publicdatany/finnhubimage/market_watch_logo.png",
              source: "MarketWatch",
              summary:
                "The Federal Reserve might need to suspend the process of shrinking its balance sheet if liquidity drains too quickly from markets.",
              url: "https://www.marketwatch.com/story/why-the-fed-may-soon-stop-pulling-money-out-of-the-financial-system-464c559b",
            },
            {
              category: "technology",
              datetime: 1756828460,
              headline:
                "Apple unveils new AI features coming to iPhone and iPad",
              id: 7511692,
              image:
                "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=1000",
              source: "CNBC",
              summary:
                "Apple has announced several new AI-powered features for iOS, including smarter Siri capabilities and enhanced photo editing tools.",
              url: "https://example.com/apple-ai-features",
            },
            {
              category: "markets",
              datetime: 1756818460,
              headline:
                "S&P 500 reaches new all-time high as tech stocks surge",
              id: 7511693,
              image:
                "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1000",
              source: "Bloomberg",
              summary:
                "The S&P 500 index hit a new record high today, driven by strong performance in tech stocks and positive economic data.",
              url: "https://example.com/sp500-record",
            },
            {
              category: "crypto",
              datetime: 1756808460,
              headline:
                "Bitcoin volatility increases as regulatory concerns grow",
              id: 7511694,
              image:
                "https://images.unsplash.com/photo-1621501103258-d524eb321258?q=80&w=1000",
              source: "CoinDesk",
              summary:
                "Bitcoin prices have seen increased volatility this week as investors respond to potential new cryptocurrency regulations being discussed by policymakers.",
              url: "https://example.com/bitcoin-volatility",
            },
            {
              category: "earnings",
              datetime: 1756798460,
              headline: "Tesla Q2 earnings beat expectations, margins improve",
              id: 7511695,
              image:
                "https://images.unsplash.com/photo-1621330396173-e41b1cafd17f?q=80&w=1000",
              source: "Reuters",
              summary:
                "Tesla reported better than expected second-quarter earnings, with improved margins and strong vehicle deliveries despite economic headwinds.",
              url: "https://example.com/tesla-earnings",
            },
            {
              category: "economy",
              datetime: 1756788460,
              headline:
                "Job market remains resilient despite inflation concerns",
              id: 7511696,
              image:
                "https://images.unsplash.com/photo-1521791055366-0d553872125f?q=80&w=1000",
              source: "Financial Times",
              summary:
                "The latest employment report shows job growth continuing at a steady pace, suggesting economic resilience despite ongoing inflation pressures.",
              url: "https://example.com/job-market",
            },
          ],
        };

        setNewsData(sampleData.Data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching news:", error);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const filteredNews =
    filter === "all"
      ? newsData
      : newsData.filter((item) => item.category === filter);

  const categories = ["all", ...new Set(newsData.map((item) => item.category))];

  if (loading) {
    return <NewsLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-foreground">
            News & Market Insights
          </h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Filter: {filter === "all" ? "All Categories" : filter}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category}
                  onClick={() => setFilter(category)}
                  className="capitalize"
                >
                  {category === "all" ? "All Categories" : category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* AI Summary and Market Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <AISummaryCard />
          </div>
          <MarketOverviewCard />
        </div>

        {/* News Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>

        {filteredNews.length === 0 && (
          <div className="text-center py-20">
            <Newspaper className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-medium mb-2">No news articles found</h3>
            <p className="text-muted-foreground">
              No articles available in this category. Try selecting a different
              filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
