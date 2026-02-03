"use client";

import { Recipe } from "@/types";
import { RecipeHero } from "./RecipeHero";
import { useSavedRecipes } from "@/hooks/useSavedRecipes";

interface RecipeHeroWithSaveProps {
  recipe: Recipe;
  className?: string;
}

export function RecipeHeroWithSave({
  recipe,
  className,
}: RecipeHeroWithSaveProps) {
  const { savedRecipeIds, toggleSaveRecipe } = useSavedRecipes();
  const isSaved = savedRecipeIds.includes(recipe.id);

  return (
    <RecipeHero
      recipe={recipe}
      onSave={toggleSaveRecipe}
      isSaved={isSaved}
      className={className}
    />
  );
}
