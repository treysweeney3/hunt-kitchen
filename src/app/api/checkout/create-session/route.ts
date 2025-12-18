import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { stripe, STRIPE_CONFIG } from "@/lib/stripe";
import { getOrCreateCart, getOrCreateSessionId } from "@/lib/cart-utils";
import prisma from "@/lib/prisma";

// Validation schema for checkout session creation
const createSessionSchema = z.object({
  shippingAddress: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    streetAddress1: z.string().min(1),
    streetAddress2: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().default("US"),
    phone: z.string().optional(),
  }),
  billingAddress: z
    .object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      streetAddress1: z.string().min(1),
      streetAddress2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().min(1),
      postalCode: z.string().min(1),
      country: z.string().default("US"),
      phone: z.string().optional(),
    })
    .optional(),
  email: z.string().email(),
  shippingRate: z.object({
    id: z.string(),
    name: z.string(),
    price: z.number(),
  }),
  discountCodeId: z.string().optional(),
  sameAsShipping: z.boolean().default(true),
});

/**
 * POST /api/checkout/create-session
 * Create Stripe checkout session
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = createSessionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid checkout data",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const {
      shippingAddress,
      billingAddress,
      email,
      shippingRate,
      discountCodeId,
      sameAsShipping,
    } = validation.data;

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

    // Verify inventory before creating checkout session
    for (const item of cart.items) {
      const product = item.product;

      if (!product.isActive) {
        return NextResponse.json(
          {
            success: false,
            error: `Product "${product.name}" is no longer available`,
          },
          { status: 400 }
        );
      }

      if (product.trackInventory && item.variant) {
        if (item.variant.inventoryQty < item.quantity) {
          return NextResponse.json(
            {
              success: false,
              error: `Insufficient stock for "${product.name} - ${item.variant.name}"`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Calculate totals
    let subtotal = 0;
    const lineItems: any[] = [];

    for (const item of cart.items) {
      const price = item.variant?.price || item.product.basePrice;
      const unitPrice = Number(price);
      subtotal += unitPrice * item.quantity;

      lineItems.push({
        price_data: {
          currency: STRIPE_CONFIG.currency,
          product_data: {
            name: item.variant
              ? `${item.product.name} - ${item.variant.name}`
              : item.product.name,
            images: item.variant?.imageUrl
              ? [item.variant.imageUrl]
              : item.product.featuredImageUrl
              ? [item.product.featuredImageUrl]
              : [],
            metadata: {
              product_id: item.product.id,
              variant_id: item.variant?.id || "",
            },
          },
          unit_amount: Math.round(unitPrice * 100), // Convert to cents
        },
        quantity: item.quantity,
      });
    }

    // Add shipping as line item
    if (shippingRate.price > 0) {
      lineItems.push({
        price_data: {
          currency: STRIPE_CONFIG.currency,
          product_data: {
            name: shippingRate.name,
            description: "Shipping",
          },
          unit_amount: Math.round(shippingRate.price * 100),
        },
        quantity: 1,
      });
    }

    // Handle discount code
    let discountCoupon;
    if (discountCodeId) {
      const discountCode = await prisma.discountCode.findUnique({
        where: { id: discountCodeId },
      });

      if (discountCode && discountCode.isActive) {
        // Create Stripe coupon for this discount
        if (discountCode.discountType === "PERCENTAGE") {
          discountCoupon = await stripe.coupons.create({
            percent_off: Number(discountCode.discountValue),
            duration: "once",
            name: discountCode.code,
          });
        } else if (discountCode.discountType === "FIXED_AMOUNT") {
          discountCoupon = await stripe.coupons.create({
            amount_off: Math.round(Number(discountCode.discountValue) * 100),
            currency: STRIPE_CONFIG.currency,
            duration: "once",
            name: discountCode.code,
          });
        }
      }
    }

    // Determine billing address
    const finalBillingAddress = sameAsShipping
      ? shippingAddress
      : billingAddress || shippingAddress;

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: email,
      shipping_address_collection: undefined, // We already collected it
      billing_address_collection: "auto",
      phone_number_collection: {
        enabled: true,
      },
      metadata: {
        cart_id: cart.id,
        user_id: userId || "",
        session_id: sessionId || "",
        discount_code_id: discountCodeId || "",
        shipping_address: JSON.stringify(shippingAddress),
        billing_address: JSON.stringify(finalBillingAddress),
        shipping_rate_id: shippingRate.id,
        shipping_rate_name: shippingRate.name,
        shipping_rate_price: shippingRate.price.toString(),
      },
      success_url: `${STRIPE_CONFIG.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: STRIPE_CONFIG.cancelUrl,
      ...(discountCoupon && {
        discounts: [
          {
            coupon: discountCoupon.id,
          },
        ],
      }),
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          sessionId: checkoutSession.id,
          url: checkoutSession.url,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create checkout session",
      },
      { status: 500 }
    );
  }
}
