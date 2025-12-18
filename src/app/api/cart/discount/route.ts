import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { getOrCreateCart, getOrCreateSessionId } from "@/lib/cart-utils";
import { z } from "zod";

// Validation schema for applying discount
const applyDiscountSchema = z.object({
  code: z.string().min(1, "Discount code is required"),
});

/**
 * POST /api/cart/discount
 * Apply discount code to cart
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = applyDiscountSchema.safeParse(body);

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

    const { code } = validation.data;

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
          error: "Cannot apply discount to empty cart",
        },
        { status: 400 }
      );
    }

    // Find discount code (case-insensitive)
    const discountCode = await prisma.discountCode.findFirst({
      where: {
        code: {
          equals: code,
          mode: "insensitive",
        },
      },
    });

    if (!discountCode) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid discount code",
        },
        { status: 404 }
      );
    }

    // Verify discount is active
    if (!discountCode.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "This discount code is no longer active",
        },
        { status: 400 }
      );
    }

    // Check date validity
    const now = new Date();
    if (discountCode.startsAt && discountCode.startsAt > now) {
      return NextResponse.json(
        {
          success: false,
          error: "This discount code is not yet valid",
        },
        { status: 400 }
      );
    }

    if (discountCode.expiresAt && discountCode.expiresAt < now) {
      return NextResponse.json(
        {
          success: false,
          error: "This discount code has expired",
        },
        { status: 400 }
      );
    }

    // Check usage limits
    if (
      discountCode.usageLimit &&
      discountCode.usageCount >= discountCode.usageLimit
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "This discount code has reached its usage limit",
        },
        { status: 400 }
      );
    }

    // Check per-customer usage limit
    if (userId && discountCode.usageLimitPerCustomer) {
      const userUsageCount = await prisma.order.count({
        where: {
          userId,
          discountCodeId: discountCode.id,
        },
      });

      if (userUsageCount >= discountCode.usageLimitPerCustomer) {
        return NextResponse.json(
          {
            success: false,
            error: "You have already used this discount code the maximum number of times",
          },
          { status: 400 }
        );
      }
    }

    // Calculate cart subtotal
    let subtotal = 0;
    for (const item of cart.items) {
      const price = item.variant?.price || item.product.basePrice;
      subtotal += Number(price) * item.quantity;
    }

    // Check minimum order amount
    if (
      discountCode.minimumOrderAmount &&
      subtotal < Number(discountCode.minimumOrderAmount)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Minimum order amount of $${Number(discountCode.minimumOrderAmount).toFixed(2)} required`,
        },
        { status: 400 }
      );
    }

    // Check if discount applies to cart items
    if (discountCode.applicableTo === "SPECIFIC_PRODUCTS") {
      const applicableIds = (discountCode.applicableProductIds as string[]) || [];
      const hasApplicableProduct = cart.items.some((item) =>
        applicableIds.includes(item.productId)
      );

      if (!hasApplicableProduct) {
        return NextResponse.json(
          {
            success: false,
            error: "This discount code does not apply to items in your cart",
          },
          { status: 400 }
        );
      }
    }

    if (discountCode.applicableTo === "SPECIFIC_CATEGORIES") {
      const applicableIds =
        (discountCode.applicableCategoryIds as string[]) || [];
      const hasApplicableCategory = cart.items.some((item) =>
        applicableIds.includes(item.product.categoryId)
      );

      if (!hasApplicableCategory) {
        return NextResponse.json(
          {
            success: false,
            error: "This discount code does not apply to items in your cart",
          },
          { status: 400 }
        );
      }
    }

    // Calculate discount amount for display
    let discountAmount = 0;
    if (discountCode.discountType === "PERCENTAGE") {
      discountAmount = (subtotal * Number(discountCode.discountValue)) / 100;
    } else if (discountCode.discountType === "FIXED_AMOUNT") {
      discountAmount = Number(discountCode.discountValue);
    }

    // Apply maximum discount cap
    if (
      discountCode.maximumDiscountAmount &&
      discountAmount > Number(discountCode.maximumDiscountAmount)
    ) {
      discountAmount = Number(discountCode.maximumDiscountAmount);
    }

    // Ensure discount doesn't exceed subtotal
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Discount code applied successfully",
        data: {
          discountCode: {
            id: discountCode.id,
            code: discountCode.code,
            description: discountCode.description,
            discountType: discountCode.discountType,
            discountValue: Number(discountCode.discountValue),
            discountAmount: Math.round(discountAmount * 100) / 100,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error applying discount code:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to apply discount code",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart/discount
 * Remove discount code from cart
 */
export async function DELETE(request: NextRequest) {
  try {
    return NextResponse.json(
      {
        success: true,
        message: "Discount code removed",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing discount code:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to remove discount code",
      },
      { status: 500 }
    );
  }
}
