import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch all active categories
    const categories = await prisma.productCategory.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        displayOrder: "asc",
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true,
          },
          orderBy: {
            displayOrder: "asc",
          },
        },
        _count: {
          select: {
            products: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
    });

    // Format categories with hierarchy
    const formattedCategories = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.imageUrl,
      displayOrder: category.displayOrder,
      parent: category.parent,
      children: category.children,
      productsCount: category._count.products,
    }));

    // Separate into parent and child categories for easier consumption
    const parentCategories = formattedCategories.filter((c) => !c.parent);
    const allCategories = formattedCategories;

    return NextResponse.json({
      categories: allCategories,
      parentCategories,
    });
  } catch (error) {
    console.error("Error fetching product categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch product categories" },
      { status: 500 }
    );
  }
}
