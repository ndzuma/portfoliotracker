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
import { Sparkles } from "lucide-react";

interface AISummaryCardProps {
  title: string;
  content: string;
  headline?: string;
}

export function AISummaryCard({
  title,
  content,
  headline,
}: AISummaryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisRemaining, setAnalysisRemaining] = useState(3);

  return (
    <>
      <Card className="p-6 bg-[radial-gradient(circle_at_top_left,_#8d745d_0%,_transparent_30%)] border-[#8d745d] h-full relative">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium text-foreground">{title}</h3>
          </div>
          {headline && (
            <p className="text-sm font-medium mb-2 text-primary">{headline}</p>
          )}
          <div
            className="text-sm text-muted-foreground leading-relaxed flex-1 overflow-hidden"
            style={{
              maxHeight: "40px",
              position: "relative",
              ...(expanded
                ? {}
                : {
                    WebkitMaskImage:
                      "linear-gradient(to bottom, black 60%, transparent 100%)",
                  }),
            }}
          >
            <p>{content}</p>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {headline && <p className="text-primary">{headline}</p>}
          </DialogHeader>
          <div className="mt-2 text-muted-foreground">{content}</div>
          <div className="flex flex-col items-center mt-2 -mb-6">
            <Button
              className="bg-gradient-to-r from-indigo-400/80 via-purple-400/80 to-pink-400/80 text-white hover:opacity-90 transition-opacity shadow-md hover:shadow-lg relative overflow-hidden group py-1.5 px-3"
              onClick={() => {
                if (analysisRemaining > 0) {
                  setIsAnalyzing(true);
                  setAnalysisRemaining((prev) => prev - 1);
                  // Simulate analysis completion after 2 seconds
                  setTimeout(() => setIsAnalyzing(false), 2000);
                }
              }}
              disabled={isAnalyzing || analysisRemaining <= 0}
            >
              {isAnalyzing ? (
                <>
                  <span className="animate-pulse">Analyzing Portfolio...</span>
                  <span className="absolute inset-0 bg-white/10 animate-pulse"></span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" strokeWidth={2} />
                  Force New Analysis
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              {analysisRemaining} analysis attempts remaining today
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground italic">
              <span className="font-semibold">AI Risk Warning:</span> This
              analysis is for informational purposes only and should not be
              considered financial advice. Always consult with a qualified
              financial advisor before making investment decisions.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
