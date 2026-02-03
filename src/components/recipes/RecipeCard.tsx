"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Clock, Copy, Star } from "lucide-react";
import { Recipe } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/lib/constants";

interface RecipeCardProps {
  recipe: Recipe;
  onSave?: (recipeSlug: string, recipeId: string) => Promise<void>;
  isSaved?: boolean;
  className?: string;
}

export function RecipeCard({
  recipe,
  onSave,
  isSaved = false,
  className,
}: RecipeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(isSaved);

  // Sync saved state with prop when it changes
  useEffect(() => {
    setSaved(isSaved);
  }, [isSaved]);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!onSave) {
      toast.error("Please log in to save recipes");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(recipe.slug, recipe.id);
      setSaved(!saved);
      toast.success(saved ? "Recipe removed from favorites" : "Recipe saved to favorites");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save recipe");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}/recipes/${recipe.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;
  const averageRating = recipe.averageRating || 0;
  const ratingCount = recipe.ratingCount || 0;

  return (
    <Link href={`/recipes/${recipe.slug}`}>
      <Card
        className={cn(
          "group overflow-hidden transition-all hover:shadow-lg py-0",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardContent className="p-0">
          {/* Featured Image */}
          <div className="relative overflow-hidden bg-muted">
            <AspectRatio ratio={4 / 3}>
              <Image
                src={getImageUrl(recipe.featuredImageUrl, 'recipe')}
                alt={recipe.title}
                fill
                className={cn(
                  "object-cover transition-transform duration-300",
                  isHovered && "scale-110"
                )}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </AspectRatio>

            {/* Save Button Overlay */}
            <div className="absolute top-3 right-3 flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="h-9 w-9 bg-white/90 hover:bg-white backdrop-blur-sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Heart
                  className={cn(
                    "h-4 w-4 transition-colors",
                    saved ? "fill-red-500 text-red-500" : "text-gray-700"
                  )}
                />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-9 w-9 bg-white/90 hover:bg-white backdrop-blur-sm"
                onClick={handleCopyLink}
              >
                <Copy className="h-4 w-4 text-gray-700" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Game Type Badges */}
            <div className="flex flex-wrap gap-2">
              {recipe.gameType && (
                <Badge
                  variant="secondary"
                  className="bg-[#2D5A3D] text-white hover:bg-[#234a30]"
                >
                  {recipe.gameType.name}
                </Badge>
              )}
              {recipe.categories?.slice(0, 2).map((category) => (
                <Badge
                  key={category.id}
                  variant="outline"
                  className="border-[#2D5A3D] text-[#2D5A3D]"
                >
                  {category.name}
                </Badge>
              ))}
            </div>

            {/* Title */}
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-[#E07C24] transition-colors">
              {recipe.title}
            </h3>

            {/* Time Display */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>Prep: {recipe.prepTimeMinutes}m</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>Cook: {recipe.cookTimeMinutes}m</span>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-4 w-4",
                      star <= averageRating
                        ? "fill-[#E07C24] text-[#E07C24]"
                        : "fill-gray-200 text-gray-200"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {averageRating > 0 ? (
                  <>
                    {averageRating.toFixed(1)} ({ratingCount})
                  </>
                ) : (
                  "No ratings yet"
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
