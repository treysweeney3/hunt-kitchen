"use client";

import { useState } from "react";
import Image from "next/image";
import { Clock, Users, Star, Heart, Printer, Share2, Copy, Facebook, Twitter } from "lucide-react";
import { Recipe } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RecipeHeroProps {
  recipe: Recipe;
  onSave?: (recipeId: string) => Promise<void>;
  isSaved?: boolean;
  className?: string;
}

export function RecipeHero({
  recipe,
  onSave,
  isSaved = false,
  className,
}: RecipeHeroProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(isSaved);

  const handleSave = async () => {
    if (!onSave) {
      toast.error("Please log in to save recipes");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(recipe.id);
      setSaved(!saved);
      toast.success(saved ? "Recipe removed from favorites" : "Recipe saved to favorites");
    } catch (error) {
      toast.error("Failed to save recipe");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/recipes/${recipe.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const handleShareFacebook = () => {
    const url = `${window.location.origin}/recipes/${recipe.slug}`;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const handleShareTwitter = () => {
    const url = `${window.location.origin}/recipes/${recipe.slug}`;
    const text = `Check out this recipe: ${recipe.title}`;
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const averageRating = recipe.averageRating || 0;
  const ratingCount = recipe.ratingCount || 0;
  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  return (
    <div className={cn("relative", className)}>
      {/* Hero Image */}
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-muted">
        <Image
          src={recipe.featuredImageUrl}
          alt={recipe.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container mx-auto px-4 pb-8 md:pb-12 space-y-4 text-white">
            {/* Game Type & Categories */}
            <div className="flex flex-wrap gap-2">
              {recipe.gameType && (
                <Badge className="bg-[#2D5A3D] text-white hover:bg-[#234a30] text-sm">
                  {recipe.gameType.name}
                </Badge>
              )}
              {recipe.categories?.slice(0, 3).map((category) => (
                <Badge
                  key={category.id}
                  variant="outline"
                  className="border-white text-white hover:bg-white/20 text-sm"
                >
                  {category.name}
                </Badge>
              ))}
              {recipe.isFeatured && (
                <Badge className="bg-[#E07C24] text-white hover:bg-[#c96b1f] text-sm">
                  Featured
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight max-w-4xl">
              {recipe.title}
            </h1>

            {/* Description */}
            {recipe.description && (
              <p className="text-lg md:text-xl text-white/90 max-w-3xl line-clamp-2">
                {recipe.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Meta Info Bar */}
      <div className="bg-[#F5F2EB] border-b border-[#4A3728]/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Recipe Stats */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              {/* Prep Time */}
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-white">
                  <Clock className="h-4 w-4 text-[#4A3728]" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Prep Time</div>
                  <div className="font-semibold text-[#4A3728]">
                    {recipe.prepTimeMinutes}m
                  </div>
                </div>
              </div>

              {/* Cook Time */}
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-white">
                  <Clock className="h-4 w-4 text-[#4A3728]" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Cook Time</div>
                  <div className="font-semibold text-[#4A3728]">
                    {recipe.cookTimeMinutes}m
                  </div>
                </div>
              </div>

              {/* Total Time */}
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-white">
                  <Clock className="h-4 w-4 text-[#4A3728]" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Total Time</div>
                  <div className="font-semibold text-[#4A3728]">{totalTime}m</div>
                </div>
              </div>

              {/* Servings */}
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-white">
                  <Users className="h-4 w-4 text-[#4A3728]" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Servings</div>
                  <div className="font-semibold text-[#4A3728]">
                    {recipe.servings}
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-white">
                  <Star className="h-4 w-4 text-[#E07C24] fill-[#E07C24]" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Rating</div>
                  <div className="font-semibold text-[#4A3728]">
                    {averageRating > 0 ? (
                      <>
                        {averageRating.toFixed(1)} ({ratingCount})
                      </>
                    ) : (
                      "Not rated"
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={isSaving}
                variant={saved ? "default" : "outline"}
                className={cn(
                  saved &&
                    "bg-[#2D5A3D] hover:bg-[#234a30] text-white"
                )}
              >
                <Heart
                  className={cn(
                    "h-4 w-4 mr-2",
                    saved && "fill-current"
                  )}
                />
                {saved ? "Saved" : "Save"}
              </Button>

              {/* Print Button */}
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Print</span>
              </Button>

              {/* Share Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Share2 className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">Share</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleCopyLink}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShareFacebook}>
                    <Facebook className="h-4 w-4 mr-2" />
                    Share on Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShareTwitter}>
                    <Twitter className="h-4 w-4 mr-2" />
                    Share on Twitter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
