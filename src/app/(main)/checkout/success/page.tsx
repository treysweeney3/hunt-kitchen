"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/useCart";
import { CheckCircle, Package, Printer, Share2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

interface OrderData {
  id: string;
  orderNumber: string;
  email: string;
  total: number;
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  items: Array<{
    id: string;
    productName: string;
    variantName?: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    streetAddress1: string;
    streetAddress2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  estimatedDelivery: string;
  createdAt: string;
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setError("No session ID found");
      setIsLoading(false);
      return;
    }

    // Fetch order details from the success API
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/checkout/success?session_id=${sessionId}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.error || "Failed to retrieve order details");
          return;
        }

        setOrderData(data.data);
        // Clear the cart after successful order
        clearCart();
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Failed to load order details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [searchParams, clearCart]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (orderData) {
      const shareText = `I just placed an order at The Hunt Kitchen! Order #${orderData.orderNumber}`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: "The Hunt Kitchen Order",
            text: shareText,
          });
        } catch (err) {
          console.error("Error sharing:", err);
        }
      } else {
        navigator.clipboard.writeText(shareText);
        toast.success("Order details copied to clipboard!");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream py-12">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="space-y-6">
            <Skeleton className="mx-auto h-24 w-24 rounded-full" />
            <Skeleton className="mx-auto h-12 w-96" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-cream py-12">
        <div className="container mx-auto max-w-2xl px-4">
          <Card className="bg-white">
            <CardContent className="p-12 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="mb-4 font-serif text-2xl font-bold text-barkBrown">
                Order Not Found
              </h2>
              <p className="mb-8 text-slate">{error || "We couldn't find your order details."}</p>
              <Button asChild className="bg-hunterOrange hover:bg-hunterOrange/90">
                <Link href="/shop">Continue Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Success Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <h1 className="mb-2 font-serif text-4xl font-bold text-barkBrown">
            Order Confirmed!
          </h1>
          <p className="text-lg text-slate">Thank you for your purchase</p>
          <p className="mt-2 text-sm text-slate">
            Order number:{" "}
            <span className="font-semibold text-forestGreen">{orderData.orderNumber}</span>
          </p>
        </div>

        {/* Order Confirmation Details */}
        <Card className="mb-6 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-barkBrown">
              <Package className="h-5 w-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Order Items */}
            <div className="space-y-4">
              {orderData.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-stone bg-stone/30">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-slate" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 justify-between">
                    <div>
                      <p className="font-semibold text-barkBrown">{item.productName}</p>
                      {item.variantName && (
                        <p className="text-sm text-slate">{item.variantName}</p>
                      )}
                      <p className="mt-1 text-sm text-slate">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-forestGreen">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Price Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate">Subtotal</span>
                <span className="font-medium text-barkBrown">
                  ${orderData.subtotal.toFixed(2)}
                </span>
              </div>
              {orderData.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600">Discount</span>
                  <span className="font-medium text-green-600">
                    -${orderData.discount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate">Shipping</span>
                <span className="font-medium text-barkBrown">
                  ${orderData.shippingCost.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate">Tax</span>
                <span className="font-medium text-barkBrown">${orderData.tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold text-barkBrown">Total</span>
                <span className="font-serif text-2xl font-bold text-forestGreen">
                  ${orderData.total.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Information */}
        <Card className="mb-6 bg-white">
          <CardHeader>
            <CardTitle className="text-barkBrown">Shipping Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-semibold text-barkBrown">
                {orderData.shippingAddress.firstName} {orderData.shippingAddress.lastName}
              </p>
              <p className="text-slate">{orderData.shippingAddress.streetAddress1}</p>
              {orderData.shippingAddress.streetAddress2 && (
                <p className="text-slate">{orderData.shippingAddress.streetAddress2}</p>
              )}
              <p className="text-slate">
                {orderData.shippingAddress.city}, {orderData.shippingAddress.state}{" "}
                {orderData.shippingAddress.postalCode}
              </p>
              <p className="text-slate">{orderData.shippingAddress.country}</p>
            </div>
            <div className="mt-4 rounded-lg bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-900">Estimated Delivery</p>
              <p className="text-sm text-blue-700">{orderData.estimatedDelivery}</p>
            </div>
          </CardContent>
        </Card>

        {/* Email Confirmation */}
        <Card className="mb-6 bg-forestGreen/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-forestGreen/10">
                <svg
                  className="h-5 w-5 text-forestGreen"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-barkBrown">Order confirmation sent</p>
                <p className="text-sm text-slate">
                  We've sent a confirmation email to{" "}
                  <span className="font-medium text-forestGreen">{orderData.email}</span> with your
                  order details and tracking information.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button
            asChild
            className="flex-1 bg-hunterOrange text-white hover:bg-hunterOrange/90"
            size="lg"
          >
            <Link href="/shop">Continue Shopping</Link>
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex-1 border-forestGreen text-forestGreen hover:bg-forestGreen hover:text-white"
            size="lg"
          >
            <Printer className="mr-2 h-5 w-5" />
            Print Receipt
          </Button>
          <Button
            variant="outline"
            onClick={handleShare}
            className="border-forestGreen text-forestGreen hover:bg-forestGreen hover:text-white"
            size="lg"
          >
            <Share2 className="mr-2 h-5 w-5" />
            Share
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-12 rounded-lg border-2 border-dashed border-stone/50 bg-white p-6 text-center">
          <p className="mb-2 font-semibold text-barkBrown">Need help with your order?</p>
          <p className="text-sm text-slate">
            Contact our customer support team at{" "}
            <a href="mailto:support@thehuntkitchen.com" className="text-forestGreen hover:underline">
              support@thehuntkitchen.com
            </a>{" "}
            or call{" "}
            <a href="tel:+15551234567" className="text-forestGreen hover:underline">
              (555) 123-4567
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-cream py-12">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="space-y-6">
              <Skeleton className="mx-auto h-24 w-24 rounded-full" />
              <Skeleton className="mx-auto h-12 w-96" />
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
