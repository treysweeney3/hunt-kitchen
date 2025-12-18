"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Lock } from "lucide-react";

interface PaymentFormProps {
  onSubmit: () => Promise<void>;
  isLoading: boolean;
}

export function PaymentForm({ onSubmit, isLoading }: PaymentFormProps) {
  return (
    <div className="space-y-4">
      <Card className="border-2 border-forestGreen/20 bg-forestGreen/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-forestGreen/10">
              <CreditCard className="h-6 w-6 text-forestGreen" />
            </div>
            <div className="flex-1">
              <h3 className="mb-2 font-semibold text-barkBrown">Secure Payment with Stripe</h3>
              <p className="mb-4 text-sm text-slate">
                When you click "Complete Order", you'll be securely redirected to Stripe to enter
                your payment information. We never store your card details.
              </p>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1 rounded bg-white px-2 py-1 text-xs">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                    <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <span className="text-slate">Visa</span>
                </div>
                <div className="flex items-center gap-1 rounded bg-white px-2 py-1 text-xs">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="9" cy="12" r="6" stroke="currentColor" strokeWidth="2" />
                    <circle cx="15" cy="12" r="6" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <span className="text-slate">Mastercard</span>
                </div>
                <div className="flex items-center gap-1 rounded bg-white px-2 py-1 text-xs">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <span className="text-slate">Amex</span>
                </div>
                <div className="flex items-center gap-1 rounded bg-white px-2 py-1 text-xs">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <path d="M4 8L12 4L20 8V16L12 20L4 16V8Z" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  <span className="text-slate">Discover</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-4">
        <Lock className="h-5 w-5 flex-shrink-0 text-blue-600" />
        <div>
          <p className="text-sm font-medium text-blue-900">Your information is secure</p>
          <p className="text-xs text-blue-700">
            We use industry-standard encryption to protect your data
          </p>
        </div>
      </div>

      <Button
        type="submit"
        onClick={onSubmit}
        disabled={isLoading}
        className="w-full bg-hunterOrange text-white hover:bg-hunterOrange/90"
        size="lg"
      >
        {isLoading ? (
          <>
            <svg
              className="mr-2 h-5 w-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-5 w-5" />
            Complete Order
          </>
        )}
      </Button>

      <p className="text-center text-xs text-slate">
        By completing your purchase, you agree to our{" "}
        <a href="/terms" className="text-forestGreen hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-forestGreen hover:underline">
          Privacy Policy
        </a>
      </p>
    </div>
  );
}
