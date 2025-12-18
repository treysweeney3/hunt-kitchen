'use client';

import { useState } from 'react';
import { VariantSelector } from './VariantSelector';
import { AddToCartButton } from './AddToCartButton';
import { Separator } from '@/components/ui/separator';
import type { Product, ProductVariant } from '@/types';

interface ProductDetailsClientProps {
  product: Product;
  isSoldOut: boolean;
}

export function ProductDetailsClient({ product, isSoldOut }: ProductDetailsClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.[0] || null
  );
  const [currentPrice, setCurrentPrice] = useState(
    product.variants?.[0]?.price ?? product.basePrice
  );

  const handleVariantChange = (variant: ProductVariant | null, price: number) => {
    setSelectedVariant(variant);
    setCurrentPrice(price);
  };

  return (
    <>
      {/* Variant Selector */}
      {product.variants && product.variants.length > 0 && (
        <>
          <VariantSelector
            variants={product.variants}
            basePrice={product.basePrice}
            onVariantChange={handleVariantChange}
          />
          <Separator />
        </>
      )}

      {/* Add to Cart */}
      <AddToCartButton
        product={product}
        selectedVariant={selectedVariant}
        disabled={isSoldOut}
      />
    </>
  );
}
