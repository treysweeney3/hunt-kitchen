import { useCartStore } from '@/stores/cartStore';
import type { CartItem, DiscountCode } from '@/stores/cartStore';

/**
 * Convenient hook wrapper for the cart store
 * Provides easy access to cart state and actions
 */
export const useCart = () => {
  const items = useCartStore((state) => state.items);
  const discount = useCartStore((state) => state.discount);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const applyDiscount = useCartStore((state) => state.applyDiscount);
  const removeDiscount = useCartStore((state) => state.removeDiscount);
  const mergeCart = useCartStore((state) => state.mergeCart);
  const getItemCount = useCartStore((state) => state.getItemCount);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getDiscountAmount = useCartStore((state) => state.getDiscountAmount);
  const getTotal = useCartStore((state) => state.getTotal);
  const getItem = useCartStore((state) => state.getItem);
  const hasItem = useCartStore((state) => state.hasItem);

  // Computed values (called once per render)
  const itemCount = getItemCount();
  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const total = getTotal();
  const isEmpty = items.length === 0;

  return {
    // State
    items,
    discount,
    isEmpty,

    // Computed values
    itemCount,
    subtotal,
    discountAmount,
    total,

    // Actions
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    applyDiscount,
    removeDiscount,
    mergeCart,

    // Utility functions
    getItem,
    hasItem,
  };
};

/**
 * Hook to get only the item count (optimized for badge display)
 * This prevents unnecessary re-renders when other cart properties change
 */
export const useCartItemCount = () => {
  return useCartStore((state) => state.getItemCount());
};

/**
 * Hook to get only the cart total (optimized for header/footer display)
 */
export const useCartTotal = () => {
  return useCartStore((state) => state.getTotal());
};

/**
 * Hook to check if a specific item is in the cart
 */
export const useIsInCart = (productId: number, variantId: number) => {
  return useCartStore((state) => state.hasItem(productId, variantId));
};

/**
 * Hook to get a specific cart item
 */
export const useCartItem = (productId: number, variantId: number) => {
  return useCartStore((state) => state.getItem(productId, variantId));
};
