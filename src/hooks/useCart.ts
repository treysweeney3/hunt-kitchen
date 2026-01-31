import { useCartStore } from "@/stores/cartStore";

/**
 * Convenient hook wrapper for the cart store
 * Provides easy access to cart state and actions
 */
export const useCart = () => {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const mergeCart = useCartStore((state) => state.mergeCart);
  const getItemCount = useCartStore((state) => state.getItemCount);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getTotal = useCartStore((state) => state.getTotal);
  const getItem = useCartStore((state) => state.getItem);
  const hasItem = useCartStore((state) => state.hasItem);
  const getLineItems = useCartStore((state) => state.getLineItems);

  // Computed values (called once per render)
  const itemCount = getItemCount();
  const subtotal = getSubtotal();
  const total = getTotal();
  const isEmpty = items.length === 0;

  return {
    // State
    items,
    isEmpty,

    // Computed values
    itemCount,
    subtotal,
    total,

    // Actions
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    mergeCart,

    // Utility functions
    getItem,
    hasItem,
    getLineItems,
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
 * Hook to check if a specific item is in the cart by variant ID
 */
export const useIsInCart = (variantId: string) => {
  return useCartStore((state) => state.hasItem(variantId));
};

/**
 * Hook to get a specific cart item by variant ID
 */
export const useCartItem = (variantId: string) => {
  return useCartStore((state) => state.getItem(variantId));
};
