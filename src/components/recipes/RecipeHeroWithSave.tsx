"use client";

import { useState, useCallback } from "react";
import { Recipe } from "@/types";
import { RecipeHero } from "./RecipeHero";
import { useSavedRecipes } from "@/hooks/useSavedRecipes";
import { AuthPromptDialog } from "@/components/auth/AuthPromptDialog";

interface RecipeHeroWithSaveProps {
  recipe: Recipe;
  className?: string;
}

export function RecipeHeroWithSave({
  recipe,
  className,
}: RecipeHeroWithSaveProps) {
  const { savedRecipeIds, isAuthenticated, toggleSaveRecipe } = useSavedRecipes();
  const isSaved = savedRecipeIds.includes(recipe.id);
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
      <RecipeHero
        recipe={recipe}
        onSave={handleSave}
        isSaved={isSaved}
        className={className}
      />
      <AuthPromptDialog open={showAuthPrompt} onOpenChange={setShowAuthPrompt} />
    </>
  );
}
