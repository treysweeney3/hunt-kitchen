import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

interface RateRecipeBody {
  rating: number;
  reviewText?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to rate recipes" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { slug } = await params;
    const body: RateRecipeBody = await request.json();

    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const recipe = await prisma.recipe.findUnique({
      where: { slug },
    });

    if (!recipe) {
      return NextResponse.json(
        { error: "Recipe not found" },
        { status: 404 }
      );
    }

    const existingRating = await prisma.recipeRating.findFirst({
      where: {
        recipeId: recipe.id,
        userId,
      },
    });

    if (existingRating) {
      return NextResponse.json(
        { error: "You have already rated this recipe" },
        { status: 400 }
      );
    }

    const rating = await prisma.recipeRating.create({
      data: {
        recipeId: recipe.id,
        userId,
        rating: body.rating,
        reviewText: body.reviewText || null,
        isApproved: true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Review submitted successfully!",
      rating: {
        id: rating.id,
        recipeId: rating.recipeId,
        userId: rating.userId,
        rating: rating.rating,
        reviewText: rating.reviewText,
        isApproved: rating.isApproved,
        createdAt: rating.createdAt,
        updatedAt: rating.updatedAt,
        user: rating.user,
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
