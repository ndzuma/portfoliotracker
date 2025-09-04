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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const benchmarkData = useQuery(api.marketData.getBenchmarkData) || [];
  
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch("/api/market-data/news");
        if (!response.ok) {
          throw new Error(`Failed to fetch news: ${response.statusText}`);
        }

        const data = await response.json();
        setNewsData(data.Data || []);
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const filteredNews =
    filter === "all"
      ? newsData
      : newsData.filter((item: NewsItem) => item.category === filter);

  // Pagination logic
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const currentItems = filteredNews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const categories = [
    "all",
    ...new Set(newsData.map((item: NewsItem) => item.category)),
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
                  onClick={() => {
                    setFilter(category);
                    setCurrentPage(1);
                  }}
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
          <MarketOverviewCard data={ benchmarkData } />
        </div>

        {/* News Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array(9)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="h-full">
                    <div className="relative h-40 bg-muted">
                      <Skeleton className="h-full w-full" />
                      <div className="absolute top-2 left-2">
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <div className="absolute top-2 right-2">
                        <Skeleton className="h-5 w-20" />
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-8 w-full mt-4" />
                    </div>
                  </div>
                ))
            : currentItems.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
        </div>

        {!loading && filteredNews.length === 0 && (
          <div className="text-center py-20">
            <Newspaper className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-medium mb-2">No news articles found</h3>
            <p className="text-muted-foreground">
              No articles available in this category. Try selecting a different
              filter.
            </p>
          </div>
        )}

        {/* Pagination */}
        {filteredNews.length > itemsPerPage && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.preventDefault();
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }}
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  // For many pages, show ellipsis
                  if (totalPages > 5) {
                    // Always show first and last page
                    if (i === 0) {
                      return (
                        <PaginationItem key={1}>
                          <PaginationLink
                            href="#"
                            onClick={(
                              e: React.MouseEvent<HTMLAnchorElement>,
                            ) => {
                              e.preventDefault();
                              handlePageChange(1);
                            }}
                            isActive={currentPage === 1}
                          >
                            1
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }

                    // Show ellipsis if needed
                    if (i === 1 && currentPage > 3) {
                      return (
                        <PaginationItem key="ellipsis-1">
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }

                    // Show current page and surrounding pages
                    let pageToShow: number;
                    if (currentPage <= 3) {
                      pageToShow = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageToShow = totalPages - (4 - i);
                    } else {
                      pageToShow = currentPage - 1 + i;
                    }

                    if (pageToShow > 1 && pageToShow < totalPages) {
                      return (
                        <PaginationItem key={pageToShow}>
                          <PaginationLink
                            href="#"
                            onClick={(
                              e: React.MouseEvent<HTMLAnchorElement>,
                            ) => {
                              e.preventDefault();
                              handlePageChange(pageToShow);
                            }}
                            isActive={currentPage === pageToShow}
                          >
                            {pageToShow}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }

                    // Show ellipsis if needed
                    if (i === 3 && currentPage < totalPages - 2) {
                      return (
                        <PaginationItem key="ellipsis-2">
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }

                    // Show last page
                    if (i === 4) {
                      return (
                        <PaginationItem key={totalPages}>
                          <PaginationLink
                            href="#"
                            onClick={(
                              e: React.MouseEvent<HTMLAnchorElement>,
                            ) => {
                              e.preventDefault();
                              handlePageChange(totalPages);
                            }}
                            isActive={currentPage === totalPages}
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }

                    return null;
                  } else {
                    // For fewer pages, show all page numbers
                    const page = i + 1;
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                            e.preventDefault();
                            handlePageChange(page);
                          }}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                      e.preventDefault();
                      if (currentPage < totalPages)
                        handlePageChange(currentPage + 1);
                    }}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
