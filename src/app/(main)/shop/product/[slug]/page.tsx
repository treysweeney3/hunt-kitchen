import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductGallery } from '@/components/shop/ProductGallery';
import { ProductDetailsClient } from '@/components/shop/ProductDetailsClient';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { JsonLd } from '@/components/seo/JsonLd';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Truck, Shield } from 'lucide-react';
import { generateMetadata as generateSEOMetadata, generateProductStructuredData } from '@/lib/seo';
import { siteConfig } from '@/config/site';
import type { Product } from '@/types';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getProduct(slug: string): Promise<Product | null> {
  // TODO: Implement actual API call
  return null;
}

async function getRelatedProducts(productId: string): Promise<Product[]> {
  // TODO: Implement actual API call
  return [];
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const keywords = [
    product.name,
    product.category?.name || '',
    'hunting merchandise',
    'outdoor gear',
    'wild game cooking',
  ].filter(Boolean);

  return generateSEOMetadata({
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.shortDescription || product.description,
    keywords,
    image: product.featuredImageUrl,
    canonical: `${siteConfig.url}/shop/product/${slug}`,
    type: 'product',
  });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product.id);

  // Determine if product is sold out
  const isSoldOut = product.variants
    ? product.variants.every((v) => v.inventoryQuantity === 0)
    : false;

  // Get primary variant for initial display
  const primaryVariant = product.variants?.[0];
  const displayPrice = primaryVariant?.price ?? product.basePrice;
  const compareAtPrice = primaryVariant?.compareAtPrice ?? product.compareAtPrice;
  const hasDiscount = compareAtPrice && displayPrice < compareAtPrice;

  // Generate Product structured data
  const productUrl = `${siteConfig.url}/shop/product/${slug}`;
  const productStructuredData = generateProductStructuredData(product as any, productUrl);

  return (
    <div className="min-h-screen bg-cream py-8">
      {/* JSON-LD Structured Data */}
      <JsonLd data={productStructuredData as unknown as Record<string, unknown>} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Product Details Grid */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Product Gallery */}
          <div>
            <ProductGallery
              featuredImage={product.featuredImageUrl}
              galleryImages={product.galleryImages}
              productName={product.name}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <div className="mb-2 flex items-center gap-2">
                {product.category && (
                  <Badge variant="secondary">{product.category.name}</Badge>
                )}
                {isSoldOut && <Badge variant="destructive">Sold Out</Badge>}
                {hasDiscount && (
                  <Badge className="bg-[#E07C24] text-white">Sale</Badge>
                )}
              </div>
              <h1 className="font-serif text-3xl font-bold text-[#4A3728] sm:text-4xl">
                {product.name}
              </h1>
              {product.shortDescription && (
                <p className="mt-2 text-lg text-slate">{product.shortDescription}</p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              {hasDiscount && (
                <span className="text-2xl text-slate line-through">
                  ${compareAtPrice?.toFixed(2)}
                </span>
              )}
              <span
                className={`text-3xl font-bold ${
                  hasDiscount ? 'text-[#E07C24]' : 'text-[#4A3728]'
                }`}
              >
                ${displayPrice.toFixed(2)}
              </span>
            </div>

            <Separator />

            {/* Variant Selector & Add to Cart */}
            <ProductDetailsClient product={product} isSoldOut={isSoldOut} />

            {/* Stock Status */}
            {!isSoldOut && primaryVariant && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-[#22C55E]" />
                <span className="text-slate">
                  {primaryVariant.inventoryQuantity > 10
                    ? 'In stock'
                    : `Only ${primaryVariant.inventoryQuantity} left in stock`}
                </span>
              </div>
            )}

            {/* Features */}
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-[#2D5A3D] mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#4A3728]">Fast Shipping</p>
                    <p className="text-sm text-slate">
                      Free shipping on orders over $50
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-[#2D5A3D] mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#4A3728]">Quality Guarantee</p>
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
                    className="text-[#333333] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="shipping" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4 text-[#333333]">
                    <div>
                      <h3 className="font-semibold text-[#4A3728]">Shipping Options</h3>
                      <ul className="mt-2 space-y-2 text-sm">
                        <li>Standard Shipping: 5-7 business days</li>
                        <li>Express Shipping: 2-3 business days</li>
                        <li>Free shipping on orders over $50</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#4A3728]">Returns</h3>
                      <p className="mt-2 text-sm">
                        We accept returns within 30 days of delivery. Items must be
                        unworn, unwashed, and in original condition with tags attached.
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
                      Our apparel runs true to size. If you're between sizes, we
                      recommend sizing up for a more comfortable fit.
                    </p>
                    {/* TODO: Add actual size chart table */}
                    <p className="text-sm text-slate">
                      For detailed measurements, please contact us.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <div className="mb-8">
              <h2 className="font-serif text-3xl font-bold text-[#4A3728]">
                You May Also Like
              </h2>
              <p className="mt-2 text-lg text-slate">
                Similar products from our collection
              </p>
            </div>
            <ProductGrid products={relatedProducts.slice(0, 4)} />
          </section>
        )}
      </div>
    </div>
  );
}
