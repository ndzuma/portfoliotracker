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
import { FileIcon, PlusCircle } from "lucide-react";

interface DocumentStorageCardProps {
  title?: string;
}

export function DocumentStorageCard({
  title = "Documents",
}: DocumentStorageCardProps) {
  const [expanded, setExpanded] = useState(false);

  const documents = [
    {
      name: "Q3_Investment_Statement.pdf",
      size: "2.4 MB",
      updated: "2 days ago",
    },
    {
      name: "Tax_Documents_2023.zip",
      size: "5.8 MB",
      updated: "3 weeks ago",
    },
    {
      name: "Portfolio_Strategy_2023.docx",
      size: "1.2 MB",
      updated: "1 month ago",
    },
  ];

  return (
    <>
      <Card className="p-6 h-full relative">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 mb-2">
            <FileIcon className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium text-foreground">{title}</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4 flex-1">
            Store and access important financial documents related to this
            portfolio.
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
            <DialogTitle>Portfolio Documents</DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Recent Documents</h3>
              <Button size="sm" variant="outline" className="gap-1">
                <PlusCircle className="h-4 w-4" /> Upload
              </Button>
            </div>

            <div className="border rounded-md">
              {documents.map((doc, index) => (
                <div
                  key={doc.name}
                  className={`py-3 px-4 flex items-center gap-3 ${
                    index !== documents.length - 1 ? "border-b" : ""
                  }`}
                >
                  <FileIcon className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.size} • Updated {doc.updated}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground italic">
              <span className="font-semibold">Note:</span> All documents are
              securely stored and encrypted. Only you have access to these
              files.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
