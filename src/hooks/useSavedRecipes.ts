"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";

export function useSavedRecipes() {
  const { isAuthenticated } = useAuth();
  const [savedRecipeIds, setSavedRecipeIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch saved recipe IDs when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedRecipeIds();
    } else {
      setSavedRecipeIds([]);
    }
  }, [isAuthenticated]);

  const fetchSavedRecipeIds = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/recipes/saved?idsOnly=true");
      if (response.ok) {
        const data = await response.json();
        setSavedRecipeIds(data.recipeIds || []);
      }
    } catch (error) {
      console.error("Failed to fetch saved recipes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSaveRecipe = useCallback(async (recipeSlug: string, recipeId: string) => {
    if (!isAuthenticated) {
      throw new Error("You must be logged in to save recipes");
    }

    const isSaved = savedRecipeIds.includes(recipeId);

    if (isSaved) {
      // Unsave
      const response = await fetch(`/api/recipes/${recipeSlug}/save`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to unsave recipe");
      }

      setSavedRecipeIds((prev) => prev.filter((id) => id !== recipeId));
    } else {
      // Save
      const response = await fetch(`/api/recipes/${recipeSlug}/save`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save recipe");
      }

      setSavedRecipeIds((prev) => [...prev, recipeId]);
    }
  }, [isAuthenticated, savedRecipeIds]);

  const isRecipeSaved = useCallback((recipeId: string) => {
    return savedRecipeIds.includes(recipeId);
  }, [savedRecipeIds]);

  return {
    savedRecipeIds,
    isLoading,
    isAuthenticated,
    toggleSaveRecipe,
    isRecipeSaved,
    refetch: fetchSavedRecipeIds,
  };
}
