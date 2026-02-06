"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings2 } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface V2EditPortfolioDialogProps {
  portfolioId: string;
  userId: string;
  initialName: string;
  initialDescription?: string;
}

export function V2EditPortfolioDialog({
  portfolioId,
  userId,
  initialName,
  initialDescription = "",
}: V2EditPortfolioDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  const updatePortfolio = useMutation(api.portfolios.updatePortfolio);

  const handleOpen = () => {
    setName(initialName);
    setDescription(initialDescription);
    setOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    updatePortfolio({
      portfolioId: portfolioId as Id<"portfolios">,
      userId: userId as Id<"users">,
      name,
      description,
    });
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="p-2 rounded-md text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors"
        aria-label="Edit portfolio"
      >
        <Settings2 className="h-4 w-4" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[420px] bg-zinc-950 border-white/[0.08] p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06]">
            <DialogTitle className="text-white text-sm font-semibold">Edit Portfolio</DialogTitle>
          </div>

          <div className="px-6 pb-6 pt-3 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-zinc-400">Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Portfolio name"
                className="bg-zinc-900 border-white/[0.06] text-white h-9"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-zinc-400">Description (optional)</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description..."
                rows={3}
                className="bg-zinc-900 border-white/[0.06] text-white resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 mt-2">
              <button onClick={() => setOpen(false)} className="px-3 py-1.5 text-sm text-zinc-500 hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="px-4 py-1.5 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
