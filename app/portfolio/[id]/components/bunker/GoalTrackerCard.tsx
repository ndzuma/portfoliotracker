"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress/index";
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
import { Target, Edit } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

interface GoalTrackerCardProps {
  portfolioId: string;
  portfolioValue: number;
  annualReturn?: number;
  monthlyContribution?: number;
}

export function GoalTrackerCard({
  portfolioId,
  portfolioValue,
  annualReturn = 0,
  monthlyContribution = 0,
}: GoalTrackerCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch goals from Convex
  const goals = useQuery(api.goals.getGoalsByPortfolio, {
    portfolioId: portfolioId as Id<"portfolios">,
  });

  // Mutation to save goals
  const upsertGoals = useMutation(api.goals.upsertGoals);

  // Default goal values if none exist
  const defaultGoals = {
    targetValue: 100000,
    targetReturn: 8,
    targetContribution: 500,
  };

  const currentGoals = goals || defaultGoals;
  const { targetValue, targetReturn, targetContribution } = currentGoals;

  const [goalValues, setGoalValues] = useState({
    targetValue,
    targetReturn,
    targetContribution,
  });

  // Update state when goals data changes
  React.useEffect(() => {
    if (goals) {
      setGoalValues({
        targetValue: goals.targetValue,
        targetReturn: goals.targetReturn,
        targetContribution: goals.targetContribution,
      });
    }
  }, [goals]);

  // Calculate percentages
  const valuePercentage = Math.min(
    Math.round((portfolioValue / targetValue) * 100),
    100
  );
  const returnPercentage = Math.min(
    Math.round((annualReturn / targetReturn) * 100),
    100
  );
  const contributionPercentage = Math.min(
    Math.round((monthlyContribution / targetContribution) * 100),
    100
  );

  const handleSaveGoals = async () => {
    try {
      await upsertGoals({
        portfolioId: portfolioId as Id<"portfolios">,
        targetValue: goalValues.targetValue,
        targetReturn: goalValues.targetReturn,
        targetContribution: goalValues.targetContribution,
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Failed to save goals:", error);
    }
  };

  return (
    <>
      <Card className="row-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Portfolio Goals
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
            className="opacity-70 hover:opacity-100 transition-opacity"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Goals
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Portfolio Value</div>
              <div className="text-sm text-muted-foreground">
                ${portfolioValue.toLocaleString()} / $
                {targetValue.toLocaleString()}
              </div>
            </div>
            <Progress value={valuePercentage} className="h-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {valuePercentage}% of goal achieved
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Annual Return</div>
              <div className="text-sm text-muted-foreground">
                {annualReturn.toFixed(1)}% / {targetReturn}%
              </div>
            </div>
            <Progress value={returnPercentage} className="h-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {returnPercentage}% of target return
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Monthly Contribution</div>
              <div
                className={
                  contributionPercentage >= 100
                    ? "text-sm text-primary"
                    : "text-sm text-muted-foreground"
                }
              >
                ${monthlyContribution} / ${targetContribution}
              </div>
            </div>
            <Progress value={contributionPercentage} className="h-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {contributionPercentage >= 100
                ? "Target contribution met"
                : `${contributionPercentage}% of target contribution`}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Portfolio Goals</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="targetValue">Target Portfolio Value ($)</Label>
              <Input
                id="targetValue"
                type="number"
                value={goalValues.targetValue}
                onChange={(e) =>
                  setGoalValues({
                    ...goalValues,
                    targetValue: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetReturn">Target Annual Return (%)</Label>
              <Input
                id="targetReturn"
                type="number"
                step="0.1"
                value={goalValues.targetReturn}
                onChange={(e) =>
                  setGoalValues({
                    ...goalValues,
                    targetReturn: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetContribution">
                Target Monthly Contribution ($)
              </Label>
              <Input
                id="targetContribution"
                type="number"
                value={goalValues.targetContribution}
                onChange={(e) =>
                  setGoalValues({
                    ...goalValues,
                    targetContribution: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveGoals}>Save Goals</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
