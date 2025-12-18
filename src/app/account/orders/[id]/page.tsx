"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Order, OrderItem } from "@/types";
import { format } from "date-fns";
import { toast } from "sonner";

function getOrderStatusBadge(status: string) {
  const variants: Record<
    string,
    { variant: "default" | "secondary" | "destructive" | "outline"; className: string }
  > = {
    pending: { variant: "secondary", className: "bg-yellow-100 text-yellow-800" },
    processing: { variant: "default", className: "bg-blue-100 text-blue-800" },
    shipped: { variant: "default", className: "bg-purple-100 text-purple-800" },
    delivered: { variant: "default", className: "bg-green-100 text-green-800" },
    cancelled: { variant: "destructive", className: "bg-red-100 text-red-800" },
    refunded: { variant: "secondary", className: "bg-gray-100 text-gray-800" },
  };

  const config = variants[status] || variants.pending;

  return (
    <Badge variant={config.variant} className={config.className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function OrderStatusTimeline({ status }: { status: string }) {
  const steps = [
    { key: "pending", label: "Order Placed", icon: Package },
    { key: "processing", label: "Processing", icon: Package },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "delivered", label: "Delivered", icon: CheckCircle2 },
  ];

  const statusOrder = ["pending", "processing", "shipped", "delivered"];
  const currentIndex = statusOrder.indexOf(status);

  return (
    <div className="py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.key} className="flex-1 relative">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                    isCompleted
                      ? "bg-[#2D5A3D] border-[#2D5A3D] text-white"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <p
                  className={`mt-2 text-sm font-medium text-center ${
                    isCurrent ? "text-[#2D5A3D]" : isCompleted ? "text-gray-700" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`absolute top-6 left-1/2 h-0.5 w-full ${
                    isCompleted ? "bg-[#2D5A3D]" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      setLoading(true);
      try {
        const res = await fetch(`/api/account/orders/${orderId}`);
        if (!res.ok) throw new Error("Failed to fetch order");

        const data = await res.json();
        setOrder(data.order);
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Failed to load order details");
      } finally {
        setLoading(false);
      }
    }

    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#2D5A3D]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Order not found</h3>
        <p className="text-gray-600 mb-4">
          We couldn't find the order you're looking for.
        </p>
        <Button asChild className="bg-[#2D5A3D] hover:bg-[#234a30]">
          <Link href="/account/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/account/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order #{order.orderNumber}
            </h1>
            <p className="mt-2 text-gray-600">
              Placed on {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          {getOrderStatusBadge(order.status)}
        </div>
      </div>

      {/* Order Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderStatusTimeline status={order.status} />
          {order.trackingNumber && order.status === "shipped" && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Tracking Number</p>
                  <p className="text-sm text-gray-600 mt-1">{order.trackingNumber}</p>
                </div>
                {order.trackingUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Track Package <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items?.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 rounded-lg border"
              >
                <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src="/placeholder-product.jpg"
                    alt={item.productName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{item.productName}</h4>
                  {item.variantName && (
                    <p className="text-sm text-gray-600 mt-1">{item.variantName}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ${item.totalPrice.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    ${item.unitPrice.toFixed(2)} each
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent>
            <address className="not-italic text-gray-700">
              <p className="font-semibold">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p>{order.shippingAddress.streetAddress1}</p>
              {order.shippingAddress.streetAddress2 && (
                <p>{order.shippingAddress.streetAddress2}</p>
              )}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && (
                <p className="mt-2">{order.shippingAddress.phone}</p>
              )}
            </address>
          </CardContent>
        </Card>

        {/* Billing Address */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Address</CardTitle>
          </CardHeader>
          <CardContent>
            <address className="not-italic text-gray-700">
              <p className="font-semibold">
                {order.billingAddress.firstName} {order.billingAddress.lastName}
              </p>
              <p>{order.billingAddress.streetAddress1}</p>
              {order.billingAddress.streetAddress2 && (
                <p>{order.billingAddress.streetAddress2}</p>
              )}
              <p>
                {order.billingAddress.city}, {order.billingAddress.state}{" "}
                {order.billingAddress.postalCode}
              </p>
              <p>{order.billingAddress.country}</p>
              {order.billingAddress.phone && (
                <p className="mt-2">{order.billingAddress.phone}</p>
              )}
            </address>
          </CardContent>
        </Card>
      </div>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>${order.shippingAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax</span>
              <span>${order.taxAmount.toFixed(2)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-${order.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-semibold text-lg text-gray-900">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Notes */}
      {order.customerNotes && (
        <Card>
          <CardHeader>
            <CardTitle>Order Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{order.customerNotes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
