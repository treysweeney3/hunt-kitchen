/**
 * API Response Types for The Hunt Kitchen
 *
 * These types represent the response structures from the API routes.
 * Use these types when calling API endpoints from the frontend.
 */

// ============================================================================
// Common Types
// ============================================================================

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
}

// ============================================================================
// Recipe Types
// ============================================================================

export interface RecipeListItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  featuredImageUrl: string | null;
  gameType: {
    id: string;
    name: string;
    slug: string;
  };
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  totalTimeMinutes: number | null;
  servings: number | null;
  viewCount: number;
  isFeatured: boolean;
  publishedAt: Date | null;
  averageRating: number;
  ratingsCount: number;
}

export interface RecipesListResponse {
  recipes: RecipeListItem[];
  pagination: PaginationResponse;
}

export interface RecipeReview {
  id: string;
  rating: number;
  reviewText: string | null;
  createdAt: Date;
  user: {
    name: string;
  } | null;
}

export interface RecipeDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  featuredImageUrl: string | null;
  galleryImages: any; // JSON type
  gameType: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
  };
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  totalTimeMinutes: number | null;
  servings: number | null;
  ingredients: any; // JSON type
  instructions: any; // JSON type
  tips: string | null;
  nutritionInfo: any; // JSON type
  videoUrl: string | null;
  viewCount: number;
  averageRating: number;
  ratingsCount: number;
  reviews: RecipeReview[];
  publishedAt: Date | null;
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface FeaturedRecipesResponse {
  recipes: RecipeListItem[];
}

export interface RecipeSearchResponse {
  recipes: RecipeListItem[];
  query: string;
  pagination: PaginationResponse;
}

export interface RateRecipeRequest {
  rating: number;
  reviewText?: string;
  userId?: string;
}

export interface RateRecipeResponse {
  message: string;
  rating: {
    id: string;
    rating: number;
    reviewText: string | null;
    createdAt: Date;
  };
}

export interface SaveRecipeRequest {
  userId: string;
}

export interface SaveRecipeResponse {
  message: string;
}

export interface SavedRecipesResponse {
  recipes: Array<RecipeListItem & { savedAt: Date }>;
  pagination: PaginationResponse;
}

// ============================================================================
// Product Types
// ============================================================================

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  basePrice: string;
  compareAtPrice: string | null;
  featuredImageUrl: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  isFeatured: boolean;
  productType: "PHYSICAL" | "DIGITAL";
  inStock: boolean;
  variantsCount: number;
}

export interface ProductsListResponse {
  products: ProductListItem[];
  pagination: PaginationResponse;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string | null;
  price: string | null;
  compareAtPrice: string | null;
  option1Name: string | null;
  option1Value: string | null;
  option2Name: string | null;
  option2Value: string | null;
  option3Name: string | null;
  option3Value: string | null;
  imageUrl: string | null;
  inventoryQty: number;
  weightOz: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  productType: "PHYSICAL" | "DIGITAL";
  basePrice: string;
  compareAtPrice: string | null;
  sku: string | null;
  barcode: string | null;
  trackInventory: boolean;
  weightOz: string | null;
  featuredImageUrl: string | null;
  galleryImages: any; // JSON type
  isFeatured: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
    parent: {
      id: string;
      name: string;
      slug: string;
    } | null;
  };
  variants: ProductVariant[];
  variantOptions: {
    option1?: string[];
    option2?: string[];
    option3?: string[];
  };
  inStock: boolean;
  totalInventory: number;
  metaTitle: string | null;
  metaDescription: string | null;
}

export interface FeaturedProductsResponse {
  products: Array<Omit<ProductListItem, "variantsCount">>;
}

export interface ProductsByCategoryResponse {
  category: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    parent: {
      id: string;
      name: string;
      slug: string;
    } | null;
    children: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
  };
  products: ProductListItem[];
  pagination: PaginationResponse;
}

// ============================================================================
// Category Types
// ============================================================================

export interface RecipeCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  displayOrder: number;
  recipesCount: number;
}

export interface RecipeCategoriesResponse {
  categories: RecipeCategory[];
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  displayOrder: number;
  parent: {
    id: string;
    name: string;
    slug: string;
  } | null;
  children: Array<{
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
  }>;
  productsCount: number;
}

export interface ProductCategoriesResponse {
  categories: ProductCategory[];
  parentCategories: ProductCategory[];
}

export interface GameType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  recipesCount: number;
}

export interface GameTypesResponse {
  gameTypes: GameType[];
}

// ============================================================================
// Search Types
// ============================================================================

export interface RecipeSearchResult {
  type: "recipe";
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  gameType: {
    name: string;
    slug: string;
  };
  totalTimeMinutes: number | null;
  averageRating: number;
  ratingsCount: number;
}

export interface ProductSearchResult {
  type: "product";
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  category: {
    name: string;
    slug: string;
  };
  price: string;
  compareAtPrice: string | null;
  inStock: boolean;
}

export interface CombinedSearchResponse {
  query: string;
  results: {
    recipes: RecipeSearchResult[];
    products: ProductSearchResult[];
  };
  counts: {
    recipes: number;
    products: number;
    total: number;
  };
}

// ============================================================================
// Newsletter & Contact Types
// ============================================================================

export interface NewsletterSubscribeRequest {
  email: string;
  firstName?: string;
  source?: string;
}

export interface NewsletterSubscribeResponse {
  message: string;
  subscriber?: {
    email: string;
    subscribedAt: Date;
  };
  resubscribed?: boolean;
}

export interface ContactFormRequest {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export interface ContactFormResponse {
  message: string;
  submission: {
    id: string;
    createdAt: Date;
  };
}

// ============================================================================
// API Query Parameters
// ============================================================================

export interface RecipesQueryParams {
  page?: number;
  limit?: number;
  game_type?: string;
  category?: string;
  cook_time?: number;
  search?: string;
  sort?: "newest" | "popular" | "rating";
}

export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  in_stock?: boolean;
  min_price?: number;
  max_price?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "name";
}

export interface SearchQueryParams {
  q: string;
  limit?: number;
}

export interface RecipeSearchQueryParams {
  q: string;
  page?: number;
  limit?: number;
}

export interface SavedRecipesQueryParams {
  userId: string;
  page?: number;
  limit?: number;
}

export interface ProductCategoryQueryParams {
  page?: number;
  limit?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "name";
}

// ============================================================================
// Cart & Checkout Types
// ============================================================================

export interface CartItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    featuredImageUrl: string | null;
    basePrice: number;
  };
  variant: {
    id: string;
    name: string;
    price: number | null;
    imageUrl: string | null;
    inventoryQty: number;
  } | null;
  quantity: number;
  price: number;
  lineTotal: number;
}

export interface CartTotals {
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  total: number;
}

export interface Cart {
  id: string;
  itemCount: number;
  items: CartItem[];
}

export interface GetCartResponse {
  cart: Cart;
  totals: CartTotals;
}

export interface AddToCartRequest {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

export interface AddToCartResponse {
  item: {
    id: string;
    productId: string;
    variantId: string | null;
    quantity: number;
  };
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface ApplyDiscountRequest {
  code: string;
}

export interface ApplyDiscountResponse {
  discountCode: {
    id: string;
    code: string;
    description: string | null;
    discountType: string;
    discountValue: number;
    discountAmount: number;
  };
}

export interface MergeCartRequest {
  sessionId: string;
}

export interface MergeCartResponse {
  mergedItems: number;
  updatedItems: number;
  totalItems: number;
}

export interface Address {
  firstName: string;
  lastName: string;
  streetAddress1: string;
  streetAddress2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface ValidatedCartItem {
  id: string;
  productId: string;
  productName: string;
  variantId: string | null;
  variantName: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface ValidateCartResponse {
  valid: boolean;
  items?: ValidatedCartItem[];
  subtotal?: number;
  itemCount?: number;
  errors?: Array<{
    itemId: string;
    productName: string;
    error: string;
  }>;
}

export interface ShippingRate {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  weight?: number;
}

export interface GetShippingRatesRequest {
  streetAddress1: string;
  streetAddress2?: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
}

export interface GetShippingRatesResponse {
  rates: ShippingRate[];
  address: Address;
  cartWeight: number;
  freeShippingThreshold: number;
  qualifiesForFreeShipping: boolean;
  remainingForFreeShipping: number;
}

export interface CreateCheckoutSessionRequest {
  shippingAddress: Address;
  billingAddress?: Address;
  email: string;
  shippingRate: {
    id: string;
    name: string;
    price: number;
  };
  discountCodeId?: string;
  sameAsShipping?: boolean;
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string | null;
}

export interface CheckoutSuccessResponse {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    total: number;
    email: string;
    itemCount?: number;
    createdAt: Date;
  };
}

// ============================================================================
// Order Types
// ============================================================================

export interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    featuredImageUrl: string | null;
  };
  variant: {
    id: string;
    name: string;
    imageUrl: string | null;
  } | null;
  productName: string;
  variantName: string | null;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  email?: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  total: number;
  currency: string;
  itemCount?: number;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  shippingMethod?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  discountCode?: {
    code: string;
    description: string | null;
    discountType?: string;
    discountValue?: number;
  } | null;
  customerNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetOrdersResponse {
  orders: Order[];
  pagination: PaginationResponse;
}

export interface GetOrderResponse {
  order: Order;
}

// ============================================================================
// Status Enums (matching Prisma schema)
// ============================================================================

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  AUTHORIZED = "AUTHORIZED",
  PAID = "PAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED",
}

export enum FulfillmentStatus {
  UNFULFILLED = "UNFULFILLED",
  PARTIALLY_FULFILLED = "PARTIALLY_FULFILLED",
  FULFILLED = "FULFILLED",
  CANCELLED = "CANCELLED",
}

export enum DiscountType {
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
  FREE_SHIPPING = "FREE_SHIPPING",
}
