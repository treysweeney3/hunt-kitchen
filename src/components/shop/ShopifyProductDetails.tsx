"use client";

import { ShopifyVariantSelector } from "./ShopifyVariantSelector";
import { ShopifyAddToCart } from "./ShopifyAddToCart";
import { Separator } from "@/components/ui/separator";
import type {
  NormalizedShopifyProduct,
  NormalizedShopifyVariant,
} from "@/types/shopify";

interface ShopifyProductDetailsProps {
  product: NormalizedShopifyProduct;
  isSoldOut: boolean;
  selectedVariant: NormalizedShopifyVariant | null;
  onVariantChange: (variant: NormalizedShopifyVariant | null) => void;
}

export function ShopifyProductDetails({
  product,
  isSoldOut,
  selectedVariant,
  onVariantChange,
}: ShopifyProductDetailsProps) {

  const hasMultipleOptions =
    product.options.length > 0 &&
    product.options.some((opt) => opt.values.length > 1);

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: selectedVariant?.currencyCode || product.currencyCode,
    }).format(price);
  };

  // Get current price based on selected variant
  const currentPrice = selectedVariant?.price ?? product.price;
  const currentCompareAtPrice =
    selectedVariant?.compareAtPrice ?? product.compareAtPrice;

  return (
    <>
      {/* Dynamic Price Display */}
      <div className="flex items-baseline gap-3">
        {currentCompareAtPrice !== null && currentPrice < currentCompareAtPrice && (
          <span className="text-2xl text-slate line-through">
            {formatPrice(currentCompareAtPrice)}
          </span>
        )}
        <span
          className={`text-3xl font-bold ${
            currentCompareAtPrice && currentPrice < currentCompareAtPrice
              ? "text-[#E07C24]"
              : "text-[#4A3728]"
          }`}
        >
          {formatPrice(currentPrice)}
        </span>
      </div>

      <Separator />

      {/* Variant Selector */}
      {hasMultipleOptions && (
        <>
          <ShopifyVariantSelector
            variants={product.variants}
            options={product.options}
            onVariantChange={onVariantChange}
          />
          <Separator />
        </>
      )}

      {/* Add to Cart */}
      <ShopifyAddToCart
        product={product}
        selectedVariant={selectedVariant}
        disabled={isSoldOut}
      />
    </>
  );
}
