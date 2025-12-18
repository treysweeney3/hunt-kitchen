"use client";

import { useEffect, useState } from "react";
import { ProductVariant } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface VariantSelectorProps {
  variants: ProductVariant[];
  basePrice: number;
  onVariantChange: (variant: ProductVariant | null, price: number) => void;
  className?: string;
}

interface VariantOption {
  name: string;
  values: string[];
}

export function VariantSelector({
  variants,
  basePrice,
  onVariantChange,
  className,
}: VariantSelectorProps) {
  // Extract unique options
  const options: VariantOption[] = [];

  // Get option1 (e.g., Size, Color)
  const option1Name = variants.find((v) => v.option1Name)?.option1Name;
  if (option1Name) {
    const option1Values = [
      ...new Set(variants.map((v) => v.option1Value).filter(Boolean)),
    ] as string[];
    options.push({ name: option1Name, values: option1Values });
  }

  // Get option2
  const option2Name = variants.find((v) => v.option2Name)?.option2Name;
  if (option2Name) {
    const option2Values = [
      ...new Set(variants.map((v) => v.option2Value).filter(Boolean)),
    ] as string[];
    options.push({ name: option2Name, values: option2Values });
  }

  // Get option3
  const option3Name = variants.find((v) => v.option3Name)?.option3Name;
  if (option3Name) {
    const option3Values = [
      ...new Set(variants.map((v) => v.option3Value).filter(Boolean)),
    ] as string[];
    options.push({ name: option3Name, values: option3Values });
  }

  // State for selected options
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string | undefined>
  >({});

  // Find matching variant based on selected options
  const findMatchingVariant = (selections: Record<string, string | undefined>) => {
    return variants.find((variant) => {
      const matches = options.every((option) => {
        const selectedValue = selections[option.name];
        if (!selectedValue) return true; // Skip unselected options

        if (variant.option1Name === option.name) {
          return variant.option1Value === selectedValue;
        }
        if (variant.option2Name === option.name) {
          return variant.option2Value === selectedValue;
        }
        if (variant.option3Name === option.name) {
          return variant.option3Value === selectedValue;
        }
        return false;
      });
      return matches;
    });
  };

  // Check if a specific option value is available given current selections
  const isOptionAvailable = (optionName: string, value: string): boolean => {
    const testSelections = { ...selectedOptions, [optionName]: value };
    const matchingVariant = findMatchingVariant(testSelections);
    return matchingVariant ? matchingVariant.inventoryQuantity > 0 : false;
  };

  // Update parent when selection changes
  useEffect(() => {
    const allOptionsSelected = options.every(
      (option) => selectedOptions[option.name]
    );

    if (allOptionsSelected) {
      const matchingVariant = findMatchingVariant(selectedOptions);
      if (matchingVariant) {
        const price = matchingVariant.price ?? basePrice;
        onVariantChange(matchingVariant, price);
      } else {
        onVariantChange(null, basePrice);
      }
    } else {
      onVariantChange(null, basePrice);
    }
  }, [selectedOptions]);

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
          <div key={option.name}>
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
                        !isAvailable && "cursor-not-allowed opacity-50 line-through"
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
