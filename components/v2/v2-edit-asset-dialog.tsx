"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import type { Asset } from "@/app/(webapp)/portfolio/[id]/components/types";

interface V2EditAssetDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
  onAssetUpdated: () => void;
}

export function V2EditAssetDialog({ isOpen, onOpenChange, asset, onAssetUpdated }: V2EditAssetDialogProps) {
  const [editingAsset, setEditingAsset] = useState<Asset | null>(asset);
  const updateAsset = useMutation(api.assets.updateAsset);

  if (asset !== null && (editingAsset === null || asset._id !== editingAsset._id)) {
    setEditingAsset(asset);
  }

  const handleSave = () => {
    if (!editingAsset) return;
    updateAsset({
      assetId: editingAsset._id as Id<"assets">,
      name: editingAsset.name,
      symbol: editingAsset.symbol,
      type: editingAsset.type,
      currentPrice: editingAsset.currentPrice,
      currency: editingAsset.type === "cash" ? editingAsset.currency : undefined,
      notes: editingAsset.notes,
    });
    onOpenChange(false);
    onAssetUpdated();
  };

  if (!editingAsset) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] bg-zinc-950 border-white/[0.08] p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <DialogTitle className="text-white text-sm font-semibold">Edit Asset</DialogTitle>
        </div>

        <div className="px-6 pb-6 pt-2 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-zinc-400">Name</Label>
            <Input value={editingAsset.name} onChange={(e) => setEditingAsset({ ...editingAsset, name: e.target.value })} className="bg-zinc-900 border-white/[0.06] text-white h-9" />
          </div>

          {(editingAsset.type === "stock" || editingAsset.type === "crypto") && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-zinc-400">Symbol</Label>
              <Input value={editingAsset.symbol || ""} onChange={(e) => setEditingAsset({ ...editingAsset, symbol: e.target.value })} className="bg-zinc-900 border-white/[0.06] text-white h-9" />
            </div>
          )}

          {editingAsset.type === "cash" ? (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-zinc-400">Currency</Label>
              <Select value={editingAsset.currency || "USD"} onValueChange={(v) => setEditingAsset({ ...editingAsset, currency: v })}>
                <SelectTrigger className="bg-zinc-900 border-white/[0.06] text-white h-9"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-zinc-950 border-white/[0.08]">
                  {["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF"].map((c) => (
                    <SelectItem key={c} value={c} className="text-zinc-300 focus:text-white focus:bg-white/[0.06]">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-zinc-400">Current Price</Label>
              <Input type="number" step={editingAsset.type === "crypto" ? "0.000001" : "0.01"} value={editingAsset.currentPrice} onChange={(e) => setEditingAsset({ ...editingAsset, currentPrice: Number(e.target.value) })} className="bg-zinc-900 border-white/[0.06] text-white h-9" />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-zinc-400">Notes</Label>
            <Textarea value={editingAsset.notes || ""} onChange={(e) => setEditingAsset({ ...editingAsset, notes: e.target.value })} rows={2} className="bg-zinc-900 border-white/[0.06] text-white resize-none" />
          </div>

          <div className="flex items-center justify-end gap-2 mt-2">
            <button onClick={() => onOpenChange(false)} className="px-3 py-1.5 text-sm text-zinc-500 hover:text-white transition-colors">Cancel</button>
            <button onClick={handleSave} className="px-4 py-1.5 text-sm font-medium rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors">Save</button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
