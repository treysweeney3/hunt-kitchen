import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItemVariant {
  id: string; // Shopify global ID (gid://shopify/ProductVariant/123) or numeric string
  title?: string; // Variant title (e.g., "Size: Large, Color: Black")
  size?: string;
  color?: string;
  sku: string;
  price: number;
  compare_at_price?: number;
}

export interface CartItemProduct {
  id: string; // Shopify global ID or numeric string
  name: string;
  slug: string;
  image_url?: string;
  category?: string;
}

export interface CartItem {
  product_id: string; // Shopify global ID or numeric string
  variant_id: string; // Shopify variant global ID or numeric string
  quantity: number;
  product: CartItemProduct;
  variant: CartItemVariant;
  added_at: string;
}

// Legacy cart item type for migration (numeric IDs)
interface LegacyCartItem {
  product_id: number;
  variant_id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    slug: string;
    image_url?: string;
    category?: string;
  };
  variant: {
    id: number;
    size?: string;
    color?: string;
    sku: string;
    price: number;
    compare_at_price?: number;
  };
  added_at: string;
}

// Input type for addItem - accepts both string and number IDs for backwards compatibility
export interface AddItemInput {
  product_id: string | number;
  variant_id: string | number;
  quantity: number;
  product: {
    id: string | number;
    name: string;
    slug: string;
    image_url?: string;
    category?: string;
  };
  variant: {
    id: string | number;
    title?: string;
    size?: string;
    color?: string;
    sku: string;
    price: number;
    compare_at_price?: number;
  };
}

interface CartState {
  items: CartItem[];

  // Actions
  addItem: (item: AddItemInput) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;

  // Cart merge (for login)
  mergeCart: (serverItems: CartItem[]) => void;

  // Computed values
  getItemCount: () => number;
  getSubtotal: () => number;
  getTotal: () => number;
  getItem: (variantId: string) => CartItem | undefined;
  hasItem: (variantId: string) => boolean;

  // Shopify checkout helpers
  getLineItems: () => Array<{ variantId: string; quantity: number }>;
}

// Helper to convert any ID to string
function toStringId(id: string | number): string {
  return String(id);
}

// Helper to migrate legacy cart items to new format
function migrateCartItem(item: CartItem | LegacyCartItem): CartItem {
  // Check if it's already a new format item (string IDs)
  if (typeof item.product_id === "string") {
    return item as CartItem;
  }

  // Migrate from legacy format
  const legacyItem = item as LegacyCartItem;
  return {
    product_id: String(legacyItem.product_id),
    variant_id: String(legacyItem.variant_id),
    quantity: legacyItem.quantity,
    product: {
      id: String(legacyItem.product.id),
      name: legacyItem.product.name,
      slug: legacyItem.product.slug,
      image_url: legacyItem.product.image_url,
      category: legacyItem.product.category,
    },
    variant: {
      id: String(legacyItem.variant.id),
      size: legacyItem.variant.size,
      color: legacyItem.variant.color,
      sku: legacyItem.variant.sku,
      price: legacyItem.variant.price,
      compare_at_price: legacyItem.variant.compare_at_price,
    },
    added_at: legacyItem.added_at,
  };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // Add item to cart or update quantity if already exists
      addItem: (item) => {
        const variantId = toStringId(item.variant_id);

        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (i) => i.variant_id === variantId
          );

          if (existingItemIndex > -1) {
            // Update existing item quantity
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + item.quantity,
            };
            return { items: updatedItems };
          } else {
            // Add new item with normalized string IDs
            const newItem: CartItem = {
              product_id: toStringId(item.product_id),
              variant_id: variantId,
              quantity: item.quantity,
              product: {
                id: toStringId(item.product.id),
                name: item.product.name,
                slug: item.product.slug,
                image_url: item.product.image_url,
                category: item.product.category,
              },
              variant: {
                id: toStringId(item.variant.id),
                title: item.variant.title,
                size: item.variant.size,
                color: item.variant.color,
                sku: item.variant.sku,
                price: item.variant.price,
                compare_at_price: item.variant.compare_at_price,
              },
              added_at: new Date().toISOString(),
            };
            return { items: [...state.items, newItem] };
          }
        });
      },

      // Update item quantity by variant ID
      updateQuantity: (variantId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            return {
              items: state.items.filter((item) => item.variant_id !== variantId),
            };
          }

          const updatedItems = state.items.map((item) =>
            item.variant_id === variantId ? { ...item, quantity } : item
          );

          return { items: updatedItems };
        });
      },

      // Remove item from cart by variant ID
      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((item) => item.variant_id !== variantId),
        }));
      },

      // Clear entire cart
      clearCart: () => {
        set({ items: [] });
      },

      // Merge cart when user logs in
      mergeCart: (serverItems) => {
        set((state) => {
          const mergedItems = [...serverItems];

          // Add local items that aren't already in server cart
          state.items.forEach((localItem) => {
            const existingIndex = mergedItems.findIndex(
              (item) => item.variant_id === localItem.variant_id
            );

            if (existingIndex > -1) {
              // Merge quantities for items that exist in both
              mergedItems[existingIndex] = {
                ...mergedItems[existingIndex],
                quantity:
                  mergedItems[existingIndex].quantity + localItem.quantity,
              };
            } else {
              // Add local-only items
              mergedItems.push(localItem);
            }
          });

          return { items: mergedItems };
        });
      },

      // Get total item count (sum of all quantities)
      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      // Get subtotal (before discount)
      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          return total + item.variant.price * item.quantity;
        }, 0);
      },

      // Get total (no discount handling - Shopify handles discounts)
      getTotal: () => {
        return get().getSubtotal();
      },

      // Get specific item by variant ID
      getItem: (variantId) => {
        return get().items.find((item) => item.variant_id === variantId);
      },

      // Check if item exists in cart by variant ID
      hasItem: (variantId) => {
        return get().items.some((item) => item.variant_id === variantId);
      },

      // Get line items for Shopify checkout
      getLineItems: () => {
        return get().items.map((item) => ({
          variantId: item.variant_id,
          quantity: item.quantity,
        }));
      },
    }),
    {
      name: "hunt-kitchen-cart",
      storage: createJSONStorage(() => localStorage),
      // Only persist items, not computed values
      partialize: (state) => ({
        items: state.items,
      }),
      // Migrate old cart format on rehydration
      onRehydrateStorage: () => (state) => {
        if (state?.items) {
          state.items = state.items.map(migrateCartItem);
        }
      },
    }
  )
);
