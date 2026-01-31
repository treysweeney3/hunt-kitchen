"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type {
  NormalizedShopifyVariant,
  ShopifyProductOption,
} from "@/types/shopify";

interface ShopifyVariantSelectorProps {
  variants: NormalizedShopifyVariant[];
  options: ShopifyProductOption[];
  onVariantChange: (variant: NormalizedShopifyVariant | null) => void;
  className?: string;
}

export function ShopifyVariantSelector({
  variants,
  options,
  onVariantChange,
  className,
}: ShopifyVariantSelectorProps) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    {}
  );

  // Initialize with first available variant's options
  useEffect(() => {
    const firstAvailable = variants.find((v) => v.availableForSale);
    if (firstAvailable) {
      const initialOptions: Record<string, string> = {};
      firstAvailable.selectedOptions.forEach((opt) => {
        initialOptions[opt.name] = opt.value;
      });
      setSelectedOptions(initialOptions);
    }
  }, [variants]);

  // Find matching variant based on selected options
  const findMatchingVariant = (
    selections: Record<string, string>
  ): NormalizedShopifyVariant | null => {
    return (
      variants.find((variant) => {
        return variant.selectedOptions.every(
          (opt) => selections[opt.name] === opt.value
        );
      }) || null
    );
  };

  // Check if a specific option value is available given current selections
  const isOptionAvailable = (optionName: string, value: string): boolean => {
    const testSelections = { ...selectedOptions, [optionName]: value };
    const matchingVariant = findMatchingVariant(testSelections);
    return matchingVariant?.availableForSale ?? false;
  };

  // Update parent when selection changes
  useEffect(() => {
    const allOptionsSelected = options.every(
      (option) => selectedOptions[option.name]
    );

    if (allOptionsSelected) {
      const matchingVariant = findMatchingVariant(selectedOptions);
      onVariantChange(matchingVariant);
    } else {
      onVariantChange(null);
    }
  }, [selectedOptions, options, onVariantChange]);

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));
  };

  if (options.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {options.map((option) => {
        const isColorOption = option.name.toLowerCase() === "color";

        return (
          <div key={option.id}>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {option.name}
              {selectedOptions[option.name] && (
                <span className="ml-2 font-normal text-gray-500">
                  ({selectedOptions[option.name]})
                </span>
              )}
            </label>

            {isColorOption ? (
              // Color swatches
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const isSelected = selectedOptions[option.name] === value;
                  const isAvailable = isOptionAvailable(option.name, value);

                  return (
                    <button
                      key={value}
                      onClick={() =>
                        isAvailable && handleOptionChange(option.name, value)
                      }
                      disabled={!isAvailable}
                      className={cn(
                        "group relative h-10 w-10 rounded-full border-2 transition-all",
                        isSelected
                          ? "border-[#2D5A3D] ring-2 ring-[#2D5A3D] ring-offset-2"
                          : "border-gray-300 hover:border-gray-400",
                        !isAvailable && "cursor-not-allowed opacity-40"
                      )}
                      title={value}
                    >
                      <span
                        className="block h-full w-full rounded-full"
                        style={{
                          backgroundColor: getColorHex(value),
                        }}
                      />
                      {!isAvailable && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="h-0.5 w-full rotate-45 bg-gray-400" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              // Button group for other options
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const isSelected = selectedOptions[option.name] === value;
                  const isAvailable = isOptionAvailable(option.name, value);

                  return (
                    <Button
                      key={value}
                      onClick={() =>
                        isAvailable && handleOptionChange(option.name, value)
                      }
                      disabled={!isAvailable}
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        isSelected && "bg-[#2D5A3D] hover:bg-[#234a30]",
                        !isAvailable &&
                          "cursor-not-allowed opacity-50 line-through"
                      )}
                    >
                      {value}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
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
    grey: "#6B7280",
    brown: "#92400E",
    navy: "#1E3A8A",
    olive: "#65A30D",
    tan: "#D4A574",
    khaki: "#C3B091",
    camo: "#78866B",
    blaze: "#FF6600",
    charcoal: "#36454F",
    cream: "#FFFDD0",
    beige: "#F5F5DC",
    maroon: "#800000",
    teal: "#008080",
    coral: "#FF7F50",
    mint: "#98FF98",
    sage: "#9DC183",
    rust: "#B7410E",
    burgundy: "#800020",
    forest: "#228B22",
    hunter: "#355E3B",
  };

  const lowerName = colorName.toLowerCase();
  return (
    colorMap[lowerName] ||
    colorMap[lowerName.split(" ")[0]] ||
    colorMap[lowerName.split("/")[0]?.trim()] ||
    "#9CA3AF"
  );
}
