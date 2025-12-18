'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RecipeFilters } from './RecipeFilters';
import type { GameType, RecipeCategory, RecipeFilters as RecipeFiltersType } from '@/types';

interface RecipeFiltersClientProps {
  className?: string;
}

export function RecipeFiltersClient({ className }: RecipeFiltersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [gameTypes, setGameTypes] = useState<GameType[]>([]);
  const [categories, setCategories] = useState<RecipeCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Parse current filters from URL
  const currentFilters: RecipeFiltersType = {
    page: parseInt(searchParams.get('page') || '1'),
    limit: 12,
    sortBy: (searchParams.get('sort') as RecipeFiltersType['sortBy']) || 'newest',
    search: searchParams.get('search') || undefined,
    gameTypeIds: searchParams.get('gameTypes')?.split(',').filter(Boolean) || undefined,
    categoryIds: searchParams.get('categories')?.split(',').filter(Boolean) || undefined,
  };

  // Fetch game types and categories
  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        const [gameTypesRes, categoriesRes] = await Promise.all([
          fetch('/api/game-types'),
          fetch('/api/categories'),
        ]);

        if (gameTypesRes.ok) {
          const data = await gameTypesRes.json();
          setGameTypes(data.gameTypes || []);
        }

        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Failed to fetch filter options:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFilterOptions();
  }, []);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: RecipeFiltersType) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update URL params based on new filters
    if (newFilters.search) {
      params.set('search', newFilters.search);
    } else {
      params.delete('search');
    }

    if (newFilters.gameTypeIds && newFilters.gameTypeIds.length > 0) {
      params.set('gameTypes', newFilters.gameTypeIds.join(','));
    } else {
      params.delete('gameTypes');
    }

    if (newFilters.categoryIds && newFilters.categoryIds.length > 0) {
      params.set('categories', newFilters.categoryIds.join(','));
    } else {
      params.delete('categories');
    }

    if (newFilters.minCookTime !== undefined) {
      params.set('minCookTime', newFilters.minCookTime.toString());
    } else {
      params.delete('minCookTime');
    }

    if (newFilters.maxCookTime !== undefined) {
      params.set('maxCookTime', newFilters.maxCookTime.toString());
    } else {
      params.delete('maxCookTime');
    }

    // Reset to page 1 when filters change
    params.set('page', '1');

    router.push(`/recipes?${params.toString()}`);
  }, [router, searchParams]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-6 w-16 bg-stone/50 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-4 w-24 bg-stone/50 rounded animate-pulse" />
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-4 w-4 bg-stone/50 rounded animate-pulse" />
                <div className="h-4 w-20 bg-stone/50 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <RecipeFilters
      gameTypes={gameTypes}
      categories={categories}
      filters={currentFilters}
      onChange={handleFiltersChange}
      className={className}
    />
  );
}
