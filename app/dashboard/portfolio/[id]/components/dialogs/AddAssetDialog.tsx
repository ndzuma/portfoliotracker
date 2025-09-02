"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
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
import { Plus, TrendingUp } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Asset } from "../types";

interface AddAssetDialogProps {
  portfolioId: string;
}

export function AddAssetDialog({ portfolioId }: AddAssetDialogProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addAssetStep, setAddAssetStep] = useState<
    "type" | "details" | "confirmation"
  >("type");

  const [newAsset, setNewAsset] = useState({
    symbol: "",
    name: "",
    type: "stock" as Asset["type"],
    quantity: "",
    purchasePrice: "",
    currentPrice: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    fees: "0",
    notes: "",
    currency: "USD",
  });

  const createAsset = useMutation(api.assets.createAsset);

  // Helper function to get currency symbol
  const getCurrencySymbol = (currency: string): string => {
    switch (currency) {
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      case "JPY":
        return "¥";
      case "CAD":
        return "CA$";
      case "AUD":
        return "A$";
      case "CHF":
        return "Fr";
      default:
        return "$";
    }
  };

  const handleAddAsset = () => {
    // Create new asset with transaction in Convex
    createAsset({
      portfolioId: portfolioId,
      name: newAsset.name,
      symbol: newAsset.symbol ? newAsset.symbol.toUpperCase() : undefined,
      type: newAsset.type,
      currentPrice:
        newAsset.type === "cash"
          ? Number(newAsset.purchasePrice)
          : newAsset.currentPrice
            ? Number(newAsset.currentPrice)
            : Number(newAsset.purchasePrice),
      currency: newAsset.type === "cash" ? newAsset.currency : undefined,
      notes: newAsset.notes || undefined,
      // Transaction data
      quantity:
        newAsset.type === "cash" || newAsset.type === "real estate"
          ? 1
          : Number(newAsset.quantity),
      purchasePrice: Number(newAsset.purchasePrice),
      purchaseDate: new Date(newAsset.purchaseDate).getTime(),
      fees: newAsset.fees ? Number(newAsset.fees) : 0,
      transactionNotes: newAsset.notes || undefined,
    });

    // Reset form state
    setNewAsset({
      symbol: "",
      name: "",
      type: "stock",
      quantity: "",
      purchasePrice: "",
      currentPrice: "",
      purchaseDate: new Date().toISOString().split("T")[0],
      fees: "0",
      notes: "",
      currency: "USD",
    });
    setAddAssetStep("type");
    setIsAddDialogOpen(false);
  };

  return (
    <Dialog
      open={isAddDialogOpen}
      onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) setAddAssetStep("type");
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Asset
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
          <DialogDescription>
            {addAssetStep === "type"
              ? "Select the type of asset you want to add"
              : addAssetStep === "details"
                ? "Enter details about your asset"
                : "Review and confirm asset details"}
          </DialogDescription>
        </DialogHeader>

        {addAssetStep === "type" && (
          <div className="py-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="flex flex-col h-24 items-center justify-center gap-2"
                onClick={() => {
                  setNewAsset({ ...newAsset, type: "stock" });
                  setAddAssetStep("details");
                }}
              >
                <TrendingUp className="h-8 w-8 text-primary" />
                <span>Stock</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col h-24 items-center justify-center gap-2"
                onClick={() => {
                  setNewAsset({ ...newAsset, type: "crypto" });
                  setAddAssetStep("details");
                }}
              >
                <svg
                  className="h-8 w-8 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.5 9.5 C9.5 8 10.5 7 12 7 C13.5 7 14.5 8 14.5 9.5 C14.5 11 13.5 11.5 12 11.5 C10.5 11.5 9.5 12 9.5 13.5 C9.5 15 10.5 16 12 16 C13.5 16 14.5 15 14.5 13.5" />
                  <line x1="12" y1="7" x2="12" y2="17" />
                </svg>
                <span>Crypto</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col h-24 items-center justify-center gap-2"
                onClick={() => {
                  setNewAsset({ ...newAsset, type: "cash" });
                  setAddAssetStep("details");
                }}
              >
                <svg
                  className="h-8 w-8 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <circle cx="12" cy="12" r="2" />
                  <path d="M6 12h.01M18 12h.01" />
                </svg>
                <span>Cash</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col h-24 items-center justify-center gap-2"
                onClick={() => {
                  setNewAsset({ ...newAsset, type: "bond" });
                  setAddAssetStep("details");
                }}
              >
                <svg
                  className="h-8 w-8 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 5h12l3 5-3 5H6l-3-5z" />
                  <path d="M6 15v4M18 15v4" />
                </svg>
                <span>Bond</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col h-24 items-center justify-center gap-2"
                onClick={() => {
                  setNewAsset({ ...newAsset, type: "real estate" });
                  setAddAssetStep("details");
                }}
              >
                <svg
                  className="h-8 w-8 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m3 21 .9-.7.9.7.9-.7.9.7.9-.7.9.7.9-.7.9.7.9-.7.9.7.9-.7.9.7.9-.7.9.7.9-.7.9.7.9-.7.9.7" />
                  <path d="M5 21V4.3L12 2l7 2.3V21" />
                  <path d="M9 8h1M14 8h1M9 13h1M14 13h1M9 18h6" />
                </svg>
                <span>Real Estate</span>
              </Button>

              <Button
                variant="outline"
                className="flex flex-col h-24 items-center justify-center gap-2"
                onClick={() => {
                  setNewAsset({ ...newAsset, type: "commodity" });
                  setAddAssetStep("details");
                }}
              >
                <svg
                  className="h-8 w-8 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v12M8 8l8 8M16 8l-8 8" />
                </svg>
                <span>Commodity</span>
              </Button>
            </div>
          </div>
        )}

        {addAssetStep === "details" && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Asset Name</Label>
                <Input
                  id="name"
                  value={newAsset.name}
                  onChange={(e) =>
                    setNewAsset({ ...newAsset, name: e.target.value })
                  }
                  placeholder={
                    newAsset.type === "stock"
                      ? "Apple Inc."
                      : newAsset.type === "crypto"
                        ? "Bitcoin"
                        : newAsset.type === "real estate"
                          ? "Rental Property on Main St"
                          : newAsset.type === "bond"
                            ? "Treasury Bond 2025"
                            : newAsset.type === "cash"
                              ? "USD Cash Holdings"
                              : newAsset.type === "commodity"
                                ? "Gold"
                                : "Asset Name"
                  }
                />
              </div>

              {newAsset.type === "cash" && (
                <div className="grid gap-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={newAsset.currency}
                    onValueChange={(value) =>
                      setNewAsset({ ...newAsset, currency: value })
                    }
                  >
                    <SelectTrigger>
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
              )}

              {(newAsset.type === "stock" || newAsset.type === "crypto") && (
                <div className="grid gap-2">
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input
                    id="symbol"
                    value={newAsset.symbol}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        symbol: e.target.value,
                      })
                    }
                    placeholder={newAsset.type === "stock" ? "AAPL" : "BTC"}
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  step={newAsset.type === "crypto" ? "0.000001" : "0.01"}
                  value={
                    newAsset.type === "cash" || newAsset.type === "real estate"
                      ? "1"
                      : newAsset.quantity
                  }
                  onChange={(e) =>
                    setNewAsset({
                      ...newAsset,
                      quantity: e.target.value,
                    })
                  }
                  placeholder={
                    newAsset.type === "stock"
                      ? "100"
                      : newAsset.type === "crypto"
                        ? "0.25"
                        : "1"
                  }
                  disabled={
                    newAsset.type === "cash" || newAsset.type === "real estate"
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="purchasePrice">
                  {newAsset.type === "cash" ? "Amount" : "Purchase Price"}
                </Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  value={newAsset.purchasePrice}
                  onChange={(e) =>
                    setNewAsset({
                      ...newAsset,
                      purchasePrice: e.target.value,
                    })
                  }
                  placeholder={
                    newAsset.type === "stock"
                      ? "150.00"
                      : newAsset.type === "crypto"
                        ? "29000.00"
                        : newAsset.type === "real estate"
                          ? "250000.00"
                          : newAsset.type === "bond"
                            ? "1000.00"
                            : newAsset.type === "cash"
                              ? "5000.00"
                              : "0.00"
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={newAsset.purchaseDate}
                  onChange={(e) =>
                    setNewAsset({
                      ...newAsset,
                      purchaseDate: e.target.value,
                    })
                  }
                />
              </div>

              {newAsset.type !== "cash" && (
                <div className="grid gap-2">
                  <Label htmlFor="currentPrice">
                    Current Price{" "}
                    {newAsset.purchasePrice
                      ? `(default: ${newAsset.purchasePrice})`
                      : ""}
                  </Label>
                  <Input
                    id="currentPrice"
                    type="number"
                    step={newAsset.type === "crypto" ? "0.000001" : "0.01"}
                    value={newAsset.currentPrice}
                    onChange={(e) =>
                      setNewAsset({
                        ...newAsset,
                        currentPrice: e.target.value,
                      })
                    }
                    placeholder="Leave empty to use purchase price"
                  />
                </div>
              )}

              {newAsset.type !== "cash" && (
                <div className="grid gap-2">
                  <Label htmlFor="fees">Transaction Fees</Label>
                  <Input
                    id="fees"
                    type="number"
                    step="0.01"
                    value={newAsset.fees}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, fees: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={newAsset.notes}
                  onChange={(e) =>
                    setNewAsset({ ...newAsset, notes: e.target.value })
                  }
                  placeholder="Add any additional information about this asset..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAddAssetStep("type")}>
                Back
              </Button>
              <Button
                onClick={() => setAddAssetStep("confirmation")}
                disabled={
                  !newAsset.name ||
                  (!newAsset.quantity &&
                    newAsset.type !== "cash" &&
                    newAsset.type !== "real estate") ||
                  !newAsset.purchasePrice
                }
              >
                Next
              </Button>
            </DialogFooter>
          </div>
        )}

        {addAssetStep === "confirmation" && (
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <span className="font-medium">
                  {newAsset.type.charAt(0).toUpperCase() +
                    newAsset.type.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{newAsset.name}</span>
              </div>
              {newAsset.symbol && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Symbol:</span>
                  <span className="font-medium">
                    {newAsset.symbol.toUpperCase()}
                  </span>
                </div>
              )}
              {newAsset.type === "cash" && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Currency:</span>
                  <span className="font-medium">{newAsset.currency}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity:</span>
                <span className="font-medium">
                  {newAsset.type === "real estate" || newAsset.type === "cash"
                    ? "1"
                    : newAsset.quantity}
                  {newAsset.type === "real estate"
                    ? " property"
                    : newAsset.type === "cash"
                      ? ""
                      : newAsset.type === "crypto"
                        ? " units"
                        : " shares"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {newAsset.type === "cash" ? "Amount:" : "Purchase Price:"}
                </span>
                <span className="font-medium">
                  {newAsset.type === "cash" && newAsset.currency
                    ? getCurrencySymbol(newAsset.currency)
                    : "$"}
                  {Number(newAsset.purchasePrice).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {newAsset.type === "cash" ? "Date Added:" : "Purchase Date:"}
                </span>
                <span className="font-medium">
                  {new Date(newAsset.purchaseDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Value:</span>
                <span className="font-medium">
                  {newAsset.type === "cash" && newAsset.currency
                    ? getCurrencySymbol(newAsset.currency)
                    : "$"}
                  {(
                    Number(newAsset.purchasePrice) *
                    Number(newAsset.quantity || 1)
                  ).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAddAssetStep("details")}
              >
                Back
              </Button>
              <Button onClick={handleAddAsset}>Add Asset</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
