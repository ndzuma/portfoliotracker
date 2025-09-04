"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Newspaper, ExternalLink } from "lucide-react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

export function NewsCard({ item }: { item: NewsItem }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(item.datetime * 1000);
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Check if the summary is long enough to need expansion
  const isSummaryLong = item.summary.length > 100;
  const truncatedSummary = isSummaryLong
    ? `${item.summary.substring(0, 100)}...`
    : item.summary;

  return (
    <>
      <Card className="overflow-hidden h-full flex flex-col py-0">
        <div className="relative h-50 bg-muted">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.headline}
              fill
              className="object-cover"
              onError={(e) => {
                // Fallback for broken images
                e.currentTarget.src =
                  "https://via.placeholder.com/800x600/0D1117/30363D?text=News";
              }}
            />
          ) : (
            <div
              className="flex items-center justify-center h-full bg-muted"
              style={{
                backgroundImage:
                  "url(https://via.placeholder.com/800x600/0D1117/30363D?text=News)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            ></div>
          )}
          <div className="absolute top-2 left-2">
            <Badge
              variant="secondary"
              className="text-xs bg-background/80 backdrop-blur-sm"
            >
              {item.category || "News"}
            </Badge>
          </div>
          <div className="absolute top-2 right-2">
            <Badge
              variant="outline"
              className="text-xs bg-background/80 backdrop-blur-sm"
            >
              {item.source}
            </Badge>
          </div>
        </div>
        <CardHeader className="pb-2">
          <div className="flex items-center text-xs text-muted-foreground gap-1 mb-1">
            <Calendar className="h-3 w-3" />
            <span>
              {formattedDate} · {formattedTime}
            </span>
          </div>
          <CardTitle className="line-clamp-2 text-base">
            {item.headline}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground">
            {truncatedSummary}
            {isSummaryLong && (
              <Button
                variant="link"
                size="sm"
                className="px-1 h-auto text-primary"
                onClick={() => setExpanded(true)}
              >
                Read More
              </Button>
            )}
          </p>
        </CardContent>
        <div className="p-4 pt-0 mt-auto">
          <Button asChild variant="outline" size="sm" className="w-full">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center"
            >
              Read Full Article
              <ExternalLink className="ml-2 h-3 w-3" />
            </a>
          </Button>
        </div>
      </Card>

      {/* Expanded summary dialog */}
      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{item.headline}</DialogTitle>
            <div className="flex items-center text-xs text-muted-foreground gap-1 mt-2">
              <Badge variant="outline">{item.source}</Badge>
              <span className="ml-2">
                {formattedDate} · {formattedTime}
              </span>
            </div>
          </DialogHeader>
          <div className="mt-4 text-muted-foreground">{item.summary}</div>
          <div className="mt-6">
            <Button asChild className="w-full">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center"
              >
                Read Full Article
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
