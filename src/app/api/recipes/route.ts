import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Recipe } from "@/generated/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    // Filters
    const gameType = searchParams.get("game_type");
    const category = searchParams.get("category");
    const cookTime = searchParams.get("cook_time");
    const search = searchParams.get("search");

    // Sort
    const sortBy = searchParams.get("sort") || "newest"; // newest, popular, rating

    // Build where clause
    const where: any = {
      isPublished: true,
    };

    if (gameType) {
      where.gameType = {
        slug: gameType,
      };
    }

    if (category) {
      where.categories = {
        some: {
          category: {
            slug: category,
          },
        },
      };
    }

    if (cookTime) {
      const maxTime = parseInt(cookTime);
      where.totalTimeMinutes = {
        lte: maxTime,
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy
    let orderBy: any = {};
    switch (sortBy) {
      case "popular":
        orderBy = { viewCount: "desc" };
        break;
      case "rating":
        // For rating sort, we'll need to aggregate ratings
        orderBy = { createdAt: "desc" }; // Fallback for now
        break;
      case "newest":
      default:
        orderBy = { publishedAt: "desc" };
        break;
    }

    // Fetch recipes
    const [recipes, total] = await Promise.all([
      prisma.recipe.findMany({
        where,
        orderBy,
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
            where: { isApproved: true },
            select: {
              rating: true,
            },
          },
        },
      }),
      prisma.recipe.count({ where }),
    ]);

    // Calculate average ratings
    const recipesWithRatings = recipes.map((recipe) => {
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
        isFeatured: recipe.isFeatured,
        publishedAt: recipe.publishedAt,
        averageRating: Math.round(avgRating * 10) / 10,
        ratingsCount: recipe.ratings.length,
      };
    });

    return NextResponse.json({
      recipes: recipesWithRatings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipes" },
      { status: 500 }
    );
  }
}
