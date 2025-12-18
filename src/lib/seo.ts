import { Metadata } from 'next';
import { siteConfig } from '@/config/site';

// ================================
// TypeScript Interfaces for Structured Data
// ================================

export interface RecipeStructuredData {
  '@context': 'https://schema.org';
  '@type': 'Recipe';
  name: string;
  description: string;
  image: string[];
  author: {
    '@type': 'Organization';
    name: string;
    url: string;
  };
  datePublished?: string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  recipeYield?: string;
  recipeCategory?: string[];
  recipeCuisine?: string;
  keywords?: string;
  recipeIngredient: string[];
  recipeInstructions: Array<{
    '@type': 'HowToStep';
    text: string;
    name?: string;
    image?: string;
  }>;
  nutrition?: {
    '@type': 'NutritionInformation';
    calories?: string;
    proteinContent?: string;
    carbohydrateContent?: string;
    fatContent?: string;
    fiberContent?: string;
    sodiumContent?: string;
    servingSize?: string;
  };
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    ratingCount: number;
    bestRating?: number;
    worstRating?: number;
  };
  video?: {
    '@type': 'VideoObject';
    name: string;
    description: string;
    thumbnailUrl: string;
    contentUrl: string;
    uploadDate: string;
  };
}

export interface ProductStructuredData {
  '@context': 'https://schema.org';
  '@type': 'Product';
  name: string;
  description: string;
  image: string[];
  sku?: string;
  brand: {
    '@type': 'Brand';
    name: string;
  };
  offers: {
    '@type': 'Offer';
    url: string;
    priceCurrency: string;
    price: string;
    priceValidUntil?: string;
    availability: string;
    itemCondition: string;
    seller: {
      '@type': 'Organization';
      name: string;
    };
  };
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
}

export interface BreadcrumbListStructuredData {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string;
  }>;
}

export interface OrganizationStructuredData {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs: string[];
  contactPoint?: {
    '@type': 'ContactPoint';
    email: string;
    contactType: string;
  };
}

// ================================
// SEO Helper Functions
// ================================

interface GenerateMetadataOptions {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
  canonical?: string;
  type?: 'website' | 'article' | 'product';
}

/**
 * Generate metadata for a page with SEO best practices
 */
export function generateMetadata(options: GenerateMetadataOptions = {}): Metadata {
  const {
    title,
    description = siteConfig.description,
    keywords = [],
    image = siteConfig.ogImage,
    noIndex = false,
    canonical,
    type = 'website',
  } = options;

  const pageTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const imageUrl = image.startsWith('http') ? image : `${siteConfig.url}${image}`;

  const metadata: Metadata = {
    title: pageTitle,
    description,
    keywords: [...keywords, ...['wild game', 'hunting', 'recipes', 'cooking']],
    authors: [{ name: siteConfig.creator.name, url: siteConfig.creator.url }],
    creator: siteConfig.creator.name,
    publisher: siteConfig.creator.name,
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    openGraph: {
      type: type === 'product' ? 'website' : type,
      locale: 'en_US',
      url: canonical || siteConfig.url,
      title: title || siteConfig.name,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title || siteConfig.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title || siteConfig.name,
      description,
      images: [imageUrl],
      creator: '@thehuntkitchen',
      site: '@thehuntkitchen',
    },
    alternates: {
      canonical: canonical || siteConfig.url,
    },
  };

  return metadata;
}

/**
 * Convert minutes to ISO 8601 duration format (e.g., PT30M)
 */
function minutesToISO8601(minutes: number): string {
  if (minutes < 60) {
    return `PT${minutes}M`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `PT${hours}H${remainingMinutes}M` : `PT${hours}H`;
}

interface RecipeData {
  title: string;
  description: string;
  featuredImageUrl: string;
  galleryImages?: string[];
  publishedAt?: Date;
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  totalTimeMinutes?: number;
  servings?: number;
  ingredients: Array<{ amount?: string; unit?: string; ingredient: string; notes?: string }>;
  instructions: Array<{ step: string; image?: string }>;
  nutritionInfo?: {
    calories?: number;
    protein?: number;
    carbohydrates?: number;
    fat?: number;
    fiber?: number;
    sodium?: number;
    servingSize?: string;
  };
  categories?: Array<{ name: string }>;
  gameType?: { name: string };
  videoUrl?: string;
  averageRating?: number;
  ratingCount?: number;
}

/**
 * Generate Recipe JSON-LD structured data
 */
export function generateRecipeStructuredData(
  recipe: RecipeData,
  url: string
): RecipeStructuredData {
  const images = [
    recipe.featuredImageUrl,
    ...(recipe.galleryImages || []),
  ].filter(Boolean);

  const structuredData: RecipeStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.description,
    image: images,
    author: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    recipeIngredient: recipe.ingredients.map((ing) => {
      const parts = [ing.amount, ing.unit, ing.ingredient, ing.notes]
        .filter(Boolean)
        .join(' ');
      return parts.trim();
    }),
    recipeInstructions: recipe.instructions.map((instruction, index) => ({
      '@type': 'HowToStep',
      text: instruction.step,
      name: `Step ${index + 1}`,
      ...(instruction.image && { image: instruction.image }),
    })),
  };

  // Add optional fields
  if (recipe.publishedAt) {
    structuredData.datePublished = recipe.publishedAt.toISOString();
  }

  if (recipe.prepTimeMinutes) {
    structuredData.prepTime = minutesToISO8601(recipe.prepTimeMinutes);
  }

  if (recipe.cookTimeMinutes) {
    structuredData.cookTime = minutesToISO8601(recipe.cookTimeMinutes);
  }

  if (recipe.totalTimeMinutes) {
    structuredData.totalTime = minutesToISO8601(recipe.totalTimeMinutes);
  }

  if (recipe.servings) {
    structuredData.recipeYield = `${recipe.servings} servings`;
  }

  if (recipe.categories && recipe.categories.length > 0) {
    structuredData.recipeCategory = recipe.categories.map((cat) => cat.name);
  }

  if (recipe.gameType) {
    structuredData.recipeCuisine = recipe.gameType.name;
    structuredData.keywords = recipe.gameType.name;
  }

  if (recipe.nutritionInfo) {
    structuredData.nutrition = {
      '@type': 'NutritionInformation',
      ...(recipe.nutritionInfo.calories && {
        calories: `${recipe.nutritionInfo.calories} calories`,
      }),
      ...(recipe.nutritionInfo.protein && {
        proteinContent: `${recipe.nutritionInfo.protein}g`,
      }),
      ...(recipe.nutritionInfo.carbohydrates && {
        carbohydrateContent: `${recipe.nutritionInfo.carbohydrates}g`,
      }),
      ...(recipe.nutritionInfo.fat && { fatContent: `${recipe.nutritionInfo.fat}g` }),
      ...(recipe.nutritionInfo.fiber && {
        fiberContent: `${recipe.nutritionInfo.fiber}g`,
      }),
      ...(recipe.nutritionInfo.sodium && {
        sodiumContent: `${recipe.nutritionInfo.sodium}mg`,
      }),
      ...(recipe.nutritionInfo.servingSize && {
        servingSize: recipe.nutritionInfo.servingSize,
      }),
    };
  }

  if (recipe.averageRating && recipe.ratingCount && recipe.ratingCount > 0) {
    structuredData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: recipe.averageRating,
      ratingCount: recipe.ratingCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  if (recipe.videoUrl) {
    structuredData.video = {
      '@type': 'VideoObject',
      name: recipe.title,
      description: recipe.description,
      thumbnailUrl: recipe.featuredImageUrl,
      contentUrl: recipe.videoUrl,
      uploadDate: recipe.publishedAt?.toISOString() || new Date().toISOString(),
    };
  }

  return structuredData;
}

interface ProductData {
  name: string;
  description: string;
  shortDescription?: string;
  featuredImageUrl: string;
  galleryImages?: string[];
  sku?: string;
  basePrice: number;
  compareAtPrice?: number;
  variants?: Array<{
    inventoryQuantity?: number;
    isActive?: boolean;
  }>;
  isActive: boolean;
  averageRating?: number;
  reviewCount?: number;
}

/**
 * Generate Product JSON-LD structured data
 */
export function generateProductStructuredData(
  product: ProductData,
  url: string
): ProductStructuredData {
  const images = [
    product.featuredImageUrl,
    ...(product.galleryImages || []),
  ].filter(Boolean);

  // Determine availability
  let availability = 'https://schema.org/InStock';
  if (!product.isActive) {
    availability = 'https://schema.org/Discontinued';
  } else if (
    product.variants &&
    product.variants.every((v) => v.inventoryQuantity === 0 || !v.isActive)
  ) {
    availability = 'https://schema.org/OutOfStock';
  }

  const structuredData: ProductStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.description,
    image: images,
    brand: {
      '@type': 'Brand',
      name: siteConfig.name,
    },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'USD',
      price: product.basePrice.toString(),
      availability,
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: siteConfig.name,
      },
    },
  };

  if (product.sku) {
    structuredData.sku = product.sku;
  }

  if (product.averageRating && product.reviewCount && product.reviewCount > 0) {
    structuredData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.averageRating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return structuredData;
}

export interface BreadcrumbItem {
  name: string;
  href?: string;
}

/**
 * Generate BreadcrumbList JSON-LD structured data
 */
export function generateBreadcrumbStructuredData(
  breadcrumbs: BreadcrumbItem[]
): BreadcrumbListStructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      ...(crumb.href && { item: `${siteConfig.url}${crumb.href}` }),
    })),
  };
}

/**
 * Generate Organization JSON-LD structured data for site-wide use
 */
export function generateOrganizationStructuredData(): OrganizationStructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/images/logo.png`,
    description: siteConfig.description,
    sameAs: [
      siteConfig.links.instagram,
      siteConfig.links.facebook,
      siteConfig.links.youtube,
      siteConfig.links.pinterest,
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: siteConfig.links.email,
      contactType: 'customer service',
    },
  };
}
