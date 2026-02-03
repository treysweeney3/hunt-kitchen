import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { slug } = await params;

    const recipe = await prisma.recipe.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!recipe) {
      return NextResponse.json(
        { error: "Recipe not found" },
        { status: 404 }
      );
    }

    // Fetch all ratings for the recipe
    const allRatings = await prisma.recipeRating.findMany({
      where: {
        recipeId: recipe.id,
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
      orderBy: { createdAt: "desc" },
    });

    // Filter to approved ratings for display
    const approvedRatings = allRatings.filter((r) => r.isApproved);

    // Fetch user's own rating (even if not approved, so they can see it)
    let userRating = null;
    if (session?.user?.id) {
      const ownRating = await prisma.recipeRating.findFirst({
        where: {
          recipeId: recipe.id,
          userId: session.user.id,
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

      if (ownRating) {
        userRating = {
          id: ownRating.id,
          recipeId: ownRating.recipeId,
          userId: ownRating.userId,
          rating: ownRating.rating,
          reviewText: ownRating.reviewText,
          isApproved: ownRating.isApproved,
          createdAt: ownRating.createdAt,
          updatedAt: ownRating.updatedAt,
          user: ownRating.user,
        };
      }
    }

    // Calculate average from ALL ratings (not just approved), rounded to 1 decimal
    const ratingCount = allRatings.length;
    const averageRating =
      ratingCount > 0
        ? Math.round((allRatings.reduce((sum, r) => sum + r.rating, 0) / ratingCount) * 10) / 10
        : 0;

    return NextResponse.json({
      averageRating,
      ratingCount,
      ratings: approvedRatings.map((r) => ({
        id: r.id,
        recipeId: r.recipeId,
        userId: r.userId,
        rating: r.rating,
        reviewText: r.reviewText,
        isApproved: r.isApproved,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        user: r.user,
      })),
      userRating,
    });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return NextResponse.json(
      { error: "Failed to fetch ratings" },
      { status: 500 }
    );
  }
}
