// Placeholder images for when actual images are not available
export const PLACEHOLDER_IMAGES = {
  product: '/images/placeholder-product.svg',
  recipe: '/images/placeholder-recipe.svg',
  category: '/images/placeholder-category.svg',
  gameType: '/images/placeholder-game.svg',
  avatar: '/images/placeholder-avatar.svg',
} as const;

// Helper function to get a valid image URL or fallback to placeholder
export function getImageUrl(
  url: string | null | undefined,
  type: keyof typeof PLACEHOLDER_IMAGES = 'product'
): string {
  if (url && url.trim() !== '') {
    return url;
  }
  return PLACEHOLDER_IMAGES[type];
}
