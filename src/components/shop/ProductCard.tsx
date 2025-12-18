"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Product, ProductVariant } from "@/types";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { getImageUrl } from "@/lib/constants";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  // Determine if product is sold out
  const isSoldOut = product.variants
    ? product.variants.every((v) => v.inventoryQuantity === 0)
    : false;

  // Get primary variant for products without multiple options
  const primaryVariant = product.variants?.[0];

  // Count unique option1Values for "X colors available" display
  const uniqueOptions = product.variants
    ? new Set(
        product.variants
          .filter((v) => v.option1Value)
          .map((v) => v.option1Value)
      )
    : new Set();

  const hasMultipleOptions = uniqueOptions.size > 1;

  // Determine effective price
  const displayPrice = primaryVariant?.price ?? product.basePrice;
  const compareAtPrice = primaryVariant?.compareAtPrice ?? product.compareAtPrice;

  // Handle quick add for single-variant products
  const handleQuickAdd = async () => {
    if (!primaryVariant || hasMultipleOptions) return;

    setIsAdding(true);
    try {
      addItem({
        product_id: parseInt(product.id),
        variant_id: parseInt(primaryVariant.id),
        quantity: 1,
        product: {
          id: parseInt(product.id),
          name: product.name,
          slug: product.slug,
          image_url: product.featuredImageUrl,
          category: product.category?.name,
        },
        variant: {
          id: parseInt(primaryVariant.id),
          size: primaryVariant.option1Name === "Size" ? primaryVariant.option1Value ?? undefined : undefined,
          color: primaryVariant.option1Name === "Color" ? primaryVariant.option1Value ?? undefined : undefined,
          sku: primaryVariant.sku || "",
          price: primaryVariant.price || product.basePrice,
          compare_at_price: primaryVariant.compareAtPrice ?? undefined,
        },
      });
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      toast.error("Failed to add to cart");
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  // Images for hover effect
  const featuredImage = getImageUrl(product.featuredImageUrl, 'product');
  const galleryImages = (product.galleryImages || []).filter(img => img && img.trim() !== '');
  const images = [featuredImage, ...galleryImages];
  const hasSecondaryImage = galleryImages.length > 0;

  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={`/shop/${product.slug}`}>
        <AspectRatio ratio={3 / 4}>
          <div
            className="relative h-full w-full"
            onMouseEnter={() => hasSecondaryImage && setCurrentImageIndex(1)}
            onMouseLeave={() => setCurrentImageIndex(0)}
          >
            <Image
              src={images[currentImageIndex]}
              alt={product.name}
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
            {compareAtPrice && displayPrice < compareAtPrice && (
              <Badge
                className="absolute right-2 top-2 bg-[#E07C24] text-white hover:bg-[#E07C24]/90"
              >
                Sale
              </Badge>
            )}
          </div>
        </AspectRatio>
      </Link>

      <CardContent className="p-4">
        <Link href={`/shop/${product.slug}`}>
          <h3 className="mb-2 font-semibold text-gray-900 transition-colors hover:text-[#2D5A3D]">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2">
          {compareAtPrice && displayPrice < compareAtPrice && (
            <span className="text-sm text-gray-400 line-through">
              ${compareAtPrice.toFixed(2)}
            </span>
          )}
          <span
            className={`font-bold ${
              compareAtPrice && displayPrice < compareAtPrice
                ? "text-[#E07C24]"
                : "text-gray-900"
            }`}
          >
            ${displayPrice.toFixed(2)}
          </span>
        </div>

        {hasMultipleOptions && (
          <p className="mt-2 text-sm text-gray-500">
            {uniqueOptions.size} {primaryVariant?.option1Name?.toLowerCase() || "option"}s available
          </p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {!hasMultipleOptions && !isSoldOut ? (
          <Button
            onClick={handleQuickAdd}
            disabled={isAdding}
            className="w-full bg-[#2D5A3D] hover:bg-[#234a30]"
          >
            {isAdding ? "Adding..." : "Quick Add"}
          </Button>
        ) : (
          <Button
            asChild
            disabled={isSoldOut}
            className="w-full bg-[#2D5A3D] hover:bg-[#234a30]"
            variant={isSoldOut ? "outline" : "default"}
          >
            <Link href={`/shop/${product.slug}`}>
              {isSoldOut ? "Sold Out" : "View Options"}
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
