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
import { FileDown } from "lucide-react";

interface TemplatesCardProps {
  title?: string;
}

export function TemplatesCard({ title = "Templates" }: TemplatesCardProps) {
  const [expanded, setExpanded] = useState(false);

  const templates = [
    {
      name: "Investment Tracking Spreadsheet",
      description: "Track purchases, sales, dividends, and performance.",
    },
    {
      name: "Tax Lot Optimizer",
      description: "Optimize tax lots for selling positions.",
    },
    {
      name: "Retirement Calculator",
      description: "Calculate retirement savings needs and projections.",
    },
    {
      name: "Portfolio Rebalancing Tool",
      description: "Calculate optimal rebalancing for your target allocation.",
    },
  ];

  return (
    <>
      <Card className="p-6 h-full relative">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2">
            <FileDown className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium text-foreground">{title}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4 flex-1">
            Download useful templates for tracking and analyzing your
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
            <DialogTitle>Investment Templates</DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {templates.map((template) => (
                <div
                  key={template.name}
                  className="border rounded-md p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-sm font-medium">{template.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {template.description}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    <FileDown className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground italic">
              <span className="font-semibold">Note:</span> These templates are
              for personal use only and should not be distributed. Make a copy
              before using them.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
