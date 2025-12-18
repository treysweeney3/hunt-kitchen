import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/cart-utils";

/**
 * GET /api/checkout/success?session_id=xxx
 * Verify successful payment and return order details
 * This is called from the success page to confirm the order
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Session ID is required",
        },
        { status: 400 }
      );
    }

    // Retrieve checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "payment_intent"],
    });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Session not found",
        },
        { status: 404 }
      );
    }

    // Check if payment was successful
    if (session.payment_status !== "paid") {
      return NextResponse.json(
        {
          success: false,
          error: "Payment not completed",
          paymentStatus: session.payment_status,
        },
        { status: 400 }
      );
    }

    // Check if order already exists for this session
    const existingOrder = await prisma.order.findFirst({
      where: {
        stripeCheckoutSessionId: sessionId,
      },
      include: {
        items: true,
      },
    });

    if (existingOrder) {
      // Order already created, return existing order
      return NextResponse.json(
        {
          success: true,
          data: {
            order: {
              id: existingOrder.id,
              orderNumber: existingOrder.orderNumber,
              status: existingOrder.status,
              paymentStatus: existingOrder.paymentStatus,
              total: Number(existingOrder.total),
              email: existingOrder.email,
              createdAt: existingOrder.createdAt,
            },
          },
        },
        { status: 200 }
      );
    }

    // Parse metadata
    const metadata = session.metadata || {};
    const cartId = metadata.cart_id;
    const userId = metadata.user_id || null;
    const discountCodeId = metadata.discount_code_id || null;
    const shippingAddress = JSON.parse(metadata.shipping_address || "{}");
    const billingAddress = JSON.parse(metadata.billing_address || "{}");
    const shippingMethod = metadata.shipping_rate_name || "Standard Shipping";
    const shippingAmount = parseFloat(metadata.shipping_rate_price || "0");

    if (!cartId) {
      return NextResponse.json(
        {
          success: false,
          error: "Cart ID not found in session metadata",
        },
        { status: 400 }
      );
    }

    // Get cart with items
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Cart not found or empty",
        },
        { status: 404 }
      );
    }

    // Calculate order totals
    let subtotal = 0;
    for (const item of cart.items) {
      const price = item.variant?.price || item.product.basePrice;
      subtotal += Number(price) * item.quantity;
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discountCodeId) {
      const discountCode = await prisma.discountCode.findUnique({
        where: { id: discountCodeId },
      });

      if (discountCode) {
        if (discountCode.discountType === "PERCENTAGE") {
          discountAmount = (subtotal * Number(discountCode.discountValue)) / 100;
        } else if (discountCode.discountType === "FIXED_AMOUNT") {
          discountAmount = Number(discountCode.discountValue);
        }

        if (
          discountCode.maximumDiscountAmount &&
          discountAmount > Number(discountCode.maximumDiscountAmount)
        ) {
          discountAmount = Number(discountCode.maximumDiscountAmount);
        }

        if (discountAmount > subtotal) {
          discountAmount = subtotal;
        }
      }
    }

    // Calculate tax (you may want to integrate with a tax service)
    const taxAmount = 0; // Implement tax calculation as needed

    const total = subtotal - discountAmount + shippingAmount + taxAmount;

    // Generate unique order number
    const orderNumber = await generateOrderNumber();

    // Create order in database
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: userId || null,
        email: session.customer_details?.email || session.customer_email || "",
        status: "CONFIRMED",
        paymentStatus: "PAID",
        fulfillmentStatus: "UNFULFILLED",
        subtotal,
        discountAmount,
        shippingAmount,
        taxAmount,
        total,
        currency: "USD",
        shippingAddress,
        billingAddress,
        shippingMethod,
        stripePaymentIntentId: session.payment_intent
          ? typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent.id
          : null,
        stripeCheckoutSessionId: sessionId,
        discountCodeId: discountCodeId || null,
        items: {
          create: cart.items.map((item) => {
            const price = item.variant?.price || item.product.basePrice;
            const unitPrice = Number(price);

            return {
              productId: item.product.id,
              variantId: item.variant?.id || null,
              productName: item.product.name,
              variantName: item.variant?.name || null,
              sku: item.variant?.sku || item.product.sku || null,
              quantity: item.quantity,
              unitPrice,
              totalPrice: unitPrice * item.quantity,
            };
          }),
        },
      },
      include: {
        items: true,
      },
    });

    // Update discount code usage count
    if (discountCodeId) {
      await prisma.discountCode.update({
        where: { id: discountCodeId },
        data: {
          usageCount: {
            increment: 1,
          },
        },
      });
    }

    // Reduce inventory for purchased items
    for (const item of cart.items) {
      if (item.product.trackInventory && item.variant) {
        await prisma.productVariant.update({
          where: { id: item.variant.id },
          data: {
            inventoryQty: {
              decrement: item.quantity,
            },
          },
        });
      }
    }

    // Clear cart after successful order creation
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // TODO: Send order confirmation email

    return NextResponse.json(
      {
        success: true,
        data: {
          order: {
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            paymentStatus: order.paymentStatus,
            total: Number(order.total),
            email: order.email,
            itemCount: order.items.length,
            createdAt: order.createdAt,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying checkout success:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to verify payment",
      },
      { status: 500 }
    );
  }
}
