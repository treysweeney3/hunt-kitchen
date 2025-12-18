'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProductFilters, ProductFilterState } from './ProductFilters';
import type { ProductCategory } from '@/types';

interface ProductFiltersClientProps {
  className?: string;
}

export function ProductFiltersClient({ className }: ProductFiltersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Parse current filters from URL
  const currentFilters: ProductFilterState = {
    categoryIds: searchParams.get('categories')?.split(',').filter(Boolean) || [],
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
    sizes: searchParams.get('sizes')?.split(',').filter(Boolean) || [],
    colors: searchParams.get('colors')?.split(',').filter(Boolean) || [],
    inStockOnly: searchParams.get('inStock') === 'true',
    sortBy: (searchParams.get('sort') as ProductFilterState['sortBy']) || 'newest',
  };

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/products/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, []);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: ProductFilterState) => {
    const params = new URLSearchParams(searchParams.toString());

    // Update URL params based on new filters
    if (newFilters.categoryIds.length > 0) {
      params.set('categories', newFilters.categoryIds.join(','));
    } else {
      params.delete('categories');
    }

    if (newFilters.minPrice !== undefined) {
      params.set('minPrice', newFilters.minPrice.toString());
    } else {
      params.delete('minPrice');
    }

    if (newFilters.maxPrice !== undefined) {
      params.set('maxPrice', newFilters.maxPrice.toString());
    } else {
      params.delete('maxPrice');
    }

    if (newFilters.sizes.length > 0) {
      params.set('sizes', newFilters.sizes.join(','));
    } else {
      params.delete('sizes');
    }

    if (newFilters.colors.length > 0) {
      params.set('colors', newFilters.colors.join(','));
    } else {
      params.delete('colors');
    }

    if (newFilters.inStockOnly) {
      params.set('inStock', 'true');
    } else {
      params.delete('inStock');
    }

    if (newFilters.sortBy && newFilters.sortBy !== 'newest') {
      params.set('sort', newFilters.sortBy);
    } else {
      params.delete('sort');
    }

    // Reset to page 1 when filters change
    params.set('page', '1');

    router.push(`/shop?${params.toString()}`);
  }, [router, searchParams]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-6 w-16 bg-stone/50 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-3">
              <div className="h-4 w-24 bg-stone/50 rounded animate-pulse" />
              <div className="space-y-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-8 bg-stone/50 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <ProductFilters
      categories={categories}
      filters={currentFilters}
      onFilterChange={handleFiltersChange}
      className={className}
    />
  );
}
