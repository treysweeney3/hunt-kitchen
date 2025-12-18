import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

/**
 * GET /api/orders/[id]
 * Get order details (requires authentication and ownership)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get user session
    const session = await getServerSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Find order
    const order = await prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                featuredImageUrl: true,
              },
            },
            variant: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
        discountCode: {
          select: {
            code: true,
            description: true,
            discountType: true,
            discountValue: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found",
        },
        { status: 404 }
      );
    }

    // Verify order ownership
    if (order.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: "You do not have permission to view this order",
        },
        { status: 403 }
      );
    }

    // Format order details
    const formattedOrder = {
      id: order.id,
      orderNumber: order.orderNumber,
      email: order.email,
      status: order.status,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      shippingAmount: Number(order.shippingAmount),
      taxAmount: Number(order.taxAmount),
      total: Number(order.total),
      currency: order.currency,
      items: order.items.map((item) => ({
        id: item.id,
        product: item.product,
        variant: item.variant,
        productName: item.productName,
        variantName: item.variantName,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      shippingMethod: order.shippingMethod,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      discountCode: order.discountCode
        ? {
            code: order.discountCode.code,
            description: order.discountCode.description,
            discountType: order.discountCode.discountType,
            discountValue: Number(order.discountCode.discountValue),
          }
        : null,
      customerNotes: order.customerNotes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        data: {
          order: formattedOrder,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching order details:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch order details",
      },
      { status: 500 }
    );
  }
}
