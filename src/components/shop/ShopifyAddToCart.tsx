"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  NormalizedShopifyProduct,
  NormalizedShopifyVariant,
} from "@/types/shopify";

interface ShopifyAddToCartProps {
  product: NormalizedShopifyProduct;
  selectedVariant: NormalizedShopifyVariant | null;
  disabled?: boolean;
  className?: string;
}

export function ShopifyAddToCart({
  product,
  selectedVariant,
  disabled = false,
  className,
}: ShopifyAddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleQuantityChange = (newQuantity: number) => {
    const maxQuantity = selectedVariant?.quantityAvailable || 999;
    const validQuantity = Math.max(1, Math.min(newQuantity, maxQuantity));
    setQuantity(validQuantity);
  };

  const handleAddToCart = async () => {
    // Require variant selection for products with variants
    if (!selectedVariant && product.variants.length > 0) {
      toast.error("Please select product options");
      return;
    }

    setIsAdding(true);

    try {
      // Use first variant if no selection needed (single variant product)
      const variant = selectedVariant || product.variants[0];

      if (!variant) {
        toast.error("Product variant not available");
        return;
      }

      // Check inventory
      if (
        variant.quantityAvailable !== null &&
        variant.quantityAvailable < quantity
      ) {
        toast.error(`Only ${variant.quantityAvailable} items available`);
        setQuantity(variant.quantityAvailable);
        return;
      }

      // Get variant options as a string (e.g., "Size: Large, Color: Black")
      const variantTitle =
        variant.selectedOptions.length > 0
          ? variant.selectedOptions.map((opt) => `${opt.name}: ${opt.value}`).join(", ")
          : variant.title;

      addItem({
        product_id: product.id, // Shopify global ID
        variant_id: variant.id, // Shopify variant global ID
        quantity,
        product: {
          id: product.id,
          name: product.title,
          slug: product.handle,
          image_url: product.featuredImage?.url || "",
        },
        variant: {
          id: variant.id,
          title: variantTitle,
          sku: variant.sku || "",
          price: variant.price,
          compare_at_price: variant.compareAtPrice ?? undefined,
        },
      });

      toast.success(
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          <span>
            {quantity} x {product.title} added to cart
          </span>
        </div>
      );

      // Reset quantity after successful add
      setQuantity(1);
    } catch (error) {
      toast.error("Failed to add to cart");
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  const isOutOfStock =
    selectedVariant?.availableForSale === false ||
    (!selectedVariant && product.variants.every((v) => !v.availableForSale));

  const maxQuantity = selectedVariant?.quantityAvailable || 999;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Quantity selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Quantity</label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1 || isOutOfStock}
            className="h-10 w-10"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            min="1"
            max={maxQuantity}
            value={quantity}
            onChange={(e) =>
              handleQuantityChange(parseInt(e.target.value) || 1)
            }
            disabled={isOutOfStock}
            className="h-10 w-20 text-center"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= maxQuantity || isOutOfStock}
            className="h-10 w-10"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {selectedVariant?.quantityAvailable !== null &&
          selectedVariant?.quantityAvailable !== undefined && (
            <span className="text-sm text-gray-500">
              {selectedVariant.quantityAvailable} available
            </span>
          )}
      </div>

      {/* Add to cart button */}
      <Button
        onClick={handleAddToCart}
        disabled={disabled || isAdding || isOutOfStock}
        className={cn(
          "w-full bg-[#E07C24] text-white hover:bg-[#c96a1e]",
          isOutOfStock && "cursor-not-allowed opacity-50"
        )}
        size="lg"
      >
        {isAdding ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Adding...
          </span>
        ) : isOutOfStock ? (
          "Out of Stock"
        ) : (
          <span className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Add to Cart
          </span>
        )}
      </Button>

      {isOutOfStock && (
        <p className="text-sm text-red-600">
          This item is currently out of stock
        </p>
      )}
    </div>
  );
}
