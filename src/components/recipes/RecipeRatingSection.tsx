"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { RecipeRating } from "./RecipeRating";
import type { RecipeRating as RecipeRatingType, RecipeRatingInput } from "@/types";

interface RecipeRatingSectionProps {
  recipeId: string;
  recipeSlug: string;
  averageRating: number;
  ratingCount: number;
  ratings: RecipeRatingType[];
  userRating: RecipeRatingType | null;
}

interface RatingsResponse {
  averageRating: number;
  ratingCount: number;
  ratings: RecipeRatingType[];
  userRating: RecipeRatingType | null;
}

export function RecipeRatingSection({
  recipeId,
  recipeSlug,
  averageRating: initialAverageRating,
  ratingCount: initialRatingCount,
  ratings: initialRatings,
  userRating: initialUserRating,
}: RecipeRatingSectionProps) {
  const { isAuthenticated } = useAuth();
  const [averageRating, setAverageRating] = useState(initialAverageRating);
  const [ratingCount, setRatingCount] = useState(initialRatingCount);
  const [ratings, setRatings] = useState<RecipeRatingType[]>(initialRatings);
  const [userRating, setUserRating] = useState<RecipeRatingType | null>(initialUserRating);

  const fetchRatings = useCallback(async () => {
    try {
      const response = await fetch(`/api/recipes/${recipeSlug}/ratings`);
      if (response.ok) {
        const data: RatingsResponse = await response.json();
        setAverageRating(data.averageRating);
        setRatingCount(data.ratingCount);
        setRatings(data.ratings);
        setUserRating(data.userRating);
      }
    } catch (error) {
      console.error("Failed to fetch ratings:", error);
    }
  }, [recipeSlug]);

  const handleSubmitRating = async (input: RecipeRatingInput) => {
    const response = await fetch(`/api/recipes/${recipeSlug}/rate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rating: input.rating,
        reviewText: input.reviewText,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to submit rating");
    }

    // Fetch updated ratings to show the new review immediately
    await fetchRatings();
  };

  return (
    <RecipeRating
      recipeId={recipeId}
      averageRating={averageRating}
      ratingCount={ratingCount}
      ratings={ratings}
      userRating={userRating}
      onSubmitRating={handleSubmitRating}
      isAuthenticated={isAuthenticated}
    />
  );
}
