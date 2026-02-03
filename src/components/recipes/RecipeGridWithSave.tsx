"use client";

import { Recipe } from "@/types";
import { RecipeGrid } from "./RecipeGrid";
import { useSavedRecipes } from "@/hooks/useSavedRecipes";

interface RecipeGridWithSaveProps {
  recipes: Recipe[];
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function RecipeGridWithSave({
  recipes,
  isLoading = false,
  emptyMessage,
  className,
}: RecipeGridWithSaveProps) {
  const { savedRecipeIds, toggleSaveRecipe } = useSavedRecipes();

  return (
    <RecipeGrid
      recipes={recipes}
      onSaveRecipe={toggleSaveRecipe}
      savedRecipeIds={savedRecipeIds}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      className={className}
    />
  );
}
