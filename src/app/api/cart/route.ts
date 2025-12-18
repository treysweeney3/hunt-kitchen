import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import {
  getOrCreateCart,
  getOrCreateSessionId,
  calculateCartTotals,
} from "@/lib/cart-utils";

/**
 * GET /api/cart
 * Get current cart with all items
 */
export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession();
    const userId = session?.user?.id;

    // Get or create session ID for guests
    const sessionId = !userId ? await getOrCreateSessionId() : null;

    // Get or create cart
    const cart = await getOrCreateCart(userId, sessionId);

    // Get applied discount if any
    const searchParams = request.nextUrl.searchParams;
    const discountCodeId = searchParams.get("discountCodeId");

    // Calculate totals
    const totals = await calculateCartTotals(cart.id, discountCodeId);

    // Format response
    const formattedItems = cart.items.map((item) => ({
      id: item.id,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        featuredImageUrl: item.product.featuredImageUrl,
        basePrice: Number(item.product.basePrice),
      },
      variant: item.variant
        ? {
            id: item.variant.id,
            name: item.variant.name,
            price: item.variant.price ? Number(item.variant.price) : null,
            imageUrl: item.variant.imageUrl,
            inventoryQty: item.variant.inventoryQty,
          }
        : null,
      quantity: item.quantity,
      price: item.variant?.price
        ? Number(item.variant.price)
        : Number(item.product.basePrice),
      lineTotal:
        (item.variant?.price
          ? Number(item.variant.price)
          : Number(item.product.basePrice)) * item.quantity,
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          cart: {
            id: cart.id,
            itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
            items: formattedItems,
          },
          totals,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch cart",
      },
      { status: 500 }
    );
  }
}
