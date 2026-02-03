"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
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

  // Find a variant that has a specific option value (for getting color swatch images)
  const findVariantWithOption = (
    optionName: string,
    optionValue: string
  ): NormalizedShopifyVariant | null => {
    return (
      variants.find((variant) =>
        variant.selectedOptions.some(
          (opt) => opt.name === optionName && opt.value === optionValue
        )
      ) || null
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

        // For color options, check if variants have images we can use as swatches
        const colorSwatchImages: Record<string, string | null> = {};
        if (isColorOption) {
          for (const value of option.values) {
            const variant = findVariantWithOption(option.name, value);
            colorSwatchImages[value] = variant?.image?.url || null;
          }
        }
        const hasSwatchImages = Object.values(colorSwatchImages).some(Boolean);

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

            {isColorOption && hasSwatchImages ? (
              // Color swatches using variant images
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const isSelected = selectedOptions[option.name] === value;
                  const isAvailable = isOptionAvailable(option.name, value);
                  const swatchImage = colorSwatchImages[value];

                  return (
                    <button
                      key={value}
                      onClick={() =>
                        isAvailable && handleOptionChange(option.name, value)
                      }
                      disabled={!isAvailable}
                      className={cn(
                        "group relative h-12 w-12 overflow-hidden rounded-md border-2 transition-all",
                        isSelected
                          ? "border-[#2D5A3D] ring-2 ring-[#2D5A3D] ring-offset-2"
                          : "border-gray-300 hover:border-gray-400",
                        !isAvailable && "cursor-not-allowed opacity-40"
                      )}
                      title={value}
                    >
                      {swatchImage ? (
                        <Image
                          src={swatchImage}
                          alt={value}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center bg-gray-100 text-xs">
                          {value.slice(0, 2)}
                        </span>
                      )}
                      {!isAvailable && (
                        <span className="absolute inset-0 flex items-center justify-center bg-white/50">
                          <span className="h-0.5 w-full rotate-45 bg-gray-400" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              // Button group for size and other options (or colors without images)
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
                        !isSelected && "hover:text-hunterOrange hover:font-bold hover:bg-transparent hover:border-hunterOrange",
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
