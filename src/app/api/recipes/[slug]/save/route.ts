import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET - Check if recipe is saved by current user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ isSaved: false });
    }

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

    const savedRecipe = await prisma.savedRecipe.findUnique({
      where: {
        userId_recipeId: {
          userId: session.user.id,
          recipeId: recipe.id,
        },
      },
    });

    return NextResponse.json({ isSaved: !!savedRecipe });
  } catch (error) {
    console.error("Error checking saved status:", error);
    return NextResponse.json(
      { error: "Failed to check saved status" },
      { status: 500 }
    );
  }
}

// POST - Save recipe for current user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to save recipes" },
        { status: 401 }
      );
    }

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

    // Check if already saved
    const existingSave = await prisma.savedRecipe.findUnique({
      where: {
        userId_recipeId: {
          userId: session.user.id,
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

    await prisma.savedRecipe.create({
      data: {
        userId: session.user.id,
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

// DELETE - Unsave recipe for current user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to unsave recipes" },
        { status: 401 }
      );
    }

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

    await prisma.savedRecipe.delete({
      where: {
        userId_recipeId: {
          userId: session.user.id,
          recipeId: recipe.id,
        },
      },
    });

    return NextResponse.json({ message: "Recipe unsaved successfully" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Recipe was not saved" },
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
