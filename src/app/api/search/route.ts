import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const limit = parseInt(searchParams.get("limit") || "10");

    const recipes = await prisma.recipe.findMany({
      where: {
        isPublished: true,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
      orderBy: {
        viewCount: "desc",
      },
      include: {
        gameType: {
          select: {
            name: true,
            slug: true,
          },
        },
        ratings: {
          select: {
            rating: true,
          },
        },
      },
    });

    // Calculate average from ALL ratings, rounded to 1 decimal
    const formattedRecipes = recipes.map((recipe) => {
      const avgRating = recipe.ratings.length > 0
        ? Math.round((recipe.ratings.reduce((sum, r) => sum + r.rating, 0) / recipe.ratings.length) * 10) / 10
        : 0;

      return {
        type: "recipe" as const,
        id: recipe.id,
        title: recipe.title,
        slug: recipe.slug,
        description: recipe.description,
        imageUrl: recipe.featuredImageUrl,
        gameType: recipe.gameType,
        totalTimeMinutes: recipe.totalTimeMinutes,
        averageRating: avgRating,
        ratingCount: recipe.ratings.length,
      };
    });

    return NextResponse.json({
      query,
      results: {
        recipes: formattedRecipes,
      },
      counts: {
        recipes: formattedRecipes.length,
        total: formattedRecipes.length,
      },
    });
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}
