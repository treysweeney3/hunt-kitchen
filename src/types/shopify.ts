// ============================================================================
// Shopify Storefront API Types
// ============================================================================

/**
 * Shopify Money type for prices
 */
export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

/**
 * Shopify price range for products with variants
 */
export interface ShopifyPriceRange {
  minVariantPrice: ShopifyMoney;
  maxVariantPrice: ShopifyMoney;
}

/**
 * Shopify image type
 */
export interface ShopifyImage {
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
}

/**
 * Shopify selected option for variants (e.g., Size: Large)
 */
export interface ShopifySelectedOption {
  name: string;
  value: string;
}

/**
 * Shopify product option (e.g., Size with values [Small, Medium, Large])
 */
export interface ShopifyProductOption {
  id: string;
  name: string;
  values: string[];
}

/**
 * Shopify product variant
 */
export interface ShopifyVariant {
  id: string; // Global ID like gid://shopify/ProductVariant/123
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  price: ShopifyMoney;
  compareAtPrice: ShopifyMoney | null;
  selectedOptions: ShopifySelectedOption[];
  image: ShopifyImage | null;
  sku: string | null;
}

/**
 * Shopify product from Storefront API
 */
export interface ShopifyProduct {
  id: string; // Global ID like gid://shopify/Product/123
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  productType: string;
  vendor: string;
  tags: string[];
  priceRange: ShopifyPriceRange;
  compareAtPriceRange: ShopifyPriceRange | null;
  featuredImage: ShopifyImage | null;
  images: {
    edges: Array<{
      node: ShopifyImage;
    }>;
  };
  options: ShopifyProductOption[];
  variants: {
    edges: Array<{
      node: ShopifyVariant;
    }>;
  };
  seo: {
    title: string | null;
    description: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Shopify checkout line item input
 */
export interface ShopifyCheckoutLineItem {
  variantId: string;
  quantity: number;
}

/**
 * Shopify checkout (Cart API response)
 */
export interface ShopifyCheckout {
  id: string;
  checkoutUrl: string;
  totalPrice: ShopifyMoney;
  subtotalPrice: ShopifyMoney;
  totalTax: ShopifyMoney;
  lineItems: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        quantity: number;
        variant: ShopifyVariant;
      };
    }>;
  };
}

/**
 * Shopify Cart (newer Cart API)
 */
export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  cost: {
    totalAmount: ShopifyMoney;
    subtotalAmount: ShopifyMoney;
    totalTaxAmount: ShopifyMoney | null;
  };
  lines: {
    edges: Array<{
      node: ShopifyCartLine;
    }>;
  };
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: {
      id: string;
      title: string;
      handle: string;
      featuredImage: ShopifyImage | null;
    };
    price: ShopifyMoney;
    selectedOptions: ShopifySelectedOption[];
    image: ShopifyImage | null;
  };
}

// ============================================================================
// Simplified/Normalized Types for Application Use
// ============================================================================

/**
 * Normalized product for easier use in components
 */
export interface NormalizedShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  productType: string;
  vendor: string;
  tags: string[];
  price: number;
  compareAtPrice: number | null;
  currencyCode: string;
  featuredImage: ShopifyImage | null;
  images: ShopifyImage[];
  options: ShopifyProductOption[];
  variants: NormalizedShopifyVariant[];
  seo: {
    title: string | null;
    description: string | null;
  };
}

/**
 * Normalized variant for easier use in components
 */
export interface NormalizedShopifyVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  price: number;
  compareAtPrice: number | null;
  currencyCode: string;
  selectedOptions: ShopifySelectedOption[];
  image: ShopifyImage | null;
  sku: string | null;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ShopifyProductsResponse {
  products: {
    edges: Array<{
      node: ShopifyProduct;
      cursor: string;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string | null;
      endCursor: string | null;
    };
  };
}

export interface ShopifyProductResponse {
  product: ShopifyProduct | null;
}

export interface ShopifyCartCreateResponse {
  cartCreate: {
    cart: ShopifyCart | null;
    userErrors: Array<{
      field: string[];
      message: string;
    }>;
  };
}

// ============================================================================
// Sort Options
// ============================================================================

export type ShopifyProductSortKey =
  | "TITLE"
  | "PRODUCT_TYPE"
  | "VENDOR"
  | "UPDATED_AT"
  | "CREATED_AT"
  | "BEST_SELLING"
  | "PRICE"
  | "ID"
  | "RELEVANCE";

export interface ShopifyProductQueryOptions {
  first?: number;
  after?: string;
  sortKey?: ShopifyProductSortKey;
  reverse?: boolean;
  query?: string;
}
