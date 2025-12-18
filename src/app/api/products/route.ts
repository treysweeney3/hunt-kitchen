import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    // Filters
    const category = searchParams.get("category");
    const inStock = searchParams.get("in_stock");
    const minPrice = searchParams.get("min_price");
    const maxPrice = searchParams.get("max_price");
    const sort = searchParams.get("sort") || "newest"; // newest, price_asc, price_desc, name

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (category) {
      where.category = {
        slug: category,
      };
    }

    if (minPrice || maxPrice) {
      where.basePrice = {};
      if (minPrice) {
        where.basePrice.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        where.basePrice.lte = parseFloat(maxPrice);
      }
    }

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
        where,
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
              id: true,
              name: true,
              price: true,
              compareAtPrice: true,
              inventoryQty: true,
              option1Name: true,
              option1Value: true,
              option2Name: true,
              option2Value: true,
              option3Name: true,
              option3Value: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Format products with stock info
    const productsWithStock = products.map((product) => {
      let inStockStatus = true;
      let totalInventory = 0;

      if (product.trackInventory) {
        if (product.variants.length > 0) {
          totalInventory = product.variants.reduce(
            (sum, v) => sum + v.inventoryQty,
            0
          );
          inStockStatus = totalInventory > 0;
        } else {
          inStockStatus = false; // No variants and tracking inventory
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
        isFeatured: product.isFeatured,
        productType: product.productType,
        inStock: inStockStatus,
        variantsCount: product.variants.length,
      };
    });

    // Apply in_stock filter if specified
    let filteredProducts = productsWithStock;
    if (inStock === "true") {
      filteredProducts = productsWithStock.filter((p) => p.inStock);
    } else if (inStock === "false") {
      filteredProducts = productsWithStock.filter((p) => !p.inStock);
    }

    return NextResponse.json({
      products: filteredProducts,
      pagination: {
        page,
        limit,
        total: inStock ? filteredProducts.length : total,
        totalPages: Math.ceil((inStock ? filteredProducts.length : total) / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
