"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings2, Save } from "lucide-react";
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

  const reset = () => {
    setName(initialName);
    setDescription(initialDescription);
  };

  const handleOpen = () => {
    reset();
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
        className="text-xs text-zinc-500 hover:text-white transition-colors"
        aria-label="Edit portfolio"
      >
        Edit Portfolio
      </button>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) reset();
        }}
      >
        <DialogContent className="sm:max-w-[460px] bg-zinc-950 border-white/[0.08] p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.06]">
            <DialogTitle className="text-white text-base font-semibold">
              Edit Portfolio
            </DialogTitle>
          </div>

          <div className="px-6 pb-6 pt-5 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
                Portfolio Name
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Portfolio name"
                className="bg-zinc-900 border-white/[0.06] text-white h-10 text-sm"
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
                Description
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your investment strategy or goals..."
                rows={3}
                className="bg-zinc-900 border-white/[0.06] text-white resize-none text-sm"
              />
              <p className="text-xs text-zinc-600">
                Optional but helpful for organizing your portfolios
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 mt-3 pt-4 border-t border-white/[0.06]">
              <button
                onClick={() => {
                  reset();
                  setOpen(false);
                }}
                className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="px-5 py-2 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save className="h-3.5 w-3.5" />
                Save Changes
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
