"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { RecipeRating as RecipeRatingType, RecipeRatingInput } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface RecipeRatingProps {
  recipeId: string;
  averageRating: number;
  ratingCount: number;
  ratings?: RecipeRatingType[];
  userRating?: RecipeRatingType | null;
  onSubmitRating?: (input: RecipeRatingInput) => Promise<void>;
  isAuthenticated?: boolean;
}

export function RecipeRating({
  recipeId,
  averageRating,
  ratingCount,
  ratings = [],
  userRating,
  onSubmitRating,
  isAuthenticated = false,
}: RecipeRatingProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
          <StarDisplay rating={averageRating} size="lg" />
          <div className="text-sm text-muted-foreground mt-1">
            {ratingCount} {ratingCount === 1 ? "rating" : "ratings"}
          </div>
        </div>
        {isAuthenticated && !userRating && (
          <div className="flex-1">
            <Button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-[#E07C24] hover:bg-[#c96b1f] text-white"
            >
              Write a Review
            </Button>
          </div>
        )}
        {!isAuthenticated && (
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              Log in to write a review
            </p>
          </div>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <ReviewForm
          recipeId={recipeId}
          onSubmit={async (input) => {
            setIsSubmitting(true);
            try {
              await onSubmitRating?.(input);
              setShowReviewForm(false);
              toast.success("Review submitted successfully");
            } catch (error) {
              toast.error("Failed to submit review");
            } finally {
              setIsSubmitting(false);
            }
          }}
          isSubmitting={isSubmitting}
          onCancel={() => setShowReviewForm(false)}
        />
      )}

      {/* User's Existing Rating */}
      {userRating && (
        <div className="bg-[#F5F2EB] rounded-lg p-4 border-2 border-[#2D5A3D]">
          <p className="text-sm font-medium mb-2">Your Review</p>
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 bg-[#2D5A3D]">
              <AvatarFallback className="bg-[#2D5A3D] text-white">
                {userRating.user?.firstName?.[0] || "U"}
                {userRating.user?.lastName?.[0] || ""}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">
                  {userRating.user?.firstName} {userRating.user?.lastName}
                </span>
                <StarDisplay rating={userRating.rating} size="sm" />
              </div>
              {userRating.reviewText && (
                <p className="text-sm text-muted-foreground">{userRating.reviewText}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(userRating.createdAt), "MMMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>
      )}

      <Separator />

      {/* Reviews List */}
      {(() => {
        const displayableReviews = ratings.filter(
          (rating) => rating.isApproved && rating.id !== userRating?.id
        );

        if (displayableReviews.length > 0) {
          return (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Reviews</h3>
              {displayableReviews.map((rating) => (
                <ReviewItem key={rating.id} rating={rating} />
              ))}
            </div>
          );
        }

        // Only show "No reviews yet" if there are truly no ratings at all
        if (ratingCount === 0 && !userRating) {
          return (
            <p className="text-center text-muted-foreground py-8">
              No reviews yet. Be the first to review this recipe!
            </p>
          );
        }

        return null;
      })()}
    </div>
  );
}

interface ReviewFormProps {
  recipeId: string;
  onSubmit: (input: RecipeRatingInput) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

function ReviewForm({ recipeId, onSubmit, isSubmitting, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    await onSubmit({
      recipeId,
      rating,
      reviewText: reviewText.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#F5F2EB] rounded-lg p-6 space-y-4">
      <div>
        <Label htmlFor="rating" className="text-base mb-2 block">
          Your Rating
        </Label>
        <InteractiveStarSelector
          rating={rating}
          hoveredRating={hoveredRating}
          onRatingChange={setRating}
          onHoverChange={setHoveredRating}
        />
      </div>
      <div>
        <Label htmlFor="review" className="text-base mb-2 block">
          Your Review (Optional)
        </Label>
        <Textarea
          id="review"
          placeholder="Share your thoughts about this recipe..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={4}
          className="resize-none bg-white"
        />
      </div>
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="bg-[#E07C24] hover:bg-[#c96b1f] text-white"
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

interface ReviewItemProps {
  rating: RecipeRatingType;
}

function ReviewItem({ rating }: ReviewItemProps) {
  const getInitials = () => {
    if (rating.user?.firstName && rating.user?.lastName) {
      return `${rating.user.firstName[0]}${rating.user.lastName[0]}`;
    }
    return "A";
  };

  return (
    <div className="flex items-start gap-3 pb-4 border-b last:border-b-0">
      <Avatar className="h-10 w-10 bg-[#4A3728]">
        <AvatarFallback className="bg-[#4A3728] text-white">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">
            {rating.user?.firstName || "Anonymous"}{" "}
            {rating.user?.lastName || ""}
          </span>
          <StarDisplay rating={rating.rating} size="sm" />
        </div>
        {rating.reviewText && (
          <p className="text-sm text-muted-foreground mb-1">{rating.reviewText}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {format(new Date(rating.createdAt), "MMMM d, yyyy")}
        </p>
      </div>
    </div>
  );
}

interface StarDisplayProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StarDisplay({ rating, size = "md", className }: StarDisplayProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClasses[size],
            star <= rating
              ? "fill-[#E07C24] text-[#E07C24]"
              : "fill-gray-200 text-gray-200"
          )}
        />
      ))}
    </div>
  );
}

interface InteractiveStarSelectorProps {
  rating: number;
  hoveredRating: number;
  onRatingChange: (rating: number) => void;
  onHoverChange: (rating: number) => void;
}

export function InteractiveStarSelector({
  rating,
  hoveredRating,
  onRatingChange,
  onHoverChange,
}: InteractiveStarSelectorProps) {
  const displayRating = hoveredRating || rating;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          onMouseEnter={() => onHoverChange(star)}
          onMouseLeave={() => onHoverChange(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              "h-8 w-8",
              star <= displayRating
                ? "fill-[#E07C24] text-[#E07C24]"
                : "fill-gray-200 text-gray-200"
            )}
          />
        </button>
      ))}
      {rating > 0 && (
        <span className="ml-2 text-sm text-muted-foreground">
          {rating} {rating === 1 ? "star" : "stars"}
        </span>
      )}
    </div>
  );
}
