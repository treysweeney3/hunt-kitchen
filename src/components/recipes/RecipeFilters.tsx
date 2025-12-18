"use client";

import { useState, useEffect } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { GameType, RecipeCategory, RecipeFilters as RecipeFiltersType } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface FilterCounts {
  gameTypes: Record<string, number>;
  categories: Record<string, number>;
}

interface RecipeFiltersProps {
  gameTypes: GameType[];
  categories: RecipeCategory[];
  filterCounts?: FilterCounts;
  filters: RecipeFiltersType;
  onChange: (filters: RecipeFiltersType) => void;
  isMobile?: boolean;
  className?: string;
}

const COOK_TIME_RANGES = [
  { label: "Under 30 min", min: 0, max: 29 },
  { label: "30-60 min", min: 30, max: 60 },
  { label: "1-2 hours", min: 61, max: 120 },
  { label: "2+ hours", min: 121, max: undefined },
] as const;

export function RecipeFilters({
  gameTypes,
  categories,
  filterCounts,
  filters,
  onChange,
  isMobile = false,
  className,
}: RecipeFiltersProps) {
  const [selectedGameTypes, setSelectedGameTypes] = useState<string[]>(
    filters.gameTypeIds || []
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    filters.categoryIds || []
  );
  const [selectedCookTimeRange, setSelectedCookTimeRange] = useState<number | null>(null);

  // Update parent when filters change
  useEffect(() => {
    const newFilters: RecipeFiltersType = {
      ...filters,
      gameTypeIds: selectedGameTypes.length > 0 ? selectedGameTypes : undefined,
      categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
    };

    if (selectedCookTimeRange !== null) {
      const range = COOK_TIME_RANGES[selectedCookTimeRange];
      newFilters.minCookTime = range.min;
      newFilters.maxCookTime = range.max;
    } else {
      delete newFilters.minCookTime;
      delete newFilters.maxCookTime;
    }

    onChange(newFilters);
  }, [selectedGameTypes, selectedCategories, selectedCookTimeRange]);

  const handleGameTypeToggle = (gameTypeId: string) => {
    setSelectedGameTypes((prev) =>
      prev.includes(gameTypeId)
        ? prev.filter((id) => id !== gameTypeId)
        : [...prev, gameTypeId]
    );
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleCookTimeToggle = (index: number) => {
    setSelectedCookTimeRange((prev) => (prev === index ? null : index));
  };

  const clearAllFilters = () => {
    setSelectedGameTypes([]);
    setSelectedCategories([]);
    setSelectedCookTimeRange(null);
  };

  const clearGameType = (gameTypeId: string) => {
    setSelectedGameTypes((prev) => prev.filter((id) => id !== gameTypeId));
  };

  const clearCategory = (categoryId: string) => {
    setSelectedCategories((prev) => prev.filter((id) => id !== categoryId));
  };

  const clearCookTime = () => {
    setSelectedCookTimeRange(null);
  };

  const activeFilterCount =
    selectedGameTypes.length +
    selectedCategories.length +
    (selectedCookTimeRange !== null ? 1 : 0);

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Active Filters</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-auto p-0 text-xs text-[#E07C24] hover:text-[#c96b1f] hover:bg-transparent"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedGameTypes.map((id) => {
              const gameType = gameTypes.find((gt) => gt.id === id);
              return (
                gameType && (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="bg-[#2D5A3D] text-white hover:bg-[#234a30] pr-1"
                  >
                    {gameType.name}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 hover:bg-transparent"
                      onClick={() => clearGameType(id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )
              );
            })}
            {selectedCategories.map((id) => {
              const category = categories.find((c) => c.id === id);
              return (
                category && (
                  <Badge
                    key={id}
                    variant="outline"
                    className="border-[#2D5A3D] text-[#2D5A3D] pr-1"
                  >
                    {category.name}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 ml-1 hover:bg-transparent"
                      onClick={() => clearCategory(id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )
              );
            })}
            {selectedCookTimeRange !== null && (
              <Badge variant="outline" className="pr-1">
                {COOK_TIME_RANGES[selectedCookTimeRange].label}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 hover:bg-transparent"
                  onClick={clearCookTime}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        </div>
      )}

      <Separator />

      {/* Game Type Filter */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Game Type</h4>
        <div className="space-y-2">
          {gameTypes
            .filter((gt) => gt.isActive)
            .map((gameType) => {
              const count = filterCounts?.gameTypes[gameType.id] || 0;
              return (
                <div key={gameType.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`game-${gameType.id}`}
                    checked={selectedGameTypes.includes(gameType.id)}
                    onCheckedChange={() => handleGameTypeToggle(gameType.id)}
                  />
                  <Label
                    htmlFor={`game-${gameType.id}`}
                    className="flex-1 text-sm font-normal cursor-pointer"
                  >
                    {gameType.name}
                    {filterCounts && (
                      <span className="text-muted-foreground ml-1">({count})</span>
                    )}
                  </Label>
                </div>
              );
            })}
        </div>
      </div>

      <Separator />

      {/* Category Filter */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Category</h4>
        <div className="space-y-2">
          {categories
            .filter((c) => c.isActive)
            .map((category) => {
              const count = filterCounts?.categories[category.id] || 0;
              return (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${category.id}`}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => handleCategoryToggle(category.id)}
                  />
                  <Label
                    htmlFor={`cat-${category.id}`}
                    className="flex-1 text-sm font-normal cursor-pointer"
                  >
                    {category.name}
                    {filterCounts && (
                      <span className="text-muted-foreground ml-1">({count})</span>
                    )}
                  </Label>
                </div>
              );
            })}
        </div>
      </div>

      <Separator />

      {/* Cook Time Filter */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm">Cook Time</h4>
        <div className="space-y-2">
          {COOK_TIME_RANGES.map((range, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Checkbox
                id={`time-${index}`}
                checked={selectedCookTimeRange === index}
                onCheckedChange={() => handleCookTimeToggle(index)}
              />
              <Label
                htmlFor={`time-${index}`}
                className="flex-1 text-sm font-normal cursor-pointer"
              >
                {range.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Mobile version with Sheet
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge className="ml-2 bg-[#E07C24] text-white">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <SheetHeader>
            <SheetTitle>Filter Recipes</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
            <FiltersContent />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop version
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        {activeFilterCount > 0 && (
          <Badge className="bg-[#E07C24] text-white">{activeFilterCount}</Badge>
        )}
      </div>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <FiltersContent />
      </ScrollArea>
    </div>
  );
}
