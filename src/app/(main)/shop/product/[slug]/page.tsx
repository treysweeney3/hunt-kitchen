import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/shop/ProductGallery";
import { ShopifyProductDetails } from "@/components/shop/ShopifyProductDetails";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Truck, Shield } from "lucide-react";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { getProductByHandle, isShopifyConfigured } from "@/lib/shopify";
import type { NormalizedShopifyProduct } from "@/types/shopify";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getProduct(handle: string): Promise<NormalizedShopifyProduct | null> {
  if (!isShopifyConfigured()) {
    return null;
  }

  try {
    return await getProductByHandle(handle);
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const keywords = [
    product.title,
    product.productType,
    "hunting merchandise",
    "outdoor gear",
    "wild game cooking",
    ...product.tags,
  ].filter(Boolean);

  return generateSEOMetadata({
    title: product.seo.title || product.title,
    description:
      product.seo.description || product.description.slice(0, 160),
    keywords,
    image: product.featuredImage?.url,
    canonical: `${siteConfig.url}/shop/product/${slug}`,
    type: "product",
  });
}

// Generate Product structured data for Shopify products
function generateShopifyProductStructuredData(
  product: NormalizedShopifyProduct,
  url: string
) {
  const images = [
    product.featuredImage?.url,
    ...product.images.map((img) => img.url),
  ].filter(Boolean);

  // Determine availability
  let availability = "https://schema.org/InStock";
  if (!product.availableForSale) {
    availability = "https://schema.org/OutOfStock";
  } else if (product.variants.every((v) => !v.availableForSale)) {
    availability = "https://schema.org/OutOfStock";
  }

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: images,
    brand: {
      "@type": "Brand",
      name: product.vendor || siteConfig.name,
    },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: product.currencyCode,
      price: product.price.toString(),
      availability,
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: siteConfig.name,
      },
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  // Determine if product is sold out
  const isSoldOut = !product.availableForSale;

  // Get primary variant for initial display
  const primaryVariant =
    product.variants.find((v) => v.availableForSale) || product.variants[0];
  const hasDiscount =
    product.compareAtPrice !== null && product.price < product.compareAtPrice;

  // Generate Product structured data
  const productUrl = `${siteConfig.url}/shop/product/${slug}`;
  const productStructuredData = generateShopifyProductStructuredData(
    product,
    productUrl
  );

  return (
    <div className="min-h-screen bg-cream py-8">
      {/* JSON-LD Structured Data */}
      <JsonLd data={productStructuredData as Record<string, unknown>} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Product Details Grid */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Product Gallery */}
          <div>
            <ProductGallery
              featuredImage={product.featuredImage?.url || "/placeholder-product.jpg"}
              galleryImages={product.images.map((img) => img.url)}
              productName={product.title}
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
              {product.vendor && (
                <p className="mt-2 text-lg text-slate">by {product.vendor}</p>
              )}
            </div>

            {/* Variant Selector, Price & Add to Cart */}
            <ShopifyProductDetails product={product} isSoldOut={isSoldOut} />

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

            {/* Features */}
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-start gap-3">
                  <Truck className="mt-0.5 h-5 w-5 text-[#2D5A3D]" />
                  <div>
                    <p className="font-semibold text-[#4A3728]">Fast Shipping</p>
                    <p className="text-sm text-slate">
                      Free shipping on orders over $50
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 text-[#2D5A3D]" />
                  <div>
                    <p className="font-semibold text-[#4A3728]">
                      Quality Guarantee
                    </p>
                    <p className="text-sm text-slate">
                      30-day money-back guarantee
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="shipping">Shipping Info</TabsTrigger>
              <TabsTrigger value="size-guide">Size Guide</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="prose prose-sm max-w-none pt-6">
                  <div
                    className="leading-relaxed text-[#333333]"
                    dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="shipping" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4 text-[#333333]">
                    <div>
                      <h3 className="font-semibold text-[#4A3728]">
                        Shipping Options
                      </h3>
                      <ul className="mt-2 space-y-2 text-sm">
                        <li>Standard Shipping: 5-7 business days</li>
                        <li>Express Shipping: 2-3 business days</li>
                        <li>Free shipping on orders over $50</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#4A3728]">Returns</h3>
                      <p className="mt-2 text-sm">
                        We accept returns within 30 days of delivery. Items must
                        be unworn, unwashed, and in original condition with tags
                        attached.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="size-guide" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4 text-[#333333]">
                    <h3 className="font-semibold text-[#4A3728]">Size Chart</h3>
                    <p className="text-sm text-slate">
                      Our apparel runs true to size. If you&apos;re between sizes,
                      we recommend sizing up for a more comfortable fit.
                    </p>
                    <p className="text-sm text-slate">
                      For detailed measurements, please contact us.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
