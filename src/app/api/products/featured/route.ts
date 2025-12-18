import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
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
    });

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
        shortDescription: product.shortDescription,
        basePrice: product.basePrice,
        compareAtPrice: product.compareAtPrice,
        featuredImageUrl: product.featuredImageUrl,
        category: product.category,
        productType: product.productType,
        inStock,
      };
    });

    return NextResponse.json({ products: productsWithStock });
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured products" },
      { status: 500 }
    );
  }
}
