"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Heart, Loader2, Trash2 } from "lucide-react";
import { Recipe } from "@/types";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { toast } from "sonner";

export default function SavedRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [recipeToRemove, setRecipeToRemove] = useState<{ id: string; slug: string } | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    fetchSavedRecipes();
  }, []);

  async function fetchSavedRecipes() {
    setLoading(true);
    try {
      const res = await fetch("/api/recipes/saved");
      if (!res.ok) throw new Error("Failed to fetch saved recipes");

      const data = await res.json();
      setRecipes(data.recipes || []);
    } catch (error) {
      console.error("Error fetching saved recipes:", error);
      toast.error("Failed to load saved recipes");
    } finally {
      setLoading(false);
    }
  }

  const handleRemoveRecipe = async () => {
    if (!recipeToRemove) return;

    setRemoving(true);
    try {
      const res = await fetch(`/api/recipes/${recipeToRemove.slug}/save`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to remove recipe");

      setRecipes((prev) => prev.filter((r) => r.id !== recipeToRemove.id));
      toast.success("Recipe removed from saved recipes");
    } catch (error) {
      console.error("Error removing recipe:", error);
      toast.error("Failed to remove recipe");
    } finally {
      setRemoving(false);
      setRecipeToRemove(null);
    }
  };

  const handleToggleSave = async (recipeSlug: string, recipeId: string) => {
    // This will remove the recipe from saved
    setRecipeToRemove({ id: recipeId, slug: recipeSlug });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#2D5A3D]" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Saved Recipes</h1>
          <p className="mt-2 text-gray-600">
            Your collection of favorite wild game recipes.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Recipes ({recipes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {recipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes.map((recipe) => (
                  <div key={recipe.id} className="relative group">
                    <RecipeCard
                      recipe={recipe}
                      onSave={handleToggleSave}
                      isSaved={true}
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 h-8 w-8"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setRecipeToRemove({ id: recipe.id, slug: recipe.slug });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No saved recipes yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Start browsing our collection and save your favorite wild game recipes.
                </p>
                <Button asChild className="bg-[#2D5A3D] hover:bg-[#234a30]">
                  <Link href="/recipes">Browse Recipes</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Remove Confirmation Dialog */}
      <AlertDialog open={!!recipeToRemove} onOpenChange={() => setRecipeToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from saved recipes?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the recipe from your saved collection. You can always save
              it again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveRecipe}
              disabled={removing}
              className="bg-red-600 hover:bg-red-700"
            >
              {removing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
