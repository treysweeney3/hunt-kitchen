import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductPageClient } from "@/components/shop/ProductPageClient";
import { JsonLd } from "@/components/seo/JsonLd";
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
        <ProductPageClient product={product} />
      </div>
    </div>
  );
}
