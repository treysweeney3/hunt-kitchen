import type {
  ShopifyProduct,
  ShopifyProductsResponse,
  ShopifyProductResponse,
  ShopifyCartCreateResponse,
  ShopifyCart,
  ShopifyProductSortKey,
  ShopifyProductQueryOptions,
  NormalizedShopifyProduct,
  NormalizedShopifyVariant,
  ShopifyCheckoutLineItem,
} from "@/types/shopify";

// ============================================================================
// Configuration
// ============================================================================

const RAW_SHOPIFY_STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN =
  process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!RAW_SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
  console.warn(
    "Shopify environment variables not configured. Shop functionality will be limited."
  );
}

// Strip protocol if accidentally included in domain
const SHOPIFY_STORE_DOMAIN = RAW_SHOPIFY_STORE_DOMAIN?.replace(/^https?:\/\//, "");

const SHOPIFY_API_VERSION = "2024-01";
const SHOPIFY_STOREFRONT_URL = SHOPIFY_STORE_DOMAIN
  ? `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`
  : "";

// ============================================================================
// GraphQL Client
// ============================================================================

async function shopifyFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    throw new Error("Shopify is not configured");
  }

  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 0 }, // Disable cache for debugging
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("[Shopify] API error response:", text);
    throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
  }

  const json = await response.json();

  if (json.errors) {
    console.error("[Shopify] GraphQL Errors:", json.errors);
    throw new Error(json.errors[0]?.message || "Shopify GraphQL error");
  }

  return json.data as T;
}

// ============================================================================
// GraphQL Queries
// ============================================================================

const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    title
    handle
    description
    descriptionHtml
    availableForSale
    productType
    vendor
    tags
    createdAt
    updatedAt
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    featuredImage {
      url
      altText
      width
      height
    }
    images(first: 10) {
      edges {
        node {
          url
          altText
          width
          height
        }
      }
    }
    options {
      id
      name
      values
    }
    variants(first: 100) {
      edges {
        node {
          id
          title
          availableForSale
          quantityAvailable
          sku
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
          image {
            url
            altText
            width
            height
          }
        }
      }
    }
    seo {
      title
      description
    }
  }
`;

const GET_PRODUCTS_QUERY = `
  ${PRODUCT_FRAGMENT}
  query GetProducts($first: Int!, $after: String, $sortKey: ProductSortKeys, $reverse: Boolean, $query: String) {
    products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse, query: $query) {
      edges {
        node {
          ...ProductFields
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

const GET_PRODUCT_BY_HANDLE_QUERY = `
  ${PRODUCT_FRAGMENT}
  query GetProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductFields
    }
  }
`;

const CREATE_CART_MUTATION = `
  mutation CreateCart($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        cost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
          totalTaxAmount {
            amount
            currencyCode
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  selectedOptions {
                    name
                    value
                  }
                  image {
                    url
                    altText
                    width
                    height
                  }
                  product {
                    id
                    title
                    handle
                    featuredImage {
                      url
                      altText
                      width
                      height
                    }
                  }
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// ============================================================================
// Normalization Helpers
// ============================================================================

function normalizeVariant(variant: ShopifyProduct["variants"]["edges"][0]["node"]): NormalizedShopifyVariant {
  return {
    id: variant.id,
    title: variant.title,
    availableForSale: variant.availableForSale,
    quantityAvailable: variant.quantityAvailable,
    price: parseFloat(variant.price.amount),
    compareAtPrice: variant.compareAtPrice
      ? parseFloat(variant.compareAtPrice.amount)
      : null,
    currencyCode: variant.price.currencyCode,
    selectedOptions: variant.selectedOptions,
    image: variant.image,
    sku: variant.sku,
  };
}

function normalizeProduct(product: ShopifyProduct): NormalizedShopifyProduct {
  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    description: product.description,
    descriptionHtml: product.descriptionHtml,
    availableForSale: product.availableForSale,
    productType: product.productType,
    vendor: product.vendor,
    tags: product.tags,
    price: parseFloat(product.priceRange.minVariantPrice.amount),
    compareAtPrice: product.compareAtPriceRange?.minVariantPrice
      ? parseFloat(product.compareAtPriceRange.minVariantPrice.amount)
      : null,
    currencyCode: product.priceRange.minVariantPrice.currencyCode,
    featuredImage: product.featuredImage,
    images: product.images.edges.map((edge) => edge.node),
    options: product.options,
    variants: product.variants.edges.map((edge) => normalizeVariant(edge.node)),
    seo: product.seo,
  };
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch all products from Shopify with optional filtering and sorting
 */
export async function getProducts(
  options: ShopifyProductQueryOptions = {}
): Promise<{
  products: NormalizedShopifyProduct[];
  pageInfo: ShopifyProductsResponse["products"]["pageInfo"];
}> {
  const { first = 50, after, sortKey = "CREATED_AT", reverse = true, query } = options;

  const data = await shopifyFetch<ShopifyProductsResponse>(GET_PRODUCTS_QUERY, {
    first,
    after,
    sortKey,
    reverse,
    query: query || null,
  });

  return {
    products: data.products.edges.map((edge) => normalizeProduct(edge.node)),
    pageInfo: data.products.pageInfo,
  };
}

/**
 * Fetch a single product by its handle (slug)
 */
export async function getProductByHandle(
  handle: string
): Promise<NormalizedShopifyProduct | null> {
  try {
    const data = await shopifyFetch<ShopifyProductResponse>(
      GET_PRODUCT_BY_HANDLE_QUERY,
      { handle }
    );

    if (!data.product) {
      return null;
    }

    return normalizeProduct(data.product);
  } catch (error) {
    console.error(`[Shopify] Failed to fetch product "${handle}":`, error);
    return null;
  }
}

/**
 * Fetch multiple products by their handles
 */
export async function getProductsByHandles(
  handles: string[]
): Promise<NormalizedShopifyProduct[]> {
  const products = await Promise.all(
    handles.map((handle) => getProductByHandle(handle))
  );
  return products.filter((p): p is NormalizedShopifyProduct => p !== null);
}

/**
 * Create a Shopify checkout/cart and get the checkout URL
 */
export async function createCheckout(
  lineItems: ShopifyCheckoutLineItem[]
): Promise<ShopifyCart> {
  const data = await shopifyFetch<ShopifyCartCreateResponse>(
    CREATE_CART_MUTATION,
    {
      input: {
        lines: lineItems.map((item) => ({
          merchandiseId: item.variantId,
          quantity: item.quantity,
        })),
      },
    }
  );

  if (data.cartCreate.userErrors.length > 0) {
    throw new Error(data.cartCreate.userErrors[0].message);
  }

  if (!data.cartCreate.cart) {
    throw new Error("Failed to create checkout");
  }

  return data.cartCreate.cart;
}

/**
 * Build a search query string for Shopify
 */
export function buildSearchQuery(params: {
  search?: string;
  productType?: string;
  vendor?: string;
  tag?: string;
  available?: boolean;
}): string | undefined {
  const parts: string[] = [];

  if (params.search) {
    parts.push(params.search);
  }

  if (params.productType) {
    parts.push(`product_type:${params.productType}`);
  }

  if (params.vendor) {
    parts.push(`vendor:${params.vendor}`);
  }

  if (params.tag) {
    parts.push(`tag:${params.tag}`);
  }

  if (params.available === true) {
    parts.push("available_for_sale:true");
  }

  return parts.length > 0 ? parts.join(" AND ") : undefined;
}

/**
 * Map sort option from URL params to Shopify sort key
 */
export function mapSortOption(
  sort?: string
): { sortKey: ShopifyProductSortKey; reverse: boolean } {
  switch (sort) {
    case "price-asc":
      return { sortKey: "PRICE", reverse: false };
    case "price-desc":
      return { sortKey: "PRICE", reverse: true };
    case "title-asc":
      return { sortKey: "TITLE", reverse: false };
    case "title-desc":
      return { sortKey: "TITLE", reverse: true };
    case "best-selling":
      return { sortKey: "BEST_SELLING", reverse: false };
    case "newest":
    default:
      return { sortKey: "CREATED_AT", reverse: true };
  }
}

/**
 * Check if Shopify is configured
 */
export function isShopifyConfigured(): boolean {
  return !!(RAW_SHOPIFY_STORE_DOMAIN && SHOPIFY_STOREFRONT_ACCESS_TOKEN);
}
