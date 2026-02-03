import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET - Get current user's saved recipes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to view saved recipes" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const idsOnly = searchParams.get("idsOnly") === "true";

    // If only IDs requested, return just the recipe IDs
    if (idsOnly) {
      const savedRecipes = await prisma.savedRecipe.findMany({
        where: { userId: session.user.id },
        select: { recipeId: true },
      });

      return NextResponse.json({
        recipeIds: savedRecipes.map((sr) => sr.recipeId),
      });
    }

    // Full saved recipes with pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const [savedRecipes, total] = await Promise.all([
      prisma.savedRecipe.findMany({
        where: { userId: session.user.id },
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
                select: {
                  rating: true,
                },
              },
            },
          },
        },
      }),
      prisma.savedRecipe.count({ where: { userId: session.user.id } }),
    ]);

    // Format recipes with ratings
    const recipes = savedRecipes.map((saved) => {
      const recipe = saved.recipe;
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
