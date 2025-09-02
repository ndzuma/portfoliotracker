"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Asset } from "../types";

interface EditAssetDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  asset: Asset | null;
  onAssetUpdated: () => void;
}

export function EditAssetDialog({
  isOpen,
  onOpenChange,
  asset,
  onAssetUpdated
}: EditAssetDialogProps) {
  const [editingAsset, setEditingAsset] = useState<Asset | null>(asset);
  const updateAsset = useMutation(api.assets.updateAsset);

  // Update local state when the asset prop changes
  if (asset !== null && (editingAsset === null || asset._id !== editingAsset._id)) {
    setEditingAsset(asset);
  }

  const handleUpdateAsset = () => {
    if (!editingAsset) return;

    updateAsset({
      assetId: editingAsset._id as Id<"assets">,
      name: editingAsset.name,
      symbol: editingAsset.symbol,
      type: editingAsset.type,
      currentPrice: editingAsset.currentPrice,
      currency:
        editingAsset.type === "cash" ? editingAsset.currency : undefined,
      notes: editingAsset.notes,
    });

    onOpenChange(false);
    onAssetUpdated();
  };

  if (!editingAsset) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Asset</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-asset-name">Name</Label>
            <Input
              id="edit-asset-name"
              value={editingAsset.name}
              onChange={(e) =>
                setEditingAsset({
                  ...editingAsset,
                  name: e.target.value,
                })
              }
            />
          </div>
          {(editingAsset.type === "stock" ||
            editingAsset.type === "crypto") && (
            <div className="grid gap-2">
              <Label htmlFor="edit-asset-symbol">Symbol</Label>
              <Input
                id="edit-asset-symbol"
                value={editingAsset.symbol || ""}
                onChange={(e) =>
                  setEditingAsset({
                    ...editingAsset,
                    symbol: e.target.value,
                  })
                }
              />
            </div>
          )}
          {editingAsset.type === "cash" ? (
            <div className="grid gap-2">
              <Label htmlFor="edit-asset-currency">Currency</Label>
              <Select
                value={editingAsset.currency || "USD"}
                onValueChange={(value) =>
                  setEditingAsset({
                    ...editingAsset,
                    currency: value,
                  })
                }
              >
                <SelectTrigger id="edit-asset-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="JPY">JPY (¥)</SelectItem>
                  <SelectItem value="CAD">CAD ($)</SelectItem>
                  <SelectItem value="AUD">AUD ($)</SelectItem>
                  <SelectItem value="CHF">CHF (Fr)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="edit-asset-price">Current Price</Label>
              <Input
                id="edit-asset-price"
                type="number"
                step={
                  editingAsset.type === "crypto" ? "0.000001" : "0.01"
                }
                value={editingAsset.currentPrice}
                onChange={(e) =>
                  setEditingAsset({
                    ...editingAsset,
                    currentPrice: Number(e.target.value),
                  })
                }
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="edit-asset-notes">Notes</Label>
            <Textarea
              id="edit-asset-notes"
              value={editingAsset.notes || ""}
              onChange={(e) =>
                setEditingAsset({
                  ...editingAsset,
                  notes: e.target.value,
                })
              }
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleUpdateAsset}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
