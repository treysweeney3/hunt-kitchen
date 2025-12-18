import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { getOrCreateCart, getOrCreateSessionId, calculateCartWeight } from "@/lib/cart-utils";

// Validation schema for shipping address
const shippingAddressSchema = z.object({
  streetAddress1: z.string().min(1, "Street address is required"),
  streetAddress2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(5, "Postal code is required"),
  country: z.string().default("US"),
});

// Mock shipping rates (in production, integrate with Shippo or EasyPost)
const SHIPPING_RATES = [
  {
    id: "standard",
    name: "Standard Shipping",
    description: "5-7 business days",
    price: 5.99,
    estimatedDays: "5-7",
  },
  {
    id: "express",
    name: "Express Shipping",
    description: "2-3 business days",
    price: 14.99,
    estimatedDays: "2-3",
  },
  {
    id: "overnight",
    name: "Overnight Shipping",
    description: "1 business day",
    price: 29.99,
    estimatedDays: "1",
  },
];

/**
 * POST /api/checkout/shipping-rates
 * Calculate shipping rates based on cart weight and destination
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = shippingAddressSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid shipping address",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const address = validation.data;

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
        },
        { status: 400 }
      );
    }

    // Calculate cart weight
    const totalWeightOz = await calculateCartWeight(cart.id);

    // In production, integrate with shipping API (Shippo, EasyPost, etc.)
    // For now, return mock rates with weight-based pricing adjustments
    const rates = SHIPPING_RATES.map((rate) => {
      let adjustedPrice = rate.price;

      // Add $2 for every 32oz (2 lbs) over 16oz (1 lb)
      if (totalWeightOz > 16) {
        const extraWeight = Math.ceil((totalWeightOz - 16) / 32);
        adjustedPrice += extraWeight * 2;
      }

      return {
        ...rate,
        price: Math.round(adjustedPrice * 100) / 100,
        weight: totalWeightOz,
      };
    });

    // Check for free shipping eligibility
    let freeShippingThreshold = 75; // $75 for free shipping
    let subtotal = 0;

    for (const item of cart.items) {
      const price = item.variant?.price || item.product.basePrice;
      subtotal += Number(price) * item.quantity;
    }

    const qualifiesForFreeShipping = subtotal >= freeShippingThreshold;

    if (qualifiesForFreeShipping) {
      rates.unshift({
        id: "free",
        name: "Free Standard Shipping",
        description: "5-7 business days",
        price: 0,
        estimatedDays: "5-7",
        weight: totalWeightOz,
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          rates,
          address,
          cartWeight: totalWeightOz,
          freeShippingThreshold,
          qualifiesForFreeShipping,
          remainingForFreeShipping: qualifiesForFreeShipping
            ? 0
            : Math.round((freeShippingThreshold - subtotal) * 100) / 100,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error calculating shipping rates:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate shipping rates",
      },
      { status: 500 }
    );
  }
}
