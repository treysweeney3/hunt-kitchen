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

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    // Full-text search across multiple fields
    const where = {
      isPublished: true,
      OR: [
        { title: { contains: query, mode: "insensitive" as const } },
        { description: { contains: query, mode: "insensitive" as const } },
        { tips: { contains: query, mode: "insensitive" as const } },
      ],
    };

    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        orderBy: {
          viewCount: "desc", // Show popular results first
        },
        skip,
        take: limit,
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
      }),
      prisma.recipe.count({ where }),
    ]);

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
      };
    });

    return NextResponse.json({
      recipes: recipesWithRatings,
      query,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error searching recipes:", error);
    return NextResponse.json(
      { error: "Failed to search recipes" },
      { status: 500 }
    );
  }
}
