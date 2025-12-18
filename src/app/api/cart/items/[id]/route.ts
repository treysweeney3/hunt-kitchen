import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Validation schema for updating quantity
const updateItemSchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

/**
 * PATCH /api/cart/items/[id]
 * Update cart item quantity
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Parse and validate request body
    const body = await request.json();
    const validation = updateItemSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { quantity } = validation.data;

    // Get user session
    const session = await getServerSession();
    const userId = session?.user?.id;

    // Find cart item and verify ownership
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: {
        cart: true,
        product: true,
        variant: true,
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        {
          success: false,
          error: "Cart item not found",
        },
        { status: 404 }
      );
    }

    // Verify cart ownership (user or session)
    if (userId && cartItem.cart.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 403 }
      );
    }

    // Check inventory if tracking is enabled
    if (cartItem.product.trackInventory) {
      const availableQty = cartItem.variant
        ? cartItem.variant.inventoryQty
        : Infinity;

      if (availableQty < quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Only ${availableQty} items in stock`,
          },
          { status: 400 }
        );
      }
    }

    // Update quantity
    const updatedItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Cart item updated",
        data: {
          item: {
            id: updatedItem.id,
            quantity: updatedItem.quantity,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating cart item:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update cart item",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart/items/[id]
 * Remove item from cart
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get user session
    const session = await getServerSession();
    const userId = session?.user?.id;

    // Find cart item and verify ownership
    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: {
        cart: true,
      },
    });

    if (!cartItem) {
      return NextResponse.json(
        {
          success: false,
          error: "Cart item not found",
        },
        { status: 404 }
      );
    }

    // Verify cart ownership (user or session)
    if (userId && cartItem.cart.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 403 }
      );
    }

    // Delete cart item
    await prisma.cartItem.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Item removed from cart",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing cart item:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to remove cart item",
      },
      { status: 500 }
    );
  }
}
