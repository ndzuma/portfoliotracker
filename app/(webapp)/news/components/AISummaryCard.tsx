"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { parseMarkdown, cleanMarkdownWrapper } from "@/lib/markdown-parser";

interface AISummaryData {
  analysis: string;
  timestamp: string;
}

export function AISummaryCard({ data }: { data: AISummaryData }) {
  const [expanded, setExpanded] = useState(false);

  // Strip markdown code block wrapper if present
  const cleanAnalysis = cleanMarkdownWrapper(data.analysis);

  return (
    <>
      <Card className="p-6 bg-[radial-gradient(circle_at_top_left,_#8d745d_0%,_transparent_30%)] border-[#8d745d] h-full relative">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium text-foreground">
              Market Intelligence
            </h3>
          </div>
          <p className="text-sm font-medium mb-2 text-primary">
            Daily AI Market Summary
          </p>
          <div
            className="text-sm text-muted-foreground leading-relaxed flex-1 overflow-hidden"
            style={{
              maxHeight: "60px",
              position: "relative",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 60%, transparent 100%)",
            }}
          >
            <div className="w-full max-w-full">
              {parseMarkdown(cleanAnalysis)}
            </div>
          </div>
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
        <DialogContent className="max-h-[80vh] max-w-4xl md:min-w-xl lg:min-w-4xl">
          <DialogHeader>
            <DialogTitle>Market Intelligence</DialogTitle>
            <p className="text-primary mt-2">Daily AI Market Summary</p>
          </DialogHeader>
          <div className="mt-4 overflow-auto max-h-[60vh]">
            {parseMarkdown(cleanAnalysis)}
          </div>
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground italic">
              <span className="font-semibold">AI Risk Warning:</span> This
              AI-generated market summary is for informational purposes only and
              should not be considered financial advice. Always consult with a
              qualified financial advisor before making investment decisions.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
