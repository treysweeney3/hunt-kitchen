import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Type for request body
interface SaveRecipeBody {
  userId: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body: SaveRecipeBody = await request.json();

    if (!body.userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if recipe exists
    const recipe = await prisma.recipe.findUnique({
      where: { slug },
    });

    if (!recipe) {
      return NextResponse.json(
        { error: "Recipe not found" },
        { status: 404 }
      );
    }

    // Check if already saved
    const existingSave = await prisma.savedRecipe.findUnique({
      where: {
        userId_recipeId: {
          userId: body.userId,
          recipeId: recipe.id,
        },
      },
    });

    if (existingSave) {
      return NextResponse.json(
        { error: "Recipe already saved" },
        { status: 400 }
      );
    }

    // Save recipe
    await prisma.savedRecipe.create({
      data: {
        userId: body.userId,
        recipeId: recipe.id,
      },
    });

    return NextResponse.json(
      { message: "Recipe saved successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving recipe:", error);
    return NextResponse.json(
      { error: "Failed to save recipe" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Find recipe by slug
    const recipe = await prisma.recipe.findUnique({
      where: { slug },
    });

    if (!recipe) {
      return NextResponse.json(
        { error: "Recipe not found" },
        { status: 404 }
      );
    }

    // Delete saved recipe
    await prisma.savedRecipe.delete({
      where: {
        userId_recipeId: {
          userId,
          recipeId: recipe.id,
        },
      },
    });

    return NextResponse.json({
      message: "Recipe unsaved successfully",
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Saved recipe not found" },
        { status: 404 }
      );
    }
    console.error("Error unsaving recipe:", error);
    return NextResponse.json(
      { error: "Failed to unsave recipe" },
      { status: 500 }
    );
  }
}
