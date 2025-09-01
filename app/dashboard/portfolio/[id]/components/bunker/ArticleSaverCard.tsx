"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table/index";
import { BookIcon, LinkIcon, PlusCircle } from "lucide-react";

interface ArticleSaverCardProps {
  title?: string;
}

export function ArticleSaverCard({
  title = "Research Articles",
}: ArticleSaverCardProps) {
  const [expanded, setExpanded] = useState(false);

  const articles = [
    {
      title: "Fed Signals Rate Cut Timeline for 2024",
      source: "bloomberg.com",
      date: "Mar 15",
    },
    {
      title: "Tech Sector Outlook Q2 2024",
      source: "morningstar.com",
      date: "Mar 10",
    },
    {
      title: "Global Markets: Emerging Trends",
      source: "ft.com",
      date: "Feb 28",
    },
  ];

  return (
    <>
      <Card className="p-6 h-full relative">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2">
            <BookIcon className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium text-foreground">{title}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4 flex-1">
            Save and organize research articles and news relevant to your
            investments.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(true)}
            className="mt-2 opacity-70 hover:opacity-100 transition-opacity self-start flex items-center"
          >
            Expand
          </Button>
        </div>
      </Card>

      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:min-w-2xl md:min-w-3xl lg:min-w-5xl">
          <DialogHeader>
            <DialogTitle>Research & Articles</DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Saved Articles</h3>
              <Button size="sm" variant="outline" className="gap-1">
                <PlusCircle className="h-4 w-4" /> Add New
              </Button>
            </div>

            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Article</TableHead>
                    <TableHead className="w-[100px]">Date</TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.title}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{article.title}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <LinkIcon className="h-3 w-3" />
                            {article.source}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{article.date}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground italic">
              <span className="font-semibold">Tip:</span> Save articles by
              clicking the "Add New" button and pasting the URL. The system will
              automatically extract the title and publication date.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
