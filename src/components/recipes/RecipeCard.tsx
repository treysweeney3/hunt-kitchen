"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Clock, Share2, Star } from "lucide-react";
import { Recipe } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  const getShareUrl = () => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/recipes/${recipe.slug}`;
  };

  const shareLinks = {
    twitter: () => {
      const url = getShareUrl();
      const text = encodeURIComponent(`Check out this recipe: ${recipe.title}`);
      return `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${text}`;
    },
    facebook: () => {
      const url = getShareUrl();
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    },
    pinterest: () => {
      const url = getShareUrl();
      const description = encodeURIComponent(recipe.title);
      const media = encodeURIComponent(getImageUrl(recipe.featuredImageUrl, 'recipe'));
      return `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${description}&media=${media}`;
    },
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
                className="h-9 w-9 bg-white/90 hover:bg-white hover:scale-110 hover:shadow-md backdrop-blur-sm transition-all duration-200"
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-9 w-9 bg-white/90 hover:bg-white hover:scale-110 hover:shadow-md backdrop-blur-sm transition-all duration-200"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Share2 className="h-4 w-4 text-gray-700" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem asChild>
                    <a
                      href={shareLinks.twitter()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      Share on X
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a
                      href={shareLinks.facebook()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Share on Facebook
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a
                      href={shareLinks.pinterest()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                      </svg>
                      Share on Pinterest
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
