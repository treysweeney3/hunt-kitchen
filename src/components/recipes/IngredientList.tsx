"use client";

import { useState, useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { RecipeIngredient } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface IngredientListProps {
  ingredients: RecipeIngredient[];
  recipeId?: string;
  className?: string;
}

export function IngredientList({
  ingredients,
  recipeId,
  className,
}: IngredientListProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<Set<number>>(
    new Set()
  );

  // Load checked state from localStorage if recipeId is provided
  useEffect(() => {
    if (recipeId) {
      const stored = localStorage.getItem(`recipe-ingredients-${recipeId}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCheckedIngredients(new Set(parsed));
        } catch (error) {
          console.error("Failed to parse stored ingredients", error);
        }
      }
    }
  }, [recipeId]);

  // Save checked state to localStorage
  useEffect(() => {
    if (recipeId) {
      localStorage.setItem(
        `recipe-ingredients-${recipeId}`,
        JSON.stringify(Array.from(checkedIngredients))
      );
    }
  }, [checkedIngredients, recipeId]);

  const handleToggleIngredient = (index: number) => {
    setCheckedIngredients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleClearAll = () => {
    setCheckedIngredients(new Set());
  };

  const checkedCount = checkedIngredients.size;
  const totalCount = ingredients.length;
  const allChecked = checkedCount === totalCount;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Ingredients</h3>
          {checkedCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {checkedCount} of {totalCount} checked
            </p>
          )}
        </div>
        {checkedCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-[#E07C24] hover:text-[#c96b1f] hover:bg-[#E07C24]/10"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      <Separator />

      {/* Ingredients List */}
      <div className="space-y-3">
        {ingredients.map((ingredient, index) => (
          <div
            key={index}
            className={cn(
              "flex items-start space-x-3 p-3 rounded-lg transition-colors hover:bg-muted/50",
              checkedIngredients.has(index) && "bg-muted/30"
            )}
          >
            <Checkbox
              id={`ingredient-${index}`}
              checked={checkedIngredients.has(index)}
              onCheckedChange={() => handleToggleIngredient(index)}
              className="mt-1"
            />
            <Label
              htmlFor={`ingredient-${index}`}
              className={cn(
                "flex-1 cursor-pointer font-normal leading-relaxed",
                checkedIngredients.has(index) &&
                  "line-through text-muted-foreground"
              )}
            >
              <span className="font-medium">
                {ingredient.amount && `${ingredient.amount} `}
                {ingredient.unit && `${ingredient.unit} `}
              </span>
              <span>{ingredient.ingredient}</span>
              {ingredient.notes && (
                <span className="block text-sm text-muted-foreground mt-0.5">
                  {ingredient.notes}
                </span>
              )}
            </Label>
          </div>
        ))}
      </div>

      {/* Progress Indicator */}
      {allChecked && checkedCount > 0 && (
        <div className="bg-[#2D5A3D] text-white rounded-lg p-4 text-center">
          <p className="font-medium">All ingredients checked!</p>
          <p className="text-sm text-white/80 mt-1">
            You're ready to start cooking
          </p>
        </div>
      )}
    </div>
  );
}
