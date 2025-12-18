import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import Stripe from "stripe";

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 *
 * Important events:
 * - checkout.session.completed: Payment succeeded
 * - payment_intent.succeeded: Payment confirmed
 * - charge.refunded: Refund processed
 * - charge.dispute.created: Dispute filed
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      console.error("No Stripe signature found");
      return NextResponse.json(
        { error: "No signature" },
        { status: 400 }
      );
    }

    if (!STRIPE_WEBHOOK_SECRET) {
      console.error("STRIPE_WEBHOOK_SECRET is not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    console.log(`Received Stripe webhook: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      case "charge.dispute.created":
        await handleDisputeCreated(event.data.object as Stripe.Dispute);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

/**
 * Handle checkout.session.completed event
 * This is the primary event for order creation
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log("Processing checkout.session.completed:", session.id);

    // Check if order already exists
    const existingOrder = await prisma.order.findFirst({
      where: {
        stripeCheckoutSessionId: session.id,
      },
    });

    if (existingOrder) {
      console.log("Order already exists for session:", session.id);
      return;
    }

    // Order creation is handled in the checkout success endpoint
    // This webhook serves as a backup and for updating order status
    console.log("Checkout session completed, order should be created via success endpoint");
  } catch (error) {
    console.error("Error handling checkout.session.completed:", error);
    throw error;
  }
}

/**
 * Handle payment_intent.succeeded event
 * Update order payment status
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log("Processing payment_intent.succeeded:", paymentIntent.id);

    const order = await prisma.order.findFirst({
      where: {
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          status: order.status === "PENDING" ? "CONFIRMED" : order.status,
        },
      });

      console.log("Updated order payment status:", order.orderNumber);

      // TODO: Send order confirmation email
    }
  } catch (error) {
    console.error("Error handling payment_intent.succeeded:", error);
    throw error;
  }
}

/**
 * Handle payment_intent.payment_failed event
 * Update order payment status to failed
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log("Processing payment_intent.payment_failed:", paymentIntent.id);

    const order = await prisma.order.findFirst({
      where: {
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    if (order) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "FAILED",
        },
      });

      console.log("Updated order payment status to failed:", order.orderNumber);

      // TODO: Send payment failed notification
    }
  } catch (error) {
    console.error("Error handling payment_intent.payment_failed:", error);
    throw error;
  }
}

/**
 * Handle charge.refunded event
 * Update order to refunded status and restore inventory
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  try {
    console.log("Processing charge.refunded:", charge.id);

    const paymentIntentId = typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;

    if (!paymentIntentId) {
      console.log("No payment intent found for charge");
      return;
    }

    const order = await prisma.order.findFirst({
      where: {
        stripePaymentIntentId: paymentIntentId,
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!order) {
      console.log("No order found for payment intent:", paymentIntentId);
      return;
    }

    // Check if full refund or partial
    const refundAmount = charge.amount_refunded || 0;
    const totalAmount = charge.amount || 0;
    const isFullRefund = refundAmount === totalAmount;

    // Update order status
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED",
        status: isFullRefund ? "REFUNDED" : order.status,
      },
    });

    // Restore inventory if full refund
    if (isFullRefund) {
      for (const item of order.items) {
        if (item.product.trackInventory && item.variant) {
          await prisma.productVariant.update({
            where: { id: item.variant.id },
            data: {
              inventoryQty: {
                increment: item.quantity,
              },
            },
          });
        }
      }
    }

    console.log(
      `Order ${order.orderNumber} ${isFullRefund ? "fully" : "partially"} refunded`
    );

    // TODO: Send refund confirmation email
  } catch (error) {
    console.error("Error handling charge.refunded:", error);
    throw error;
  }
}

/**
 * Handle charge.dispute.created event
 * Alert admin about dispute
 */
async function handleDisputeCreated(dispute: Stripe.Dispute) {
  try {
    console.log("Processing charge.dispute.created:", dispute.id);

    const chargeId = typeof dispute.charge === "string"
      ? dispute.charge
      : dispute.charge?.id;

    console.log("Dispute created for charge:", chargeId);
    console.log("Dispute reason:", dispute.reason);
    console.log("Dispute amount:", dispute.amount);

    // TODO: Send alert to admin
    // TODO: Create internal dispute record for tracking
  } catch (error) {
    console.error("Error handling charge.dispute.created:", error);
    throw error;
  }
}
