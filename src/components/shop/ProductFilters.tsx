"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCategory } from "@/types";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface ProductFilterState {
  categoryIds: string[];
  minPrice?: number;
  maxPrice?: number;
  sizes: string[];
  colors: string[];
  inStockOnly: boolean;
  sortBy: "newest" | "price-asc" | "price-desc" | "best-selling";
}

interface ProductFiltersProps {
  categories: ProductCategory[];
  filters: ProductFilterState;
  onFilterChange: (filters: ProductFilterState) => void;
  priceRange?: { min: number; max: number };
  availableSizes?: string[];
  availableColors?: string[];
  className?: string;
}

export function ProductFilters({
  categories,
  filters,
  onFilterChange,
  priceRange = { min: 0, max: 500 },
  availableSizes = ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
  availableColors = [
    "Black",
    "White",
    "Gray",
    "Brown",
    "Olive",
    "Camo",
    "Blaze",
    "Navy",
  ],
  className,
}: ProductFiltersProps) {
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>([
    filters.minPrice ?? priceRange.min,
    filters.maxPrice ?? priceRange.max,
  ]);

  const updateFilters = (updates: Partial<ProductFilterState>) => {
    onFilterChange({ ...filters, ...updates });
  };

  const toggleCategory = (categoryId: string) => {
    const newCategories = filters.categoryIds.includes(categoryId)
      ? filters.categoryIds.filter((id) => id !== categoryId)
      : [...filters.categoryIds, categoryId];
    updateFilters({ categoryIds: newCategories });
  };

  const toggleSize = (size: string) => {
    const newSizes = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    updateFilters({ sizes: newSizes });
  };

  const toggleColor = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter((c) => c !== color)
      : [...filters.colors, color];
    updateFilters({ colors: newColors });
  };

  const handlePriceCommit = () => {
    updateFilters({
      minPrice: localPriceRange[0],
      maxPrice: localPriceRange[1],
    });
  };

  const clearFilters = () => {
    onFilterChange({
      categoryIds: [],
      sizes: [],
      colors: [],
      inStockOnly: false,
      sortBy: "newest",
    });
    setLocalPriceRange([priceRange.min, priceRange.max]);
  };

  const activeFilterCount =
    filters.categoryIds.length +
    filters.sizes.length +
    filters.colors.length +
    (filters.inStockOnly ? 1 : 0) +
    (filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Filter header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount}</Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-600 hover:text-gray-900"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Sort */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Sort By</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={filters.sortBy}
            onValueChange={(value) =>
              updateFilters({
                sortBy: value as ProductFilterState["sortBy"],
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="best-selling">Best Selling</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Categories */}
      {categories.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => toggleCategory(category.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-gray-100",
                  filters.categoryIds.includes(category.id) &&
                    "bg-[#2D5A3D]/10 font-medium text-[#2D5A3D]"
                )}
              >
                <span>{category.name}</span>
                {filters.categoryIds.includes(category.id) && (
                  <X className="h-4 w-4" />
                )}
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Price Range */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Price Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Slider
            value={localPriceRange}
            onValueChange={(value) => setLocalPriceRange(value as [number, number])}
            onValueCommit={handlePriceCommit}
            min={priceRange.min}
            max={priceRange.max}
            step={10}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>${localPriceRange[0]}</span>
            <span>${localPriceRange[1]}</span>
          </div>
        </CardContent>
      </Card>

      {/* Size Filter */}
      {availableSizes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => (
                <Button
                  key={size}
                  variant={filters.sizes.includes(size) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSize(size)}
                  className={cn(
                    filters.sizes.includes(size) &&
                      "bg-[#2D5A3D] hover:bg-[#234a30]"
                  )}
                >
                  {size}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Color Filter */}
      {availableColors.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Color</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {availableColors.map((color) => (
                <button
                  key={color}
                  onClick={() => toggleColor(color)}
                  className={cn(
                    "group relative h-10 w-10 rounded-full border-2 transition-all",
                    filters.colors.includes(color)
                      ? "border-[#2D5A3D] ring-2 ring-[#2D5A3D] ring-offset-2"
                      : "border-gray-300 hover:border-gray-400"
                  )}
                  title={color}
                >
                  <span
                    className="block h-full w-full rounded-full"
                    style={{
                      backgroundColor: getColorHex(color),
                    }}
                  />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* In Stock Only */}
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <Label htmlFor="in-stock" className="cursor-pointer">
            In Stock Only
          </Label>
          <Switch
            id="in-stock"
            checked={filters.inStockOnly}
            onCheckedChange={(checked) => updateFilters({ inStockOnly: checked })}
          />
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to convert color names to hex
function getColorHex(colorName: string): string {
  const colorMap: Record<string, string> = {
    black: "#000000",
    white: "#FFFFFF",
    red: "#DC2626",
    blue: "#2563EB",
    green: "#16A34A",
    yellow: "#EAB308",
    orange: "#EA580C",
    purple: "#9333EA",
    pink: "#EC4899",
    gray: "#6B7280",
    brown: "#92400E",
    navy: "#1E3A8A",
    olive: "#65A30D",
    tan: "#D4A574",
    khaki: "#C3B091",
    camo: "#78866B",
    blaze: "#FF6600",
  };

  return (
    colorMap[colorName.toLowerCase()] ||
    colorMap[colorName.toLowerCase().split(" ")[0]] ||
    "#9CA3AF"
  );
}
