import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const recipes = await prisma.recipe.findMany({
      where: {
        isPublished: true,
        isFeatured: true,
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 8,
      include: {
        gameType: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        ratings: {
          select: {
            rating: true,
          },
        },
      },
    });

    // Calculate average ratings from ALL ratings, rounded to 1 decimal
    const recipesWithRatings = recipes.map((recipe) => {
      const avgRating = recipe.ratings.length > 0
        ? Math.round((recipe.ratings.reduce((sum, r) => sum + r.rating, 0) / recipe.ratings.length) * 10) / 10
        : 0;

      return {
        id: recipe.id,
        title: recipe.title,
        slug: recipe.slug,
        description: recipe.description,
        featuredImageUrl: recipe.featuredImageUrl,
        gameType: recipe.gameType,
        categories: recipe.categories.map((c) => c.category),
        prepTimeMinutes: recipe.prepTimeMinutes,
        cookTimeMinutes: recipe.cookTimeMinutes,
        totalTimeMinutes: recipe.totalTimeMinutes,
        servings: recipe.servings,
        viewCount: recipe.viewCount,
        averageRating: avgRating,
        ratingCount: recipe.ratings.length,
        publishedAt: recipe.publishedAt,
      };
    });

    return NextResponse.json({ recipes: recipesWithRatings });
  } catch (error) {
    console.error("Error fetching featured recipes:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured recipes" },
      { status: 500 }
    );
  }
}
