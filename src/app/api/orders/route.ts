import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

/**
 * GET /api/orders
 * List user's orders (requires authentication)
 */
export async function GET(request: NextRequest) {
  try {
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

    // Get pagination parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Get orders with items
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: {
          userId,
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
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.order.count({
        where: {
          userId,
        },
      }),
    ]);

    // Format orders
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discountAmount),
      shippingAmount: Number(order.shippingAmount),
      taxAmount: Number(order.taxAmount),
      total: Number(order.total),
      currency: order.currency,
      itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
      items: order.items.map((item) => ({
        id: item.id,
        product: item.product,
        variant: item.variant,
        productName: item.productName,
        variantName: item.variantName,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
      shippingAddress: order.shippingAddress,
      trackingNumber: order.trackingNumber,
      trackingUrl: order.trackingUrl,
      discountCode: order.discountCode,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      {
        success: true,
        data: {
          orders: formattedOrders,
          pagination: {
            page,
            limit,
            totalCount,
            totalPages,
            hasMore: page < totalPages,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}
