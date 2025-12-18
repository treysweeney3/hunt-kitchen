import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Type for request body
interface RateRecipeBody {
  rating: number;
  reviewText?: string;
  userId?: string; // Optional - allows anonymous ratings
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body: RateRecipeBody = await request.json();

    // Validate rating
    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if recipe exists
    const recipe = await prisma.recipe.findUnique({
      where: { slug },
    });

    if (!recipe) {
      return NextResponse.json(
        { error: "Recipe not found" },
        { status: 404 }
      );
    }

    // Check if user already rated this recipe
    if (body.userId) {
      const existingRating = await prisma.recipeRating.findFirst({
        where: {
          recipeId: recipe.id,
          userId: body.userId,
        },
      });

      if (existingRating) {
        return NextResponse.json(
          { error: "You have already rated this recipe" },
          { status: 400 }
        );
      }
    }

    // Create rating
    const rating = await prisma.recipeRating.create({
      data: {
        recipeId: recipe.id,
        userId: body.userId || null,
        rating: body.rating,
        reviewText: body.reviewText || null,
        isApproved: false, // Requires admin approval
      },
      include: {
        user: body.userId
          ? {
              select: {
                firstName: true,
                lastName: true,
              },
            }
          : false,
      },
    });

    return NextResponse.json({
      message: "Rating submitted successfully. It will appear after approval.",
      rating: {
        id: rating.id,
        rating: rating.rating,
        reviewText: rating.reviewText,
        createdAt: rating.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error submitting rating:", error);
    return NextResponse.json(
      { error: "Failed to submit rating" },
      { status: 500 }
    );
  }
}
