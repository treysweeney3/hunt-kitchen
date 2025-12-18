import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getOrCreateCart, getOrCreateSessionId, validateCartInventory } from "@/lib/cart-utils";

/**
 * POST /api/checkout/validate
 * Validate cart items before proceeding to checkout
 * - Checks product availability
 * - Verifies inventory levels
 * - Validates pricing
 */
export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession();
    const userId = session?.user?.id;

    // Get or create session ID for guests
    const sessionId = !userId ? await getOrCreateSessionId() : null;

    // Get cart with items
    const cart = await getOrCreateCart(userId, sessionId);

    if (cart.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cart is empty",
          valid: false,
        },
        { status: 400 }
      );
    }

    // Validate inventory
    const inventoryErrors = await validateCartInventory(cart.id);

    if (inventoryErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          errors: inventoryErrors,
        },
        { status: 400 }
      );
    }

    // Calculate cart totals for validation
    let subtotal = 0;
    const validatedItems = [];

    for (const item of cart.items) {
      const product = item.product;
      const variant = item.variant;

      // Get current price
      const currentPrice = variant?.price || product.basePrice;

      // Calculate line total
      const lineTotal = Number(currentPrice) * item.quantity;
      subtotal += lineTotal;

      validatedItems.push({
        id: item.id,
        productId: product.id,
        productName: product.name,
        variantId: variant?.id || null,
        variantName: variant?.name || null,
        quantity: item.quantity,
        unitPrice: Number(currentPrice),
        lineTotal,
      });
    }

    return NextResponse.json(
      {
        success: true,
        valid: true,
        data: {
          items: validatedItems,
          subtotal: Math.round(subtotal * 100) / 100,
          itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error validating cart:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to validate cart",
        valid: false,
      },
      { status: 500 }
    );
  }
}
