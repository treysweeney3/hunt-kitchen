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

    // Search recipes
    const recipesPromise = prisma.recipe.findMany({
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
          where: { isApproved: true },
          select: {
            rating: true,
          },
        },
      },
    });

    // Search products
    const productsPromise = prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { shortDescription: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
        variants: {
          where: { isActive: true },
          select: {
            inventoryQty: true,
          },
        },
      },
    });

    const [recipes, products] = await Promise.all([
      recipesPromise,
      productsPromise,
    ]);

    // Format recipes
    const formattedRecipes = recipes.map((recipe) => {
      const avgRating = recipe.ratings.length > 0
        ? recipe.ratings.reduce((sum, r) => sum + r.rating, 0) / recipe.ratings.length
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
        averageRating: Math.round(avgRating * 10) / 10,
        ratingsCount: recipe.ratings.length,
      };
    });

    // Format products
    const formattedProducts = products.map((product) => {
      let inStock = true;
      if (product.trackInventory && product.variants.length > 0) {
        const totalInventory = product.variants.reduce(
          (sum, v) => sum + v.inventoryQty,
          0
        );
        inStock = totalInventory > 0;
      }

      return {
        type: "product" as const,
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.shortDescription || product.description,
        imageUrl: product.featuredImageUrl,
        category: product.category,
        price: product.basePrice,
        compareAtPrice: product.compareAtPrice,
        inStock,
      };
    });

    return NextResponse.json({
      query,
      results: {
        recipes: formattedRecipes,
        products: formattedProducts,
      },
      counts: {
        recipes: formattedRecipes.length,
        products: formattedProducts.length,
        total: formattedRecipes.length + formattedProducts.length,
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
