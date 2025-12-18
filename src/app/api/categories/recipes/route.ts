import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.recipeCategory.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        displayOrder: "asc",
      },
      include: {
        _count: {
          select: {
            recipes: {
              where: {
                recipe: {
                  isPublished: true,
                },
              },
            },
          },
        },
      },
    });

    const formattedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.imageUrl,
      displayOrder: category.displayOrder,
      recipesCount: category._count.recipes,
    }));

    return NextResponse.json({ categories: formattedCategories });
  } catch (error) {
    console.error("Error fetching recipe categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipe categories" },
      { status: 500 }
    );
  }
}
