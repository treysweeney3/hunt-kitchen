"use client";

import { useState } from "react";
import Link from "next/link";
import { CartItem } from "@/components/shop/CartItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { ShoppingBag, ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function CartPage() {
  const { items, isEmpty, subtotal, total, getLineItems } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (isEmpty) {
      toast.error("Your cart is empty");
      return;
    }

    setIsCheckingOut(true);

    try {
      const lineItems = getLineItems();

      const response = await fetch("/api/shopify/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lineItems }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to create checkout");
        return;
      }

      // Redirect to Shopify checkout
      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Failed to create checkout. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-cream py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-stone/30">
              <ShoppingBag className="h-16 w-16 text-slate" />
            </div>
            <h1 className="mb-4 font-serif text-4xl font-bold text-barkBrown">
              Your Cart is Empty
            </h1>
            <p className="mb-8 text-lg text-slate">
              Looks like you haven&apos;t added any items to your cart yet. Start
              shopping to find your favorite products!
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-hunterOrange text-white hover:bg-hunterOrange/90"
              >
                <Link href="/shop">Browse Products</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/recipes">Browse Recipes</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link
            href="/shop"
            className="inline-flex items-center text-sm text-slate hover:text-hunterOrange"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </div>

        <h1 className="mb-8 font-serif text-4xl font-bold text-barkBrown">
          Shopping Cart
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-barkBrown">
                  Cart Items ({items.length} {items.length === 1 ? "item" : "items"})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                {items.map((item) => (
                  <CartItem key={item.variant_id} item={item} />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Order Summary */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-barkBrown">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate">Subtotal</span>
                      <span className="font-medium text-barkBrown">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between">
                    <span className="font-semibold text-barkBrown">Total</span>
                    <span className="font-serif text-2xl font-bold text-forestGreen">
                      ${total.toFixed(2)}
                    </span>
                  </div>

                  <p className="text-xs text-slate">
                    Shipping, taxes, and discounts calculated at checkout
                  </p>

                  <div className="space-y-3 pt-2">
                    <Button
                      onClick={handleCheckout}
                      disabled={isCheckingOut || isEmpty}
                      className="w-full bg-hunterOrange text-white hover:bg-hunterOrange/90"
                      size="lg"
                    >
                      {isCheckingOut ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating Checkout...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Proceed to Checkout
                          <ExternalLink className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      className="w-full border-forestGreen text-forestGreen hover:bg-forestGreen hover:text-white"
                      size="lg"
                    >
                      <Link href="/shop">Continue Shopping</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Badges */}
              <Card className="bg-white">
                <CardContent className="space-y-3 pt-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forestGreen/10">
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-barkBrown">Secure Checkout</p>
                      <p className="text-sm text-slate">
                        Your payment information is encrypted
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forestGreen/10">
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
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-barkBrown">Easy Returns</p>
                      <p className="text-sm text-slate">
                        30-day return policy on all products
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
