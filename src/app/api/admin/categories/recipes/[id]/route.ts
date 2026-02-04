import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, slug, description, imageUrl, displayOrder, isActive } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    const existingCategory = await prisma.recipeCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if slug is taken by another category
    const slugConflict = await prisma.recipeCategory.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    });

    if (slugConflict) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 400 }
      );
    }

    // Validate displayOrder uniqueness if it changed
    if (displayOrder !== undefined && displayOrder !== existingCategory.displayOrder) {
      const orderConflict = await prisma.recipeCategory.findFirst({
        where: {
          displayOrder,
          NOT: { id },
        },
      });

      if (orderConflict) {
        return NextResponse.json(
          { error: `Display order ${displayOrder} is already used by "${orderConflict.name}"` },
          { status: 400 }
        );
      }
    }

    const category = await prisma.recipeCategory.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
        imageUrl: imageUrl || null,
        displayOrder: displayOrder ?? existingCategory.displayOrder,
        isActive: isActive ?? existingCategory.isActive,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating recipe category:", error);
    return NextResponse.json(
      { error: "Failed to update recipe category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existingCategory = await prisma.recipeCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { recipes: true },
        },
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    if (existingCategory._count.recipes > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category with ${existingCategory._count.recipes} associated recipe(s). Remove recipes first.`,
        },
        { status: 400 }
      );
    }

    await prisma.recipeCategory.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting recipe category:", error);
    return NextResponse.json(
      { error: "Failed to delete recipe category" },
      { status: 500 }
    );
  }
}
