/**
 * API Client Utilities
 *
 * Helper functions for making API calls to The Hunt Kitchen backend.
 * Use these functions in your React components/Server Components.
 */

import {
  RecipesListResponse,
  RecipeDetail,
  FeaturedRecipesResponse,
  RecipeSearchResponse,
  RateRecipeRequest,
  RateRecipeResponse,
  SaveRecipeRequest,
  SaveRecipeResponse,
  SavedRecipesResponse,
  ProductsListResponse,
  ProductDetail,
  FeaturedProductsResponse,
  ProductsByCategoryResponse,
  RecipeCategoriesResponse,
  ProductCategoriesResponse,
  GameTypesResponse,
  CombinedSearchResponse,
  NewsletterSubscribeRequest,
  NewsletterSubscribeResponse,
  ContactFormRequest,
  ContactFormResponse,
  RecipesQueryParams,
  ProductsQueryParams,
  SearchQueryParams,
  RecipeSearchQueryParams,
  SavedRecipesQueryParams,
  ProductCategoryQueryParams,
} from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

// ============================================================================
// Helper Functions
// ============================================================================

function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
}

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: "An error occurred",
    }));
    throw new Error(error.error || `API Error: ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// Recipe API Calls
// ============================================================================

export async function getRecipes(
  params?: RecipesQueryParams
): Promise<RecipesListResponse> {
  const queryString = params ? `?${buildQueryString(params)}` : "";
  return fetchAPI<RecipesListResponse>(`/api/recipes${queryString}`);
}

export async function getRecipeBySlug(slug: string): Promise<RecipeDetail> {
  return fetchAPI<RecipeDetail>(`/api/recipes/${slug}`);
}

export async function getFeaturedRecipes(): Promise<FeaturedRecipesResponse> {
  return fetchAPI<FeaturedRecipesResponse>("/api/recipes/featured");
}

export async function searchRecipes(
  params: RecipeSearchQueryParams
): Promise<RecipeSearchResponse> {
  const queryString = buildQueryString(params);
  return fetchAPI<RecipeSearchResponse>(`/api/recipes/search?${queryString}`);
}

export async function rateRecipe(
  recipeId: string,
  data: RateRecipeRequest
): Promise<RateRecipeResponse> {
  return fetchAPI<RateRecipeResponse>(`/api/recipes/${recipeId}/rate`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function saveRecipe(
  recipeId: string,
  data: SaveRecipeRequest
): Promise<SaveRecipeResponse> {
  return fetchAPI<SaveRecipeResponse>(`/api/recipes/${recipeId}/save`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function unsaveRecipe(
  recipeId: string,
  userId: string
): Promise<SaveRecipeResponse> {
  return fetchAPI<SaveRecipeResponse>(
    `/api/recipes/${recipeId}/save?userId=${userId}`,
    {
      method: "DELETE",
    }
  );
}

export async function getSavedRecipes(
  params: SavedRecipesQueryParams
): Promise<SavedRecipesResponse> {
  const queryString = buildQueryString(params);
  return fetchAPI<SavedRecipesResponse>(`/api/recipes/saved?${queryString}`);
}

// ============================================================================
// Product API Calls
// ============================================================================

export async function getProducts(
  params?: ProductsQueryParams
): Promise<ProductsListResponse> {
  const queryString = params ? `?${buildQueryString(params)}` : "";
  return fetchAPI<ProductsListResponse>(`/api/products${queryString}`);
}

export async function getProductBySlug(slug: string): Promise<ProductDetail> {
  return fetchAPI<ProductDetail>(`/api/products/${slug}`);
}

export async function getFeaturedProducts(): Promise<FeaturedProductsResponse> {
  return fetchAPI<FeaturedProductsResponse>("/api/products/featured");
}

export async function getProductsByCategory(
  categorySlug: string,
  params?: ProductCategoryQueryParams
): Promise<ProductsByCategoryResponse> {
  const queryString = params ? `?${buildQueryString(params)}` : "";
  return fetchAPI<ProductsByCategoryResponse>(
    `/api/products/category/${categorySlug}${queryString}`
  );
}

// ============================================================================
// Category API Calls
// ============================================================================

export async function getRecipeCategories(): Promise<RecipeCategoriesResponse> {
  return fetchAPI<RecipeCategoriesResponse>("/api/categories/recipes");
}

export async function getProductCategories(): Promise<ProductCategoriesResponse> {
  return fetchAPI<ProductCategoriesResponse>("/api/categories/products");
}

export async function getGameTypes(): Promise<GameTypesResponse> {
  return fetchAPI<GameTypesResponse>("/api/game-types");
}

// ============================================================================
// Search API Calls
// ============================================================================

export async function search(
  params: SearchQueryParams
): Promise<CombinedSearchResponse> {
  const queryString = buildQueryString(params);
  return fetchAPI<CombinedSearchResponse>(`/api/search?${queryString}`);
}

// ============================================================================
// Newsletter & Contact API Calls
// ============================================================================

export async function subscribeToNewsletter(
  data: NewsletterSubscribeRequest
): Promise<NewsletterSubscribeResponse> {
  return fetchAPI<NewsletterSubscribeResponse>("/api/newsletter/subscribe", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function submitContactForm(
  data: ContactFormRequest
): Promise<ContactFormResponse> {
  return fetchAPI<ContactFormResponse>("/api/contact", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ============================================================================
// React Hooks (Optional - for Client Components)
// ============================================================================

/**
 * Example usage in Client Components with React Query or SWR:
 *
 * import useSWR from 'swr';
 * import { getRecipes } from '@/lib/api-client';
 *
 * function RecipesList() {
 *   const { data, error, isLoading } = useSWR(
 *     '/api/recipes',
 *     () => getRecipes({ page: 1, limit: 12 })
 *   );
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       {data?.recipes.map(recipe => (
 *         <div key={recipe.id}>{recipe.title}</div>
 *       ))}
 *     </div>
 *   );
 * }
 */

/**
 * Example usage in Server Components:
 *
 * import { getRecipes } from '@/lib/api-client';
 *
 * async function RecipesPage() {
 *   const data = await getRecipes({ page: 1, limit: 12 });
 *
 *   return (
 *     <div>
 *       {data.recipes.map(recipe => (
 *         <div key={recipe.id}>{recipe.title}</div>
 *       ))}
 *     </div>
 *   );
 * }
 */
