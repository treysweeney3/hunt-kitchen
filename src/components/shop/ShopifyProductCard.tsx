"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { ShoppingCart, Check } from "lucide-react";
import type { NormalizedShopifyProduct } from "@/types/shopify";

interface ShopifyProductCardProps {
  product: NormalizedShopifyProduct;
  hideAddToCart?: boolean;
}

export function ShopifyProductCard({ product, hideAddToCart = false }: ShopifyProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  // Determine if product is sold out
  const isSoldOut = !product.availableForSale;

  // Determine if there's a sale
  const isOnSale =
    product.compareAtPrice !== null && product.price < product.compareAtPrice;


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

  // Handle quick add to cart
  const handleQuickAdd = async () => {
    const variant = product.variants[0];
    if (!variant) return;

    setIsAdding(true);
    try {
      const variantTitle =
        variant.selectedOptions.length > 0
          ? variant.selectedOptions.map((opt) => `${opt.name}: ${opt.value}`).join(", ")
          : variant.title;

      addItem({
        product_id: product.id,
        variant_id: variant.id,
        quantity: 1,
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
      toast.success(`${product.title} added to cart`);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
    } catch (error) {
      toast.error("Failed to add to cart");
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="group relative flex h-full flex-col gap-0 overflow-hidden py-0 transition-shadow hover:shadow-lg">
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

      <CardContent className="flex flex-grow flex-col p-3">
        <Link href={`/shop/product/${product.handle}`}>
          <h3 className="mb-1 font-semibold text-gray-900 transition-colors hover:text-[#2D5A3D]">
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

        {product.handle === "pre-order-cookbook" && (
          <p className="mt-1 text-xs text-gray-400">
            This item is available for pre-order. Estimated to ship in 2-3 weeks.
          </p>
        )}
      </CardContent>

      <CardFooter className="mt-auto p-3 pt-0">
        <div className="flex w-full gap-2">
          <Button
            asChild
            disabled={isSoldOut}
            className={`flex-1 shrink min-w-0 ${isSoldOut ? "bg-gray-400 text-white hover:bg-gray-400" : "bg-[#2D5A3D] hover:bg-[#234a30]"}`}
          >
            <Link href={`/shop/product/${product.handle}`}>
              {isSoldOut ? "Sold Out" : "View Product"}
            </Link>
          </Button>
          {!isSoldOut && !hideAddToCart && (
            <Button
              onClick={handleQuickAdd}
              disabled={isAdding || showSuccess}
              size="icon"
              className={`transition-all duration-300 ${
                showSuccess
                  ? "bg-successGreen hover:bg-successGreen"
                  : "bg-[#2D5A3D] hover:bg-[#234a30]"
              }`}
              title="Add to cart"
            >
              {showSuccess ? (
                <Check className="h-4 w-4 animate-success-check" />
              ) : (
                <ShoppingCart className={`h-4 w-4 transition-transform ${isAdding ? "scale-75" : ""}`} />
              )}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
