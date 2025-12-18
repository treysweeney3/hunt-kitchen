import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { getOrCreateCart, getOrCreateSessionId } from "@/lib/cart-utils";
import { z } from "zod";

// Validation schema for adding items
const addItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  variantId: z.string().optional().nullable(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

/**
 * POST /api/cart/items
 * Add item to cart or update quantity if already exists
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = addItemSchema.safeParse(body);

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

    const { productId, variantId, quantity } = validation.data;

    // Get user session
    const session = await getServerSession();
    const userId = session?.user?.id;

    // Get or create session ID for guests
    const sessionId = !userId ? await getOrCreateSessionId() : null;

    // Get or create cart
    const cart = await getOrCreateCart(userId, sessionId);

    // Verify product exists and is active
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found",
        },
        { status: 404 }
      );
    }

    if (!product.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "Product is not available",
        },
        { status: 400 }
      );
    }

    // If variant specified, verify it exists and is active
    if (variantId) {
      const variant = product.variants.find((v) => v.id === variantId);

      if (!variant) {
        return NextResponse.json(
          {
            success: false,
            error: "Variant not found",
          },
          { status: 404 }
        );
      }

      if (!variant.isActive) {
        return NextResponse.json(
          {
            success: false,
            error: "Variant is not available",
          },
          { status: 400 }
        );
      }

      // Check inventory for variant
      if (product.trackInventory && variant.inventoryQty < quantity) {
        return NextResponse.json(
          {
            success: false,
            error: `Only ${variant.inventoryQty} items in stock`,
          },
          { status: 400 }
        );
      }
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;

      // Check inventory again for new quantity
      if (product.trackInventory) {
        const variant = variantId
          ? product.variants.find((v) => v.id === variantId)
          : null;
        const availableQty = variant ? variant.inventoryQty : Infinity;

        if (availableQty < newQuantity) {
          return NextResponse.json(
            {
              success: false,
              error: `Only ${availableQty} items in stock`,
            },
            { status: 400 }
          );
        }
      }

      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          product: true,
          variant: true,
        },
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
    }

    // Create new cart item
    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
        quantity,
      },
      include: {
        product: true,
        variant: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Item added to cart",
        data: {
          item: {
            id: cartItem.id,
            productId: cartItem.productId,
            variantId: cartItem.variantId,
            quantity: cartItem.quantity,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add item to cart",
      },
      { status: 500 }
    );
  }
}
