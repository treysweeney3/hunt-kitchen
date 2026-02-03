"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface QuickRatingProps {
  recipeSlug: string;
  averageRating: number;
  ratingCount: number;
  userRating: number | null;
  onRatingSubmitted?: () => void;
}

export function QuickRating({
  recipeSlug,
  averageRating,
  ratingCount,
  userRating,
  onRatingSubmitted,
}: QuickRatingProps) {
  const { isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submittedRating, setSubmittedRating] = useState<number | null>(userRating);
  const hasRated = submittedRating !== null;

  const handleRatingClick = async (rating: number) => {
    if (!isAuthenticated) {
      toast.error("Please log in to rate this recipe");
      return;
    }

    if (hasRated) {
      toast.info("You've already rated this recipe");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/recipes/${recipeSlug}/rate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit rating");
      }

      setSubmittedRating(rating);
      toast.success("Rating submitted!");
      onRatingSubmitted?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit rating");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show: hovered rating > user's rating > empty (0) for input
  const displayRating = hoveredRating || submittedRating || 0;
  const canRate = isAuthenticated && !hasRated && !isSubmitting;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold text-[#4A3728]">
          {averageRating.toFixed(1)}
        </span>
        <div>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                disabled={!canRate}
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => canRate && setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className={cn(
                  "transition-transform",
                  canRate && "hover:scale-110 cursor-pointer",
                  !canRate && "cursor-default"
                )}
              >
                <Star
                  className={cn(
                    "h-5 w-5",
                    star <= displayRating
                      ? "fill-[#E07C24] text-[#E07C24]"
                      : "fill-gray-200 text-gray-200"
                  )}
                />
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {ratingCount} {ratingCount === 1 ? "rating" : "ratings"}
          </p>
        </div>
      </div>
      {!isAuthenticated && (
        <p className="text-xs text-muted-foreground">Log in to rate</p>
      )}
      {isAuthenticated && hasRated && (
        <p className="text-xs text-[#2D5A3D]">Your rating: {submittedRating} stars</p>
      )}
      {isAuthenticated && !hasRated && (
        <p className="text-xs text-muted-foreground">Click to rate</p>
      )}
    </div>
  );
}
