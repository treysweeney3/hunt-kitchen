"use client";

import { useState, useCallback } from "react";
import { Recipe } from "@/types";
import { RecipeGrid } from "./RecipeGrid";
import { useSavedRecipes } from "@/hooks/useSavedRecipes";
import { AuthPromptDialog } from "@/components/auth/AuthPromptDialog";

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
  const { savedRecipeIds, isAuthenticated, toggleSaveRecipe } = useSavedRecipes();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const handleSave = useCallback(
    async (recipeSlug: string, recipeId: string) => {
      if (!isAuthenticated) {
        setShowAuthPrompt(true);
        return;
      }
      await toggleSaveRecipe(recipeSlug, recipeId);
    },
    [isAuthenticated, toggleSaveRecipe]
  );

  return (
    <>
      <RecipeGrid
        recipes={recipes}
        onSaveRecipe={handleSave}
        savedRecipeIds={savedRecipeIds}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        className={className}
      />
      <AuthPromptDialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt} />
    </>
  );
}
