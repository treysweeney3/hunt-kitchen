"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartItem as CartItemType, useCartStore } from "@/stores/cartStore";
import { Trash2, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;

    setIsUpdating(true);
    try {
      updateQuantity(item.product_id, item.variant_id, newQuantity);
      toast.success("Cart updated");
    } catch (error) {
      toast.error("Failed to update cart");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = () => {
    removeItem(item.product_id, item.variant_id);
    toast.success(`${item.product.name} removed from cart`);
  };

  const lineTotal = item.variant.price * item.quantity;
  const hasDiscount =
    item.variant.compare_at_price &&
    item.variant.price < item.variant.compare_at_price;
  const savedAmount = hasDiscount
    ? (item.variant.compare_at_price! - item.variant.price) * item.quantity
    : 0;

  return (
    <div className="flex gap-4 border-b py-6 last:border-b-0">
      {/* Product Image */}
      <Link
        href={`/shop/${item.product.slug}`}
        className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-gray-100"
      >
        {item.product.image_url && (
          <Image
            src={item.product.image_url}
            alt={item.product.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        )}
      </Link>

      {/* Product Details */}
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <div className="flex-1">
            <Link
              href={`/shop/${item.product.slug}`}
              className="font-semibold text-gray-900 hover:text-[#2D5A3D]"
            >
              {item.product.name}
            </Link>

            {/* Variant details */}
            <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-500">
              {item.variant.size && <span>Size: {item.variant.size}</span>}
              {item.variant.size && item.variant.color && <span>•</span>}
              {item.variant.color && <span>Color: {item.variant.color}</span>}
            </div>

            {item.variant.sku && (
              <p className="mt-1 text-xs text-gray-400">SKU: {item.variant.sku}</p>
            )}
          </div>

          {/* Price */}
          <div className="ml-4 text-right">
            <div className="flex flex-col items-end">
              {hasDiscount && (
                <span className="text-sm text-gray-400 line-through">
                  ${item.variant.compare_at_price!.toFixed(2)}
                </span>
              )}
              <span
                className={`font-bold ${
                  hasDiscount ? "text-[#E07C24]" : "text-gray-900"
                }`}
              >
                ${item.variant.price.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Quantity controls and total */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={isUpdating || item.quantity <= 1}
              className="h-8 w-8"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              disabled={isUpdating}
              className="h-8 w-16 text-center"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isUpdating}
              className="h-8 w-8"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            {/* Line total */}
            <div className="text-right">
              <div className="font-bold text-gray-900">
                ${lineTotal.toFixed(2)}
              </div>
              {hasDiscount && savedAmount > 0 && (
                <div className="text-xs text-green-600">
                  Save ${savedAmount.toFixed(2)}
                </div>
              )}
            </div>

            {/* Remove button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              className="text-gray-400 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
