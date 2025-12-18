import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const [savedRecipes, total] = await Promise.all([
      prisma.savedRecipe.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          recipe: {
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
                where: { isApproved: true },
                select: {
                  rating: true,
                },
              },
            },
          },
        },
      }),
      prisma.savedRecipe.count({ where: { userId } }),
    ]);

    // Format recipes with ratings
    const recipes = savedRecipes.map((saved) => {
      const recipe = saved.recipe;
      const avgRating = recipe.ratings.length > 0
        ? recipe.ratings.reduce((sum, r) => sum + r.rating, 0) / recipe.ratings.length
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
        averageRating: Math.round(avgRating * 10) / 10,
        ratingsCount: recipe.ratings.length,
        savedAt: saved.createdAt,
      };
    });

    return NextResponse.json({
      recipes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching saved recipes:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved recipes" },
      { status: 500 }
    );
  }
}
