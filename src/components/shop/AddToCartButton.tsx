"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Product, ProductVariant } from "@/types";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  product: Product;
  selectedVariant: ProductVariant | null;
  disabled?: boolean;
  className?: string;
}

export function AddToCartButton({
  product,
  selectedVariant,
  disabled = false,
  className,
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleQuantityChange = (newQuantity: number) => {
    const maxQuantity = selectedVariant?.inventoryQuantity || 999;
    const validQuantity = Math.max(1, Math.min(newQuantity, maxQuantity));
    setQuantity(validQuantity);
  };

  const handleAddToCart = async () => {
    if (!selectedVariant && product.variants && product.variants.length > 0) {
      toast.error("Please select product options");
      return;
    }

    setIsAdding(true);

    try {
      // Use primary variant if no variants exist
      const variant = selectedVariant || product.variants?.[0];

      if (!variant) {
        toast.error("Product variant not available");
        return;
      }

      // Check inventory
      if (variant.inventoryQuantity < quantity) {
        toast.error(`Only ${variant.inventoryQuantity} items available`);
        setQuantity(variant.inventoryQuantity);
        return;
      }

      addItem({
        product_id: parseInt(product.id),
        variant_id: parseInt(variant.id),
        quantity,
        product: {
          id: parseInt(product.id),
          name: product.name,
          slug: product.slug,
          image_url: product.featuredImageUrl,
          category: product.category?.name,
        },
        variant: {
          id: parseInt(variant.id),
          size: variant.option1Name === "Size" ? variant.option1Value ?? undefined : undefined,
          color: variant.option1Name === "Color" ? variant.option1Value ?? undefined : undefined,
          sku: variant.sku || "",
          price: variant.price || product.basePrice,
          compare_at_price: variant.compareAtPrice ?? undefined,
        },
      });

      toast.success(
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          <span>
            {quantity} x {product.name} added to cart
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
    selectedVariant?.inventoryQuantity === 0 ||
    (!selectedVariant && product.variants?.every((v) => v.inventoryQuantity === 0));

  const maxQuantity = selectedVariant?.inventoryQuantity || 999;

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
            onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
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
        {selectedVariant && (
          <span className="text-sm text-gray-500">
            {selectedVariant.inventoryQuantity} available
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
