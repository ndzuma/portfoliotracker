"use client";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Edit,
  Trash2,
  Plus,
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Percent,
} from "lucide-react";
import { toast } from "sonner";

interface TransactionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  assetId: string;
  assetName: string;
  assetType: string;
  assetSymbol?: string;
}

interface Transaction {
  _id: Id<"transactions">;
  assetId: Id<"assets">;
  type: "buy" | "sell" | "dividend";
  date: number;
  quantity?: number;
  price?: number;
  fees?: number;
  notes?: string;
  _creationTime: number;
}

export function TransactionDialog({
  isOpen,
  onOpenChange,
  assetId,
  assetName,
  assetType,
  assetSymbol,
}: TransactionDialogProps) {
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [isEditTransactionOpen, setIsEditTransactionOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] =
    useState<Transaction | null>(null);

  // New transaction form state
  const [newTransaction, setNewTransaction] = useState({
    type: "buy" as "buy" | "sell" | "dividend",
    date: new Date().toISOString().split("T")[0],
    quantity: "",
    price: "",
    fees: "0",
    notes: "",
  });

  // Get all transactions for this asset
  const transactions = useQuery(api.transactions.getAssetTransactions, {
    assetId: assetId as Id<"assets">,
  });

  // Get transaction statistics
  const stats = useQuery(api.transactions.getAssetTransactionStats, {
    assetId: assetId as Id<"assets">,
  });

  // Mutations
  const createTransaction = useMutation(api.transactions.createTransaction);
  const updateTransaction = useMutation(api.transactions.updateTransaction);
  const deleteTransaction = useMutation(api.transactions.deleteTransaction);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setNewTransaction({
        type: "buy",
        date: new Date().toISOString().split("T")[0],
        quantity: "",
        price: "",
        fees: "0",
        notes: "",
      });
    }
  }, [isOpen]);

  const handleAddTransaction = () => {
    try {
      createTransaction({
        assetId: assetId as Id<"assets">,
        type: newTransaction.type,
        date: new Date(newTransaction.date).getTime(),
        quantity:
          newTransaction.type !== "dividend"
            ? Number(newTransaction.quantity)
            : undefined,
        price: Number(newTransaction.price),
        fees: newTransaction.fees ? Number(newTransaction.fees) : 0,
        notes: newTransaction.notes || undefined,
      });

      setIsAddTransactionOpen(false);
      toast.success("Transaction added successfully");

      // Reset form
      setNewTransaction({
        type: "buy",
        date: new Date().toISOString().split("T")[0],
        quantity: "",
        price: "",
        fees: "0",
        notes: "",
      });
    } catch (error) {
      toast.error("Failed to add transaction");
      console.error(error);
    }
  };

  const handleEditTransaction = () => {
    if (!currentTransaction) return;

    try {
      updateTransaction({
        transactionId: currentTransaction._id,
        type: newTransaction.type,
        date: new Date(newTransaction.date).getTime(),
        quantity:
          newTransaction.type !== "dividend"
            ? Number(newTransaction.quantity)
            : undefined,
        price: Number(newTransaction.price),
        fees: Number(newTransaction.fees),
        notes: newTransaction.notes || undefined,
      });

      setIsEditTransactionOpen(false);
      setCurrentTransaction(null);
      toast.success("Transaction updated successfully");
    } catch (error) {
      toast.error("Failed to update transaction");
      console.error(error);
    }
  };

  const handleDeleteTransaction = (transactionId: Id<"transactions">) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      try {
        deleteTransaction({
          transactionId,
        });
        toast.success("Transaction deleted successfully");
      } catch (error) {
        toast.error("Failed to delete transaction");
        console.error(error);
      }
    }
  };

  const openEditTransaction = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    setNewTransaction({
      type: transaction.type,
      date: formatDateForInput(transaction.date),
      quantity: transaction.quantity?.toString() || "",
      price: transaction.price?.toString() || "",
      fees: (transaction.fees || 0).toString(),
      notes: transaction.notes || "",
    });
    setIsEditTransactionOpen(true);
  };

  const getTransactionTypeIcon = (type: "buy" | "sell" | "dividend") => {
    switch (type) {
      case "buy":
        return <ArrowDown className="h-4 w-4 text-primary" />;
      case "sell":
        return <ArrowUp className="h-4 w-4 text-secondary" />;
      case "dividend":
        return <Percent className="h-4 w-4 text-amber-500" />;
    }
  };

  // Helper to format currency
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return "-";
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Helper to format date for display
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper to format date for input field (YYYY-MM-DD)
  const formatDateForInput = (timestamp: number) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:min-w-2xl md:min-w-3xl lg:min-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <span>Transactions</span>
            <span className="text-muted-foreground font-normal">
              {assetSymbol && `(${assetSymbol})`} {assetName}
            </span>
          </DialogTitle>
          <DialogDescription>
            View and manage transactions for this asset
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Transaction Statistics */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="text-sm text-muted-foreground mb-1">Quantity</h4>
                <p className="text-xl font-semibold">
                  {stats.currentQuantity.toLocaleString()}
                </p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="text-sm text-muted-foreground mb-1">
                  Avg Buy Price
                </h4>
                <p className="text-xl font-semibold">
                  {formatCurrency(stats.avgBuyPrice)}
                </p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="text-sm text-muted-foreground mb-1">
                  Total Invested
                </h4>
                <p className="text-xl font-semibold">
                  {formatCurrency(stats.totalBuyAmount)}
                </p>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="text-sm text-muted-foreground mb-1">
                  Total Transactions
                </h4>
                <p className="text-xl font-semibold">
                  {stats.totalTransactions}
                </p>
              </div>
            </div>
          )}

          {/* Add Transaction Button */}
          <div className="flex justify-end">
            <Button onClick={() => setIsAddTransactionOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </div>

          {/* Transactions Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Fees</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!transactions || transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <AlertCircle className="h-8 w-8 mb-2" />
                        <span>No transactions found</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getTransactionTypeIcon(transaction.type)}
                          <span className="capitalize">{transaction.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell>
                        {transaction.quantity?.toLocaleString() || "-"}
                      </TableCell>
                      <TableCell>{formatCurrency(transaction.price)}</TableCell>
                      <TableCell>
                        {transaction.quantity && transaction.price
                          ? formatCurrency(
                              transaction.quantity * transaction.price,
                            )
                          : formatCurrency(transaction.price)}
                      </TableCell>
                      <TableCell>{formatCurrency(transaction.fees)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditTransaction(transaction)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteTransaction(transaction._id)
                            }
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Add Transaction Dialog */}
        <Dialog
          open={isAddTransactionOpen}
          onOpenChange={setIsAddTransactionOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Transaction</DialogTitle>
              <DialogDescription>
                Add a new transaction for {assetName}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="transaction-type">Type</Label>
                  <Select
                    value={newTransaction.type}
                    onValueChange={(value) =>
                      setNewTransaction({
                        ...newTransaction,
                        type: value as "buy" | "sell" | "dividend",
                      })
                    }
                  >
                    <SelectTrigger id="transaction-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="sell">Sell</SelectItem>
                      <SelectItem value="dividend">Dividend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="transaction-date">Date</Label>
                  <Input
                    id="transaction-date"
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        date: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {newTransaction.type !== "dividend" && (
                <div className="grid gap-2">
                  <Label htmlFor="transaction-quantity">Quantity</Label>
                  <Input
                    id="transaction-quantity"
                    type="number"
                    step={assetType === "crypto" ? "0.000001" : "0.01"}
                    value={newTransaction.quantity}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        quantity: e.target.value,
                      })
                    }
                    placeholder={assetType === "crypto" ? "0.5" : "10"}
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="transaction-price">
                  {newTransaction.type === "dividend"
                    ? "Dividend Amount"
                    : "Price Per Unit"}
                </Label>
                <Input
                  id="transaction-price"
                  type="number"
                  step="0.01"
                  value={newTransaction.price}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      price: e.target.value,
                    })
                  }
                  placeholder={
                    newTransaction.type === "dividend"
                      ? "100.00"
                      : assetType === "crypto"
                        ? "50000.00"
                        : "150.00"
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="transaction-fees">Fees</Label>
                <Input
                  id="transaction-fees"
                  type="number"
                  step="0.01"
                  value={newTransaction.fees}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      fees: e.target.value,
                    })
                  }
                  placeholder="0.00"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="transaction-notes">Notes (optional)</Label>
                <Textarea
                  id="transaction-notes"
                  value={newTransaction.notes}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Add any additional details..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddTransactionOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddTransaction}
                disabled={
                  !newTransaction.date ||
                  !newTransaction.price ||
                  (newTransaction.type !== "dividend" &&
                    !newTransaction.quantity)
                }
              >
                Add Transaction
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Transaction Dialog */}
        <Dialog
          open={isEditTransactionOpen}
          onOpenChange={setIsEditTransactionOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
              <DialogDescription>
                Modify an existing transaction for {assetName}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-transaction-type">Type</Label>
                  <Select
                    value={newTransaction.type}
                    onValueChange={(value) =>
                      setNewTransaction({
                        ...newTransaction,
                        type: value as "buy" | "sell" | "dividend",
                      })
                    }
                  >
                    <SelectTrigger id="edit-transaction-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="sell">Sell</SelectItem>
                      <SelectItem value="dividend">Dividend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-transaction-date">Date</Label>
                  <Input
                    id="edit-transaction-date"
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        date: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {newTransaction.type !== "dividend" && (
                <div className="grid gap-2">
                  <Label htmlFor="edit-transaction-quantity">Quantity</Label>
                  <Input
                    id="edit-transaction-quantity"
                    type="number"
                    step={assetType === "crypto" ? "0.000001" : "0.01"}
                    value={newTransaction.quantity}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        quantity: e.target.value,
                      })
                    }
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="edit-transaction-price">
                  {newTransaction.type === "dividend"
                    ? "Dividend Amount"
                    : "Price Per Unit"}
                </Label>
                <Input
                  id="edit-transaction-price"
                  type="number"
                  step="0.01"
                  value={newTransaction.price}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      price: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-transaction-fees">Fees</Label>
                <Input
                  id="edit-transaction-fees"
                  type="number"
                  step="0.01"
                  value={newTransaction.fees}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      fees: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-transaction-notes">Notes (optional)</Label>
                <Textarea
                  id="edit-transaction-notes"
                  value={newTransaction.notes}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
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
                onClick={() => setIsEditTransactionOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditTransaction}
                disabled={
                  !newTransaction.date ||
                  !newTransaction.price ||
                  (newTransaction.type !== "dividend" &&
                    !newTransaction.quantity)
                }
              >
                Update Transaction
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}
