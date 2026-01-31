import { NextRequest, NextResponse } from "next/server";
import { createCheckout, isShopifyConfigured } from "@/lib/shopify";

interface CheckoutLineItem {
  variantId: string;
  quantity: number;
}

interface CheckoutRequest {
  lineItems: CheckoutLineItem[];
}

export async function POST(request: NextRequest) {
  try {
    // Check if Shopify is configured
    if (!isShopifyConfigured()) {
      return NextResponse.json(
        { error: "Shopify is not configured" },
        { status: 503 }
      );
    }

    // Parse request body
    const body: CheckoutRequest = await request.json();
    const { lineItems } = body;

    // Validate line items
    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty. Please add items before checkout." },
        { status: 400 }
      );
    }

    // Validate each line item
    for (const item of lineItems) {
      if (!item.variantId || typeof item.variantId !== "string") {
        return NextResponse.json(
          { error: "Invalid variant ID in cart" },
          { status: 400 }
        );
      }
      if (!item.quantity || typeof item.quantity !== "number" || item.quantity < 1) {
        return NextResponse.json(
          { error: "Invalid quantity in cart" },
          { status: 400 }
        );
      }
    }

    // Create Shopify checkout
    const cart = await createCheckout(lineItems);

    // Return the checkout URL
    return NextResponse.json({
      checkoutUrl: cart.checkoutUrl,
      cartId: cart.id,
      totalAmount: cart.cost.totalAmount.amount,
      currency: cart.cost.totalAmount.currencyCode,
    });
  } catch (error) {
    console.error("Shopify checkout error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      // Check for inventory/availability errors
      if (
        error.message.includes("not available") ||
        error.message.includes("out of stock")
      ) {
        return NextResponse.json(
          {
            error:
              "Some items in your cart are no longer available. Please review your cart.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: error.message || "Failed to create checkout" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create checkout. Please try again." },
      { status: 500 }
    );
  }
}
