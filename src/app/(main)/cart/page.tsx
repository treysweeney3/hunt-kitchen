"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CartItem } from "@/components/shop/CartItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { ShoppingBag, ArrowLeft, Tag } from "lucide-react";
import { toast } from "sonner";

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    isEmpty,
    subtotal,
    discountAmount,
    total,
    discount,
    applyDiscount,
    removeDiscount,
  } = useCart();

  const [discountCode, setDiscountCode] = useState("");
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      toast.error("Please enter a discount code");
      return;
    }

    setIsApplyingDiscount(true);

    try {
      const response = await fetch("/api/cart/discount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: discountCode.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.error || "Failed to apply discount code");
        return;
      }

      // Apply discount to local cart
      applyDiscount({
        code: data.data.discountCode.code,
        type: data.data.discountCode.discountType === "PERCENTAGE" ? "percentage" : "fixed",
        value: data.data.discountCode.discountValue,
      });

      toast.success("Discount code applied successfully!");
      setDiscountCode("");
    } catch (error) {
      console.error("Error applying discount:", error);
      toast.error("Failed to apply discount code");
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    removeDiscount();
    toast.success("Discount code removed");
  };

  const handleCheckout = () => {
    router.push("/checkout");
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
              Looks like you haven't added any items to your cart yet. Start shopping to find your
              favorite products!
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

        <h1 className="mb-8 font-serif text-4xl font-bold text-barkBrown">Shopping Cart</h1>

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
                  <CartItem key={`${item.product_id}-${item.variant_id}`} item={item} />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Discount Code */}
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center text-barkBrown">
                    <Tag className="mr-2 h-5 w-5" />
                    Discount Code
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {discount ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                        <div>
                          <p className="font-semibold text-green-800">{discount.code}</p>
                          <p className="text-sm text-green-600">
                            {discount.type === "percentage"
                              ? `${discount.value}% off`
                              : `$${discount.value.toFixed(2)} off`}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveDiscount}
                          className="text-green-700 hover:text-green-900"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter code"
                        value={discountCode}
                        onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleApplyDiscount();
                          }
                        }}
                        disabled={isApplyingDiscount}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleApplyDiscount}
                        disabled={isApplyingDiscount || !discountCode.trim()}
                        className="bg-forestGreen hover:bg-forestGreen/90"
                      >
                        Apply
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

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

                    {discount && discountAmount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">
                          Discount ({discount.code})
                        </span>
                        <span className="font-medium text-green-600">
                          -${discountAmount.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between">
                    <span className="font-semibold text-barkBrown">Total</span>
                    <span className="font-serif text-2xl font-bold text-forestGreen">
                      ${total.toFixed(2)}
                    </span>
                  </div>

                  <p className="text-xs text-slate">
                    Shipping and taxes calculated at checkout
                  </p>

                  <div className="space-y-3 pt-2">
                    <Button
                      onClick={handleCheckout}
                      className="w-full bg-hunterOrange text-white hover:bg-hunterOrange/90"
                      size="lg"
                    >
                      Proceed to Checkout
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
