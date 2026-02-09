"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { V2Header } from "@/components/header";
import { V2AICard } from "@/components/ai-card";
import { V2MovingTicker } from "@/components/moving-ticker";
import { V2HeroSplit } from "@/components/hero-split";
import { parseMarkdown } from "@/lib/markdown-parser";
import {
  Funnel,
  CaretDown,
  ArrowSquareOut,
  Newspaper,
} from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export default function V2NewsPage() {
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 12;

  const aiSummaryData = useQuery(api.ai.getAiNewsSummary) || {};
  const benchmarkData = useQuery(api.marketData.getBenchmarkData) || [];

  useEffect(() => {
    fetch("/api/market-data/news")
      .then((r) => r.json())
      .then((d) => setNewsData(d.Data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "all" ? newsData : newsData.filter((n) => n.category === filter);
  const totalPages = Math.ceil(filtered.length / perPage);
  const current = filtered.slice((page - 1) * perPage, page * perPage);
  const categories = ["all", ...new Set(newsData.map((n) => n.category))];
  const cleanAnalysis = parseMarkdown(
    aiSummaryData?.analysis || "Analyzing...",
  );
  const aiHeadline = parseMarkdown(aiSummaryData?.headline);
  const aiTimestamp = aiSummaryData?.timestamp;

  // Derive the most recent article timestamp for the masthead
  const latestArticleTime =
    newsData.length > 0
      ? new Date(
          Math.max(...newsData.map((n) => n.datetime)) * 1000,
        ).toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;

  return (
    <div className="min-h-screen" style={{ background: "#09090b" }}>
      <V2Header />

      {/* Moving Ticker — infinite marquee replacing static V2Ticker */}
      <V2MovingTicker benchmarks={benchmarkData} speed={35} />

      {/* Hero Split — editorial masthead (left) + AI card (right) */}
      <V2HeroSplit
        leftContent={
          <div className="flex flex-col justify-center h-full">
            {/* Live indicator + last update */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-500 font-semibold uppercase tracking-[0.2em]">
                  Live Feed
                </span>
              </div>
              {latestArticleTime && (
                <>
                  <div
                    className="w-px h-3"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  />
                  <span className="text-[10px] text-zinc-600 font-medium tracking-wide">
                    Updated {latestArticleTime}
                  </span>
                </>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl lg:text-[56px] font-bold text-white tracking-tighter leading-[0.95] mb-4">
              News &<br />
              Insights
            </h1>

            {/* Subtitle */}
            <p className="text-sm text-zinc-500 leading-relaxed max-w-md">
              Real-time market intelligence aggregated from trusted sources,
              enriched with AI-powered analysis.
            </p>
          </div>
        }
        rightContent={
          <V2AICard
            headline={aiHeadline}
            analysis={cleanAnalysis}
            timestamp={aiTimestamp}
            maxDisplayLength={120}
          />
        }
      />

      <div className="max-w-[1600px] mx-auto px-8 py-8">
        {/* Filter */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-zinc-500 tabular-nums">
            {filtered.length} article{filtered.length !== 1 ? "s" : ""}
            {filter !== "all" && (
              <span className="text-zinc-600">
                {" "}
                in <span className="text-zinc-400 capitalize">{filter}</span>
              </span>
            )}
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 rounded-lg border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                <Funnel className="h-3.5 w-3.5" />
                {filter === "all" ? "All" : filter}
                <CaretDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-zinc-950 border-white/[0.06]"
            >
              {categories.map((c) => (
                <DropdownMenuItem
                  key={c}
                  onClick={() => {
                    setFilter(c);
                    setPage(1);
                  }}
                  className="capitalize text-zinc-300 focus:text-white focus:bg-white/[0.06]"
                >
                  {c === "all" ? "All Categories" : c}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* News Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/[0.06] bg-zinc-950/60 overflow-hidden animate-pulse"
              >
                <div className="h-40 bg-white/[0.04]" />
                <div className="p-5 flex flex-col gap-2">
                  <div className="h-3 bg-white/[0.04] rounded w-20" />
                  <div className="h-4 bg-white/[0.04] rounded w-full" />
                  <div className="h-3 bg-white/[0.04] rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : current.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {current.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl border border-white/[0.06] bg-zinc-950/60 overflow-hidden hover:border-white/[0.12] transition-all"
              >
                {item.image && (
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={item.image}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent opacity-60" />
                    <span className="absolute top-3 left-3 text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white backdrop-blur-sm">
                      {item.category}
                    </span>
                  </div>
                )}
                <div className="p-5">
                  <p className="text-xs text-zinc-600 mb-2">
                    {item.source} &middot;{" "}
                    {new Date(item.datetime * 1000).toLocaleDateString()}
                  </p>
                  <h3 className="text-sm font-semibold text-white leading-snug mb-2 line-clamp-2 group-hover:text-zinc-200 transition-colors">
                    {item.headline}
                  </h3>
                  <p className="text-xs text-zinc-600 line-clamp-2">
                    {item.summary}
                  </p>
                  <div className="flex items-center gap-1 mt-3 text-[11px] text-zinc-600 group-hover:text-zinc-400 transition-colors">
                    Read <ArrowSquareOut className="h-3 w-3" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Newspaper className="mx-auto h-10 w-10 text-zinc-700 mb-4" />
            <p className="text-zinc-600 text-sm">No articles found.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            {Array.from(
              { length: Math.min(totalPages, 7) },
              (_, i) => i + 1,
            ).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPage(p);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`w-8 h-8 rounded-md text-xs font-medium transition-colors ${
                  page === p
                    ? "bg-white text-black"
                    : "text-zinc-500 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
