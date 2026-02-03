"use client";

import { useState, useCallback } from "react";
import { ProductGallery } from "./ProductGallery";
import { ShopifyProductDetails } from "./ShopifyProductDetails";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import type {
  NormalizedShopifyProduct,
  NormalizedShopifyVariant,
} from "@/types/shopify";

interface ProductPageClientProps {
  product: NormalizedShopifyProduct;
}

export function ProductPageClient({ product }: ProductPageClientProps) {
  const [selectedVariant, setSelectedVariant] =
    useState<NormalizedShopifyVariant | null>(
      product.variants.find((v) => v.availableForSale) ||
        product.variants[0] ||
        null
    );

  const handleVariantChange = useCallback(
    (variant: NormalizedShopifyVariant | null) => {
      setSelectedVariant(variant);
    },
    []
  );

  // Determine if product is sold out
  const isSoldOut = !product.availableForSale;

  // Get primary variant for stock display
  const primaryVariant =
    product.variants.find((v) => v.availableForSale) || product.variants[0];

  const hasDiscount =
    product.compareAtPrice !== null && product.price < product.compareAtPrice;

  // Get the selected variant's image URL for the gallery
  const selectedImageUrl = selectedVariant?.image?.url || null;

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      {/* Product Gallery */}
      <div>
        <ProductGallery
          featuredImage={product.featuredImage?.url || "/placeholder-product.jpg"}
          galleryImages={product.images.map((img) => img.url)}
          productName={product.title}
          selectedImageUrl={selectedImageUrl}
        />
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        {/* Title and Badges */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            {product.productType && (
              <Badge variant="secondary">{product.productType}</Badge>
            )}
            {isSoldOut && <Badge variant="destructive">Sold Out</Badge>}
            {hasDiscount && (
              <Badge className="bg-[#E07C24] text-white">Sale</Badge>
            )}
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#4A3728] sm:text-4xl">
            {product.title}
          </h1>
        </div>

        {/* Variant Selector, Price & Add to Cart */}
        <ShopifyProductDetails
          product={product}
          isSoldOut={isSoldOut}
          selectedVariant={selectedVariant}
          onVariantChange={handleVariantChange}
        />

        {/* Stock Status */}
        {!isSoldOut && primaryVariant && (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-[#22C55E]" />
            <span className="text-slate">
              {primaryVariant.quantityAvailable !== null
                ? primaryVariant.quantityAvailable > 10
                  ? "In stock"
                  : `Only ${primaryVariant.quantityAvailable} left in stock`
                : "In stock"}
            </span>
          </div>
        )}

        {/* Product Description */}
        <Card className="bg-card">
          <CardContent className="prose prose-sm max-w-none">
            <div
              className="leading-relaxed text-[#333333]"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
