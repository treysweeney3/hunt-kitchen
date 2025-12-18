import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItemVariant {
  id: number;
  size?: string;
  color?: string;
  sku: string;
  price: number;
  compare_at_price?: number;
}

export interface CartItemProduct {
  id: number;
  name: string;
  slug: string;
  image_url?: string;
  category?: string;
}

export interface CartItem {
  product_id: number;
  variant_id: number;
  quantity: number;
  product: CartItemProduct;
  variant: CartItemVariant;
  added_at: string;
}

export interface DiscountCode {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_amount?: number;
  applied_at: string;
}

interface CartState {
  items: CartItem[];
  discount?: DiscountCode;

  // Actions
  addItem: (item: Omit<CartItem, 'added_at'>) => void;
  updateQuantity: (productId: number, variantId: number, quantity: number) => void;
  removeItem: (productId: number, variantId: number) => void;
  clearCart: () => void;

  // Discount actions
  applyDiscount: (discount: Omit<DiscountCode, 'applied_at'>) => void;
  removeDiscount: () => void;

  // Cart merge (for login)
  mergeCart: (serverItems: CartItem[]) => void;

  // Computed values
  getItemCount: () => number;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotal: () => number;
  getItem: (productId: number, variantId: number) => CartItem | undefined;
  hasItem: (productId: number, variantId: number) => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      discount: undefined,

      // Add item to cart or update quantity if already exists
      addItem: (item) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (i) => i.product_id === item.product_id && i.variant_id === item.variant_id
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
            // Add new item
            return {
              items: [
                ...state.items,
                {
                  ...item,
                  added_at: new Date().toISOString(),
                },
              ],
            };
          }
        });
      },

      // Update item quantity
      updateQuantity: (productId, variantId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            return {
              items: state.items.filter(
                (item) => !(item.product_id === productId && item.variant_id === variantId)
              ),
            };
          }

          const updatedItems = state.items.map((item) =>
            item.product_id === productId && item.variant_id === variantId
              ? { ...item, quantity }
              : item
          );

          return { items: updatedItems };
        });
      },

      // Remove item from cart
      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (item) => !(item.product_id === productId && item.variant_id === variantId)
          ),
        }));
      },

      // Clear entire cart
      clearCart: () => {
        set({ items: [], discount: undefined });
      },

      // Apply discount code
      applyDiscount: (discount) => {
        const subtotal = get().getSubtotal();

        // Check minimum order amount if specified
        if (discount.min_order_amount && subtotal < discount.min_order_amount) {
          throw new Error(
            `Minimum order amount of $${discount.min_order_amount.toFixed(2)} required for this discount`
          );
        }

        set({
          discount: {
            ...discount,
            applied_at: new Date().toISOString(),
          },
        });
      },

      // Remove discount code
      removeDiscount: () => {
        set({ discount: undefined });
      },

      // Merge cart when user logs in
      mergeCart: (serverItems) => {
        set((state) => {
          const mergedItems = [...serverItems];

          // Add local items that aren't already in server cart
          state.items.forEach((localItem) => {
            const existingIndex = mergedItems.findIndex(
              (item) =>
                item.product_id === localItem.product_id &&
                item.variant_id === localItem.variant_id
            );

            if (existingIndex > -1) {
              // Merge quantities for items that exist in both
              mergedItems[existingIndex] = {
                ...mergedItems[existingIndex],
                quantity: mergedItems[existingIndex].quantity + localItem.quantity,
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

      // Get discount amount
      getDiscountAmount: () => {
        const { discount } = get();
        if (!discount) return 0;

        const subtotal = get().getSubtotal();

        if (discount.type === 'percentage') {
          return (subtotal * discount.value) / 100;
        } else {
          // Fixed amount discount
          return Math.min(discount.value, subtotal);
        }
      },

      // Get total (after discount)
      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discountAmount = get().getDiscountAmount();
        return Math.max(0, subtotal - discountAmount);
      },

      // Get specific item
      getItem: (productId, variantId) => {
        return get().items.find(
          (item) => item.product_id === productId && item.variant_id === variantId
        );
      },

      // Check if item exists in cart
      hasItem: (productId, variantId) => {
        return get().items.some(
          (item) => item.product_id === productId && item.variant_id === variantId
        );
      },
    }),
    {
      name: 'hunt-kitchen-cart',
      storage: createJSONStorage(() => localStorage),
      // Only persist items and discount, not computed values
      partialize: (state) => ({
        items: state.items,
        discount: state.discount,
      }),
    }
  )
);
