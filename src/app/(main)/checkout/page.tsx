"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { useCart } from "@/hooks/useCart";
import { ArrowLeft, Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CheckoutPage() {
  const router = useRouter();
  const { isEmpty } = useCart();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if cart is empty after mount
    if (isEmpty) {
      router.push("/cart");
    } else {
      setIsLoading(false);
    }
  }, [isEmpty, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-12 w-48" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div>
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center text-sm text-slate hover:text-hunterOrange"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Link>
          <div className="mt-4 flex items-center justify-between">
            <h1 className="font-serif text-4xl font-bold text-barkBrown">Checkout</h1>
            <div className="flex items-center gap-2 text-sm text-slate">
              <Lock className="h-4 w-4 text-forestGreen" />
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <CheckoutForm />
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <OrderSummary />
            </div>
          </div>
        </div>

        {/* Trust Badges Footer */}
        <div className="mt-12 border-t border-stone pt-8">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-forestGreen/10">
                <svg
                  className="h-6 w-6 text-forestGreen"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-barkBrown">Secure Payment</p>
                <p className="text-sm text-slate">SSL encrypted checkout</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-forestGreen/10">
                <svg
                  className="h-6 w-6 text-forestGreen"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-barkBrown">Buyer Protection</p>
                <p className="text-sm text-slate">Full refund guarantee</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-forestGreen/10">
                <svg
                  className="h-6 w-6 text-forestGreen"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-barkBrown">24/7 Support</p>
                <p className="text-sm text-slate">Always here to help</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
