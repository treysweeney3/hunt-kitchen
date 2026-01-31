"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, isEmpty, subtotal, total, updateQuantity, removeItem } =
    useCart();
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());

  const handleUpdateQuantity = (variantId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(variantId, newQuantity);
  };

  const handleRemoveItem = (variantId: string) => {
    setRemovingItems((prev) => new Set(prev).add(variantId));

    setTimeout(() => {
      removeItem(variantId);
      setRemovingItems((prev) => {
        const next = new Set(prev);
        next.delete(variantId);
        return next;
      });
    }, 200);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  // Build the product URL - for Shopify products use /shop/product/, for legacy use /shop/
  const getProductUrl = (item: (typeof items)[0]) => {
    return item.product_id.startsWith("gid://")
      ? `/shop/product/${item.product.slug}`
      : `/shop/${item.product.slug}`;
  };

  // Get variant display text
  const getVariantDisplay = (item: (typeof items)[0]) => {
    return (
      item.variant.title ||
      [item.variant.size, item.variant.color].filter(Boolean).join(" / ") ||
      null
    );
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full bg-cream p-0 sm:w-96">
        <SheetHeader className="border-b border-stone p-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-serif text-xl text-forestGreen">
              Shopping Cart
            </SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-barkBrown hover:text-hunterOrange"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>

        {isEmpty ? (
          <div className="flex h-[calc(100vh-88px)] flex-col items-center justify-center px-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-stone/30">
              <ShoppingBag className="h-12 w-12 text-slate" />
            </div>
            <h3 className="mt-6 font-serif text-xl font-semibold text-barkBrown">
              Your cart is empty
            </h3>
            <p className="mt-2 text-center text-sm text-slate">
              Add some products to get started.
            </p>
            <Link href="/shop" onClick={onClose} className="mt-6">
              <Button className="bg-hunterOrange text-white hover:bg-hunterOrange/90">
                Shop Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex h-[calc(100vh-88px)] flex-col">
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-4">
                {items.map((item) => {
                  const isRemoving = removingItems.has(item.variant_id);
                  const productUrl = getProductUrl(item);
                  const variantDisplay = getVariantDisplay(item);

                  return (
                    <div
                      key={item.variant_id}
                      className={cn(
                        "flex gap-4 rounded-lg bg-white p-4 transition-all duration-200",
                        isRemoving && "scale-95 opacity-0"
                      )}
                    >
                      {/* Product Image */}
                      <Link
                        href={productUrl}
                        onClick={onClose}
                        className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-stone"
                      >
                        {item.product.image_url ? (
                          <Image
                            src={item.product.image_url}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-stone/30">
                            <ShoppingBag className="h-8 w-8 text-slate" />
                          </div>
                        )}
                      </Link>

                      {/* Product Details */}
                      <div className="flex flex-1 flex-col">
                        <Link
                          href={productUrl}
                          onClick={onClose}
                          className="font-semibold text-barkBrown hover:text-hunterOrange"
                        >
                          {item.product.name}
                        </Link>

                        {/* Variant Info */}
                        {variantDisplay && (
                          <p className="mt-1 text-xs text-slate">
                            {variantDisplay}
                          </p>
                        )}

                        {/* Price */}
                        <div className="mt-2 flex items-center gap-2">
                          {item.variant.compare_at_price &&
                            item.variant.compare_at_price > item.variant.price && (
                              <span className="text-xs text-slate line-through">
                                {formatPrice(item.variant.compare_at_price)}
                              </span>
                            )}
                          <span className="font-semibold text-forestGreen">
                            {formatPrice(item.variant.price)}
                          </span>
                        </div>

                        {/* Quantity Controls */}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center rounded-md border border-stone">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none text-barkBrown hover:text-hunterOrange"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.variant_id,
                                  item.quantity - 1
                                )
                              }
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-10 text-center text-sm font-medium text-barkBrown">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none text-barkBrown hover:text-hunterOrange"
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.variant_id,
                                  item.quantity + 1
                                )
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-errorRed hover:bg-errorRed/10 hover:text-errorRed"
                            onClick={() => handleRemoveItem(item.variant_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Cart Summary */}
            <div className="border-t border-stone bg-white p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate">Subtotal</span>
                  <span className="font-semibold text-barkBrown">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <Separator className="bg-stone" />

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-barkBrown">Total</span>
                  <span className="font-serif text-xl font-bold text-forestGreen">
                    {formatPrice(total)}
                  </span>
                </div>

                <p className="text-xs text-slate">
                  Shipping and taxes calculated at checkout
                </p>

                <div className="space-y-2 pt-2">
                  <Link href="/cart" onClick={onClose} className="block">
                    <Button
                      variant="outline"
                      className="w-full border-forestGreen text-forestGreen hover:bg-forestGreen hover:text-white"
                    >
                      View Cart
                    </Button>
                  </Link>
                  <Link href="/cart" onClick={onClose} className="block">
                    <Button className="w-full bg-hunterOrange text-white hover:bg-hunterOrange/90">
                      Checkout
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
