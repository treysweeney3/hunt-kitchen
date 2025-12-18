import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const recipe = await prisma.recipe.findUnique({
      where: { slug, isPublished: true },
      include: {
        gameType: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
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
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!recipe) {
      return NextResponse.json(
        { error: "Recipe not found" },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.recipe.update({
      where: { id: recipe.id },
      data: { viewCount: { increment: 1 } },
    });

    // Calculate average rating
    const avgRating = recipe.ratings.length > 0
      ? recipe.ratings.reduce((sum, r) => sum + r.rating, 0) / recipe.ratings.length
      : 0;

    // Format reviews
    const reviews = recipe.ratings.map((rating) => ({
      id: rating.id,
      rating: rating.rating,
      reviewText: rating.reviewText,
      createdAt: rating.createdAt,
      user: rating.user
        ? {
            name: `${rating.user.firstName} ${rating.user.lastName}`,
          }
        : null,
    }));

    const recipeData = {
      id: recipe.id,
      title: recipe.title,
      slug: recipe.slug,
      description: recipe.description,
      featuredImageUrl: recipe.featuredImageUrl,
      galleryImages: recipe.galleryImages,
      gameType: recipe.gameType,
      categories: recipe.categories.map((c) => c.category),
      prepTimeMinutes: recipe.prepTimeMinutes,
      cookTimeMinutes: recipe.cookTimeMinutes,
      totalTimeMinutes: recipe.totalTimeMinutes,
      servings: recipe.servings,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      tips: recipe.tips,
      nutritionInfo: recipe.nutritionInfo,
      videoUrl: recipe.videoUrl,
      viewCount: recipe.viewCount + 1, // Include the incremented count
      averageRating: Math.round(avgRating * 10) / 10,
      ratingsCount: recipe.ratings.length,
      reviews,
      publishedAt: recipe.publishedAt,
      metaTitle: recipe.metaTitle,
      metaDescription: recipe.metaDescription,
    };

    return NextResponse.json(recipeData);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipe" },
      { status: 500 }
    );
  }
}
