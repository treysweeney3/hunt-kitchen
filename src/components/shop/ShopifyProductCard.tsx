"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import type { NormalizedShopifyProduct } from "@/types/shopify";

interface ShopifyProductCardProps {
  product: NormalizedShopifyProduct;
}

export function ShopifyProductCard({ product }: ShopifyProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Determine if product is sold out
  const isSoldOut = !product.availableForSale;

  // Check if product has multiple variants
  const hasMultipleVariants = product.variants.length > 1;

  // Determine if there's a sale
  const isOnSale =
    product.compareAtPrice !== null && product.price < product.compareAtPrice;

  // Get available options (variants that are in stock)
  const availableVariants = product.variants.filter((v) => v.availableForSale);
  const variantCount = availableVariants.length;

  // Get option label for display (e.g., "3 sizes available")
  const optionLabel =
    product.options.length > 0 && hasMultipleVariants
      ? `${variantCount} ${product.options[0].name.toLowerCase()}${variantCount !== 1 ? "s" : ""} available`
      : null;

  // Images for hover effect
  const featuredImage = product.featuredImage?.url || "/placeholder-product.jpg";
  const images = [featuredImage, ...product.images.slice(0, 1).map((img) => img.url)];
  const hasSecondaryImage = product.images.length > 0;

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: product.currencyCode,
    }).format(price);
  };

  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/shop/product/${product.handle}`}>
        <AspectRatio ratio={3 / 4}>
          <div
            className="relative h-full w-full"
            onMouseEnter={() => hasSecondaryImage && setCurrentImageIndex(1)}
            onMouseLeave={() => setCurrentImageIndex(0)}
          >
            <Image
              src={images[currentImageIndex]}
              alt={product.featuredImage?.altText || product.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
            {isSoldOut && (
              <Badge
                variant="destructive"
                className="absolute left-2 top-2 bg-opacity-90"
              >
                Sold Out
              </Badge>
            )}
            {isOnSale && !isSoldOut && (
              <Badge className="absolute right-2 top-2 bg-[#E07C24] text-white hover:bg-[#E07C24]/90">
                Sale
              </Badge>
            )}
          </div>
        </AspectRatio>
      </Link>

      <CardContent className="p-4">
        <Link href={`/shop/product/${product.handle}`}>
          <h3 className="mb-2 font-semibold text-gray-900 transition-colors hover:text-[#2D5A3D]">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center gap-2">
          {isOnSale && product.compareAtPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
          <span
            className={`font-bold ${
              isOnSale ? "text-[#E07C24]" : "text-gray-900"
            }`}
          >
            {formatPrice(product.price)}
          </span>
        </div>

        {optionLabel && (
          <p className="mt-2 text-sm text-gray-500">{optionLabel}</p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          asChild
          disabled={isSoldOut}
          className="w-full bg-[#2D5A3D] hover:bg-[#234a30]"
          variant={isSoldOut ? "outline" : "default"}
        >
          <Link href={`/shop/product/${product.handle}`}>
            {isSoldOut
              ? "Sold Out"
              : hasMultipleVariants
                ? "View Options"
                : "View Product"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
