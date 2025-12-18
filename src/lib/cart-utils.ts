import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import prisma from "./prisma";

const CART_SESSION_COOKIE = "cart_session_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Generate a unique session ID for guest carts
 */
export function generateSessionId(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Get or create session ID from cookies
 */
export async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(CART_SESSION_COOKIE)?.value;

  if (!sessionId) {
    sessionId = generateSessionId();
    cookieStore.set(CART_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
  }

  return sessionId;
}

/**
 * Clear the cart session cookie
 */
export async function clearSessionId(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CART_SESSION_COOKIE);
}

/**
 * Get cart by user ID or session ID
 */
export async function getOrCreateCart(userId?: string | null, sessionId?: string | null) {
  // Try to find existing cart
  let cart = await prisma.cart.findFirst({
    where: userId
      ? { userId }
      : sessionId
      ? { sessionId, userId: null }
      : { id: "" }, // Will return null
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
          variant: true,
        },
      },
    },
  });

  // Create new cart if none exists
  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId: userId || null,
        sessionId: !userId ? sessionId : null,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
            variant: true,
          },
        },
      },
    });
  }

  return cart;
}

/**
 * Calculate cart totals including discount
 */
export interface CartTotals {
  subtotal: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  total: number;
}

export async function calculateCartTotals(
  cartId: string,
  discountCodeId?: string | null,
  shippingAmount: number = 0,
  taxAmount: number = 0
): Promise<CartTotals> {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

  // Calculate subtotal
  let subtotal = 0;
  for (const item of cart.items) {
    const price = item.variant?.price || item.product.basePrice;
    subtotal += Number(price) * item.quantity;
  }

  // Calculate discount
  let discountAmount = 0;
  if (discountCodeId) {
    const discount = await prisma.discountCode.findUnique({
      where: { id: discountCodeId },
    });

    if (discount && discount.isActive) {
      const now = new Date();
      const isValid =
        (!discount.startsAt || discount.startsAt <= now) &&
        (!discount.expiresAt || discount.expiresAt >= now);

      if (isValid) {
        // Check minimum order amount
        if (
          !discount.minimumOrderAmount ||
          subtotal >= Number(discount.minimumOrderAmount)
        ) {
          // Calculate discount based on type
          if (discount.discountType === "PERCENTAGE") {
            discountAmount = (subtotal * Number(discount.discountValue)) / 100;
          } else if (discount.discountType === "FIXED_AMOUNT") {
            discountAmount = Number(discount.discountValue);
          }

          // Apply maximum discount cap
          if (
            discount.maximumDiscountAmount &&
            discountAmount > Number(discount.maximumDiscountAmount)
          ) {
            discountAmount = Number(discount.maximumDiscountAmount);
          }

          // Ensure discount doesn't exceed subtotal
          if (discountAmount > subtotal) {
            discountAmount = subtotal;
          }
        }
      }
    }
  }

  const total = subtotal - discountAmount + shippingAmount + taxAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    shippingAmount: Math.round(shippingAmount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

/**
 * Validate cart items against inventory
 */
export interface CartValidationError {
  itemId: string;
  productName: string;
  error: string;
}

export async function validateCartInventory(
  cartId: string
): Promise<CartValidationError[]> {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

  const errors: CartValidationError[] = [];

  for (const item of cart.items) {
    const product = item.product;

    // Check if product is active
    if (!product.isActive) {
      errors.push({
        itemId: item.id,
        productName: product.name,
        error: "This product is no longer available",
      });
      continue;
    }

    // Check inventory if tracking is enabled
    if (product.trackInventory) {
      if (item.variant) {
        // Check variant inventory
        if (!item.variant.isActive) {
          errors.push({
            itemId: item.id,
            productName: `${product.name} - ${item.variant.name}`,
            error: "This variant is no longer available",
          });
        } else if (item.variant.inventoryQty < item.quantity) {
          errors.push({
            itemId: item.id,
            productName: `${product.name} - ${item.variant.name}`,
            error: `Only ${item.variant.inventoryQty} in stock`,
          });
        }
      }
    }
  }

  return errors;
}

/**
 * Generate unique order number
 */
export async function generateOrderNumber(): Promise<string> {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const orderNumber = `THK-${timestamp}-${random}`;

  // Check if order number already exists (extremely unlikely)
  const existing = await prisma.order.findUnique({
    where: { orderNumber },
  });

  if (existing) {
    // Recursively generate new number if collision occurs
    return generateOrderNumber();
  }

  return orderNumber;
}

/**
 * Calculate total cart weight for shipping calculations
 */
export async function calculateCartWeight(cartId: string): Promise<number> {
  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
    },
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

  let totalWeight = 0;

  for (const item of cart.items) {
    const weight = item.variant?.weightOz || item.product.weightOz || 0;
    totalWeight += Number(weight) * item.quantity;
  }

  return totalWeight;
}
