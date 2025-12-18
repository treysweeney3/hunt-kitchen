import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    // Sort
    const sort = searchParams.get("sort") || "newest"; // newest, price_asc, price_desc, name

    // Find category
    const category = await prisma.productCategory.findUnique({
      where: { slug, isActive: true },
      include: {
        children: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Get all category IDs to include (category + children)
    const categoryIds = [category.id, ...category.children.map((c) => c.id)];

    // Build orderBy
    let orderBy: any = {};
    switch (sort) {
      case "price_asc":
        orderBy = { basePrice: "asc" };
        break;
      case "price_desc":
        orderBy = { basePrice: "desc" };
        break;
      case "name":
        orderBy = { name: "asc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    // Fetch products
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
          categoryId: {
            in: categoryIds,
          },
        },
        orderBy,
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
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
      }),
      prisma.product.count({
        where: {
          isActive: true,
          categoryId: {
            in: categoryIds,
          },
        },
      }),
    ]);

    // Format products with stock info
    const productsWithStock = products.map((product) => {
      let inStock = true;
      let totalInventory = 0;

      if (product.trackInventory) {
        if (product.variants.length > 0) {
          totalInventory = product.variants.reduce(
            (sum, v) => sum + v.inventoryQty,
            0
          );
          inStock = totalInventory > 0;
        } else {
          inStock = false;
        }
      }

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        shortDescription: product.shortDescription,
        basePrice: product.basePrice,
        compareAtPrice: product.compareAtPrice,
        featuredImageUrl: product.featuredImageUrl,
        category: product.category,
        productType: product.productType,
        inStock,
      };
    });

    return NextResponse.json({
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        imageUrl: category.imageUrl,
        parent: category.parent,
        children: category.children,
      },
      products: productsWithStock,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return NextResponse.json(
      { error: "Failed to fetch products by category" },
      { status: 500 }
    );
  }
}
