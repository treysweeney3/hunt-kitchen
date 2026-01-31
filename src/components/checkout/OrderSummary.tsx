"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { ShoppingBag } from "lucide-react";

interface OrderSummaryProps {
  shippingCost?: number;
  taxAmount?: number;
}

export function OrderSummary({ shippingCost = 0, taxAmount = 0 }: OrderSummaryProps) {
  const { items, subtotal, total } = useCart();

  const totalBeforeTax = subtotal + shippingCost;
  const finalTotal = totalBeforeTax + taxAmount;

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-barkBrown">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cart Items */}
        <div className="space-y-3">
          {items.map((item) => {
            const itemKey = item.variant_id;
            return (
              <div key={itemKey} className="flex gap-3">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-stone">
                  {item.product.image_url ? (
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-stone/30">
                      <ShoppingBag className="h-6 w-6 text-slate" />
                    </div>
                  )}
                  <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-forestGreen text-xs font-bold text-white">
                    {item.quantity}
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <p className="text-sm font-semibold text-barkBrown">{item.product.name}</p>
                    {(item.variant.size || item.variant.color) && (
                      <p className="text-xs text-slate">
                        {[item.variant.size, item.variant.color].filter(Boolean).join(" / ")}
                      </p>
                    )}
                  </div>
                  <p className="text-sm font-medium text-forestGreen">
                    ${(item.variant.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate">Subtotal</span>
            <span className="font-medium text-barkBrown">${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate">Shipping</span>
            <span className="font-medium text-barkBrown">
              {shippingCost === 0 ? "Calculated at next step" : `$${shippingCost.toFixed(2)}`}
            </span>
          </div>

          {taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate">Tax</span>
              <span className="font-medium text-barkBrown">${taxAmount.toFixed(2)}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between">
          <span className="font-semibold text-barkBrown">Total</span>
          <span className="font-serif text-2xl font-bold text-forestGreen">
            ${finalTotal.toFixed(2)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
