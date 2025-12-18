import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            parent: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        variants: {
          where: { isActive: true },
          orderBy: {
            name: "asc",
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Calculate stock information
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

    // Extract variant options for UI
    const variantOptions: {
      option1?: string[];
      option2?: string[];
      option3?: string[];
    } = {};

    if (product.variants.length > 0) {
      const option1Values = new Set<string>();
      const option2Values = new Set<string>();
      const option3Values = new Set<string>();

      product.variants.forEach((variant) => {
        if (variant.option1Value) option1Values.add(variant.option1Value);
        if (variant.option2Value) option2Values.add(variant.option2Value);
        if (variant.option3Value) option3Values.add(variant.option3Value);
      });

      if (option1Values.size > 0) {
        variantOptions.option1 = Array.from(option1Values);
      }
      if (option2Values.size > 0) {
        variantOptions.option2 = Array.from(option2Values);
      }
      if (option3Values.size > 0) {
        variantOptions.option3 = Array.from(option3Values);
      }
    }

    const productData = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      productType: product.productType,
      basePrice: product.basePrice,
      compareAtPrice: product.compareAtPrice,
      sku: product.sku,
      barcode: product.barcode,
      trackInventory: product.trackInventory,
      weightOz: product.weightOz,
      featuredImageUrl: product.featuredImageUrl,
      galleryImages: product.galleryImages,
      isFeatured: product.isFeatured,
      category: product.category,
      variants: product.variants,
      variantOptions,
      inStock,
      totalInventory,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
    };

    return NextResponse.json(productData);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
