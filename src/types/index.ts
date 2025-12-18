// ============================================================================
// User Types
// ============================================================================

export type UserRole = "customer" | "admin";

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  userId: string;
  addressType: "shipping" | "billing";
  isDefault: boolean;
  firstName: string;
  lastName: string;
  streetAddress1: string;
  streetAddress2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Recipe Types
// ============================================================================

export interface RecipeCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GameType {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeIngredient {
  amount: string;
  unit: string;
  ingredient: string;
  notes?: string;
}

export interface RecipeInstruction {
  stepNumber: number;
  text: string;
  imageUrl?: string;
}

export interface RecipeNutrition {
  calories?: number;
  protein?: number;
  carbohydrates?: number;
  fat?: number;
  fiber?: number;
  sodium?: number;
  servingSize?: string;
}

export interface Recipe {
  id: string;
  title: string;
  slug: string;
  description: string;
  featuredImageUrl: string;
  galleryImages: string[];
  gameTypeId: string;
  gameType?: GameType;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  servings: number;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  tips: string | null;
  nutritionInfo: RecipeNutrition | null;
  videoUrl: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  publishedAt: Date | null;
  viewCount: number;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
  categories?: RecipeCategory[];
  averageRating?: number;
  ratingCount?: number;
}

export interface RecipeRating {
  id: string;
  recipeId: string;
  userId: string | null;
  rating: number;
  reviewText: string | null;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: Pick<User, "id" | "firstName" | "lastName">;
}

// ============================================================================
// Product Types
// ============================================================================

export type ProductType = "physical" | "digital";

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string | null;
  price: number | null;
  compareAtPrice: number | null;
  option1Name: string | null;
  option1Value: string | null;
  option2Name: string | null;
  option2Value: string | null;
  option3Name: string | null;
  option3Value: string | null;
  imageUrl: string | null;
  inventoryQuantity: number;
  weightOz: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  productType: ProductType;
  categoryId: string;
  category?: ProductCategory;
  basePrice: number;
  compareAtPrice: number | null;
  costPerItem: number | null;
  sku: string | null;
  barcode: string | null;
  trackInventory: boolean;
  weightOz: number | null;
  featuredImageUrl: string;
  galleryImages: string[];
  isFeatured: boolean;
  isActive: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
  variants?: ProductVariant[];
}

// ============================================================================
// Order Types
// ============================================================================

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

export type FulfillmentStatus = "unfulfilled" | "partial" | "fulfilled";

export interface OrderAddress {
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

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  productName: string;
  variantName: string | null;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  email: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  total: number;
  currency: string;
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  shippingMethod: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  stripePaymentIntentId: string | null;
  stripeCheckoutSessionId: string | null;
  notes: string | null;
  customerNotes: string | null;
  discountCodeId: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
}

// ============================================================================
// Cart Types
// ============================================================================

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  product?: Product;
  variant?: ProductVariant;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cart {
  id: string;
  userId: string | null;
  sessionId: string | null;
  items?: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Discount Code Types
// ============================================================================

export type DiscountType = "percentage" | "fixed_amount" | "free_shipping";
export type DiscountApplicableTo =
  | "all"
  | "specific_products"
  | "specific_categories";

export interface DiscountCode {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number;
  minimumOrderAmount: number | null;
  maximumDiscountAmount: number | null;
  usageLimit: number | null;
  usageCount: number;
  usageLimitPerCustomer: number | null;
  applicableTo: DiscountApplicableTo;
  applicableProductIds: string[] | null;
  applicableCategoryIds: string[] | null;
  startsAt: Date;
  expiresAt: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Newsletter & Contact Types
// ============================================================================

export interface NewsletterSubscriber {
  id: string;
  email: string;
  firstName: string | null;
  isSubscribed: boolean;
  subscribedAt: Date;
  unsubscribedAt: Date | null;
  source: string | null;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  isRead: boolean;
  isReplied: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface RecipeFilters {
  gameTypeIds?: string[];
  categoryIds?: string[];
  minCookTime?: number;
  maxCookTime?: number;
  minPrepTime?: number;
  maxPrepTime?: number;
  minRating?: number;
  isFeatured?: boolean;
  search?: string;
  sortBy?: "newest" | "popular" | "rating" | "prepTime" | "cookTime";
  page?: number;
  limit?: number;
}

export interface ProductFilters {
  categoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  productType?: ProductType;
  isFeatured?: boolean;
  search?: string;
  sortBy?: "newest" | "price-asc" | "price-desc" | "name-asc" | "name-desc";
  page?: number;
  limit?: number;
}

// ============================================================================
// Form Input Types
// ============================================================================

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterInput {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface AddressInput {
  addressType: "shipping" | "billing";
  isDefault: boolean;
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

export interface AddToCartInput {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface CheckoutInput {
  email: string;
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  shippingMethodId: string;
  discountCode?: string;
  customerNotes?: string;
}

export interface RecipeRatingInput {
  recipeId: string;
  rating: number;
  reviewText?: string;
}

export interface NewsletterSubscribeInput {
  email: string;
  firstName?: string;
  source?: string;
}

export interface ContactFormInput {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export interface RecipeEditorInput {
  title: string;
  slug: string;
  description: string;
  featuredImageUrl: string;
  galleryImages: string[];
  gameTypeId: string;
  categoryIds: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  tips?: string;
  nutritionInfo?: RecipeNutrition;
  videoUrl?: string;
  isFeatured: boolean;
  isPublished: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export interface ProductEditorInput {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  productType: ProductType;
  categoryId: string;
  basePrice: number;
  compareAtPrice?: number;
  costPerItem?: number;
  sku?: string;
  barcode?: string;
  trackInventory: boolean;
  weightOz?: number;
  featuredImageUrl: string;
  galleryImages: string[];
  isFeatured: boolean;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  variants?: Omit<ProductVariant, "id" | "productId" | "createdAt" | "updatedAt">[];
}

// ============================================================================
// Utility Types
// ============================================================================

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type WithId<T> = T & { id: string };

export type WithTimestamps<T> = T & {
  createdAt: Date;
  updatedAt: Date;
};

export type OmitTimestamps<T> = Omit<T, "createdAt" | "updatedAt">;

export type CreateInput<T> = Omit<T, "id" | "createdAt" | "updatedAt">;

export type UpdateInput<T> = Partial<CreateInput<T>>;
