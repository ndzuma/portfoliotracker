"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface V2CreatePortfolioDialogProps {
  userId?: string;
  triggerClassName?: string;
  triggerLabel?: string;
}

export function V2CreatePortfolioDialog({ userId, triggerClassName, triggerLabel = "New Portfolio" }: V2CreatePortfolioDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createPortfolio = useMutation(api.portfolios.createPortfolio);

  const handleCreate = () => {
    if (userId && name.trim()) {
      createPortfolio({ userId, name, description });
      setName(""); setDescription(""); setOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={triggerClassName || "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors"}
      >
        {triggerLabel}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[420px] bg-zinc-950 border-white/[0.08] p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06]">
            <DialogTitle className="text-white text-sm font-semibold">Create Portfolio</DialogTitle>
          </div>

          <div className="px-6 pb-6 pt-3 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-zinc-400">Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Growth Portfolio"
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
                onClick={handleCreate}
                disabled={!name.trim()}
                className="px-4 py-1.5 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Create
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
