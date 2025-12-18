"use client";

import { Recipe } from "@/types";
import { RecipeCard } from "./RecipeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecipeGridProps {
  recipes: Recipe[];
  onSaveRecipe?: (recipeId: string) => Promise<void>;
  savedRecipeIds?: string[];
  isLoading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function RecipeGrid({
  recipes,
  onSaveRecipe,
  savedRecipeIds = [],
  isLoading = false,
  emptyMessage = "No recipes found. Try adjusting your filters.",
  className,
}: RecipeGridProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
          className
        )}
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <RecipeCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-16", className)}>
        <div className="rounded-full bg-muted p-6 mb-4">
          <UtensilsCrossed className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Recipes Found</h3>
        <p className="text-muted-foreground text-center max-w-md">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
        className
      )}
    >
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          onSave={onSaveRecipe}
          isSaved={savedRecipeIds.includes(recipe.id)}
        />
      ))}
    </div>
  );
}

function RecipeCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <AspectRatio ratio={4 / 3}>
          <Skeleton className="w-full h-full" />
        </AspectRatio>
        <div className="p-4 space-y-3">
          {/* Badges */}
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
          {/* Title */}
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
          {/* Time */}
          <div className="flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
          {/* Rating */}
          <Skeleton className="h-4 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}
