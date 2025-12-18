import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { clearSessionId } from "@/lib/cart-utils";

/**
 * POST /api/cart/merge
 * Merge guest cart into user cart on login
 * This should be called after successful authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Get session ID from request body
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Session ID required",
        },
        { status: 400 }
      );
    }

    // Find guest cart
    const guestCart = await prisma.cart.findFirst({
      where: {
        sessionId,
        userId: null,
      },
      include: {
        items: true,
      },
    });

    // If no guest cart exists, nothing to merge
    if (!guestCart || guestCart.items.length === 0) {
      await clearSessionId();
      return NextResponse.json(
        {
          success: true,
          message: "No guest cart to merge",
          data: {
            mergedItems: 0,
          },
        },
        { status: 200 }
      );
    }

    // Find or create user cart
    let userCart = await prisma.cart.findFirst({
      where: {
        userId,
      },
      include: {
        items: true,
      },
    });

    if (!userCart) {
      // Create user cart
      userCart = await prisma.cart.create({
        data: {
          userId,
        },
        include: {
          items: true,
        },
      });
    }

    // Merge cart items
    let mergedCount = 0;
    let updatedCount = 0;

    for (const guestItem of guestCart.items) {
      // Check if user cart already has this item
      const existingItem = userCart.items.find(
        (item) =>
          item.productId === guestItem.productId &&
          item.variantId === guestItem.variantId
      );

      if (existingItem) {
        // Update quantity of existing item
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: existingItem.quantity + guestItem.quantity,
          },
        });
        updatedCount++;
      } else {
        // Add new item to user cart
        await prisma.cartItem.create({
          data: {
            cartId: userCart.id,
            productId: guestItem.productId,
            variantId: guestItem.variantId,
            quantity: guestItem.quantity,
          },
        });
        mergedCount++;
      }
    }

    // Delete guest cart and its items
    await prisma.cart.delete({
      where: { id: guestCart.id },
    });

    // Clear session cookie
    await clearSessionId();

    return NextResponse.json(
      {
        success: true,
        message: "Cart merged successfully",
        data: {
          mergedItems: mergedCount,
          updatedItems: updatedCount,
          totalItems: mergedCount + updatedCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error merging carts:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to merge carts",
      },
      { status: 500 }
    );
  }
}
