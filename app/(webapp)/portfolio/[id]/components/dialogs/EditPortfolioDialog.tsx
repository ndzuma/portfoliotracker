"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

interface EditPortfolioDialogProps {
  portfolioId: string;
  userId: string;
  initialName: string;
  initialDescription?: string;
}

export function EditPortfolioDialog({
  portfolioId,
  userId,
  initialName,
  initialDescription = ""
}: EditPortfolioDialogProps) {
  const [isEditPortfolioOpen, setIsEditPortfolioOpen] = useState(false);
  const [editPortfolioData, setEditPortfolioData] = useState({
    name: initialName,
    description: initialDescription,
  });

  const updatePortfolio = useMutation(api.portfolios.updatePortfolio);

  const handleUpdatePortfolio = () => {
    updatePortfolio({
      portfolioId: portfolioId as Id<"portfolios">,
      userId: userId as Id<"users">,
      name: editPortfolioData.name,
      description: editPortfolioData.description,
    });

    setIsEditPortfolioOpen(false);
  };

  return (
    <Dialog
      open={isEditPortfolioOpen}
      onOpenChange={setIsEditPortfolioOpen}
    >
      <Button variant="outline" onClick={() => setIsEditPortfolioOpen(true)}>
        <Edit className="h-4 w-4 mr-2" />
        Edit Portfolio
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Portfolio</DialogTitle>
          <DialogDescription>
            Make changes to your portfolio details
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="portfolio-name">Name</Label>
            <Input
              id="portfolio-name"
              value={editPortfolioData.name}
              onChange={(e) =>
                setEditPortfolioData({
                  ...editPortfolioData,
                  name: e.target.value,
                })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="portfolio-description">Description</Label>
            <Textarea
              id="portfolio-description"
              value={editPortfolioData.description}
              onChange={(e) =>
                setEditPortfolioData({
                  ...editPortfolioData,
                  description: e.target.value,
                })
              }
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsEditPortfolioOpen(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleUpdatePortfolio}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
