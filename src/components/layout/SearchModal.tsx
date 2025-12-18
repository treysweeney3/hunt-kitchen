'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Clock, TrendingUp, X, ShoppingBag, ChefHat } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

interface SearchResult {
  type: 'recipe' | 'product';
  id: number;
  name: string;
  slug: string;
  image_url?: string;
  category?: string;
  price?: number;
}

const RECENT_SEARCHES_KEY = 'hunt-kitchen-recent-searches';
const MAX_RECENT_SEARCHES = 5;

export function SearchModal({ open, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load recent searches from localStorage
  useEffect(() => {
    if (open) {
      try {
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (stored) {
          setRecentSearches(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load recent searches:', error);
      }
    }
  }, [open]);

  // Save search to recent searches
  const saveSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;

    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      const current = stored ? JSON.parse(stored) : [];
      const updated = [
        searchQuery,
        ...current.filter((s: string) => s !== searchQuery),
      ].slice(0, MAX_RECENT_SEARCHES);

      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  }, []);

  // Clear recent searches
  const clearRecentSearches = () => {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
      setRecentSearches([]);
    } catch (error) {
      console.error('Failed to clear recent searches:', error);
    }
  };

  // Search function with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        // const data = await response.json();
        // setResults(data.results);

        // Mock data for demonstration
        const mockResults: SearchResult[] = [
          {
            type: 'recipe' as const,
            id: 1,
            name: 'Venison Tenderloin with Red Wine Reduction',
            slug: 'venison-tenderloin-red-wine',
            category: 'Main Course',
            image_url: '/images/recipes/venison-tenderloin.jpg',
          },
          {
            type: 'recipe' as const,
            id: 2,
            name: 'Smoked Wild Boar Ribs',
            slug: 'smoked-wild-boar-ribs',
            category: 'BBQ',
            image_url: '/images/recipes/boar-ribs.jpg',
          },
          {
            type: 'product' as const,
            id: 101,
            name: 'Wild Game Cookbook',
            slug: 'wild-game-cookbook',
            category: 'Cookbooks',
            price: 29.99,
            image_url: '/images/products/cookbook.jpg',
          },
        ].filter((item) =>
          item.name.toLowerCase().includes(query.toLowerCase())
        );

        setResults(mockResults);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelectResult = (result: SearchResult) => {
    saveSearch(query);
    const path =
      result.type === 'recipe'
        ? `/recipes/${result.slug}`
        : `/shop/products/${result.slug}`;
    router.push(path);
    onClose();
  };

  const handleSelectRecentSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  const handleViewAllResults = () => {
    if (query.trim()) {
      saveSearch(query);
      router.push(`/search?q=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults([]);
    }
  }, [open]);

  const recipeResults = results.filter((r) => r.type === 'recipe');
  const productResults = results.filter((r) => r.type === 'product');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl border-stone bg-cream p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Search recipes and products</DialogTitle>
        </DialogHeader>

        <Command className="border-none bg-transparent">
          <div className="flex items-center border-b border-stone px-4">
            <Search className="mr-2 h-5 w-5 shrink-0 text-slate" />
            <CommandInput
              placeholder="Search recipes and products..."
              value={query}
              onValueChange={setQuery}
              className="border-none bg-transparent text-barkBrown placeholder:text-slate focus:outline-none"
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuery('')}
                className="h-8 w-8 text-slate hover:text-barkBrown"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <CommandList className="max-h-[400px] overflow-y-auto">
            {!query && recentSearches.length > 0 && (
              <CommandGroup heading="Recent Searches">
                <div className="mb-2 flex items-center justify-between px-2">
                  <span className="text-xs font-semibold text-slate">
                    RECENT
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearRecentSearches}
                    className="h-auto p-0 text-xs text-slate hover:text-barkBrown"
                  >
                    Clear
                  </Button>
                </div>
                {recentSearches.map((search, index) => (
                  <CommandItem
                    key={index}
                    onSelect={() => handleSelectRecentSearch(search)}
                    className="cursor-pointer text-barkBrown hover:bg-stone/30"
                  >
                    <Clock className="mr-2 h-4 w-4 text-slate" />
                    {search}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {!query && (
              <CommandGroup heading="Popular Searches">
                <div className="mb-2 px-2">
                  <span className="text-xs font-semibold text-slate">
                    TRENDING
                  </span>
                </div>
                {['Venison recipes', 'Wild boar', 'Duck breast', 'Game meat'].map(
                  (search) => (
                    <CommandItem
                      key={search}
                      onSelect={() => handleSelectRecentSearch(search)}
                      className="cursor-pointer text-barkBrown hover:bg-stone/30"
                    >
                      <TrendingUp className="mr-2 h-4 w-4 text-slate" />
                      {search}
                    </CommandItem>
                  )
                )}
              </CommandGroup>
            )}

            {query && !isSearching && results.length === 0 && (
              <CommandEmpty className="py-12 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone/30">
                  <Search className="h-8 w-8 text-slate" />
                </div>
                <p className="mt-4 font-semibold text-barkBrown">
                  No results found
                </p>
                <p className="mt-1 text-sm text-slate">
                  Try searching for something else
                </p>
              </CommandEmpty>
            )}

            {query && recipeResults.length > 0 && (
              <CommandGroup heading="Recipes">
                <div className="mb-2 px-2">
                  <span className="text-xs font-semibold text-slate">
                    RECIPES
                  </span>
                </div>
                {recipeResults.map((result) => (
                  <CommandItem
                    key={`recipe-${result.id}`}
                    onSelect={() => handleSelectResult(result)}
                    className="cursor-pointer hover:bg-stone/30"
                  >
                    <div className="flex w-full items-center gap-3">
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-stone">
                        {result.image_url ? (
                          <Image
                            src={result.image_url}
                            alt={result.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-stone/30">
                            <ChefHat className="h-6 w-6 text-slate" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate font-medium text-barkBrown">
                          {result.name}
                        </p>
                        {result.category && (
                          <p className="text-xs text-slate">{result.category}</p>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className="border-forestGreen text-forestGreen"
                      >
                        Recipe
                      </Badge>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {query && productResults.length > 0 && (
              <CommandGroup heading="Products">
                <div className="mb-2 px-2">
                  <span className="text-xs font-semibold text-slate">
                    PRODUCTS
                  </span>
                </div>
                {productResults.map((result) => (
                  <CommandItem
                    key={`product-${result.id}`}
                    onSelect={() => handleSelectResult(result)}
                    className="cursor-pointer hover:bg-stone/30"
                  >
                    <div className="flex w-full items-center gap-3">
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-stone">
                        {result.image_url ? (
                          <Image
                            src={result.image_url}
                            alt={result.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-stone/30">
                            <ShoppingBag className="h-6 w-6 text-slate" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="truncate font-medium text-barkBrown">
                          {result.name}
                        </p>
                        {result.price && (
                          <p className="text-sm font-semibold text-forestGreen">
                            {formatPrice(result.price)}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className="border-hunterOrange text-hunterOrange"
                      >
                        Product
                      </Badge>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {query && results.length > 0 && (
              <div className="border-t border-stone p-2">
                <Button
                  variant="ghost"
                  className="w-full justify-center text-hunterOrange hover:bg-hunterOrange/10 hover:text-hunterOrange"
                  onClick={handleViewAllResults}
                >
                  View all results for "{query}"
                </Button>
              </div>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
