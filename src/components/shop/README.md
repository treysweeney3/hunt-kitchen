# Shop Components

This directory contains all e-commerce product components for The Hunt Kitchen website. These components are built with React 19, Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui.

## Design System

### Brand Colors
- **Forest Green**: `#2D5A3D` - Primary brand color, main CTAs
- **Hunter Orange**: `#E07C24` - Secondary CTAs, sale prices, add to cart
- **Bark Brown**: `#4A3728` - Accent color

## Components

### ProductCard
Display product information in a grid layout with quick add functionality.

**Features:**
- Hover effect showing secondary image
- Sale badge for discounted items
- Sold out badge overlay
- Quick add button for single-variant products
- Price display with compare-at-price strikethrough
- Variant indicator text (e.g., "5 colors available")

**Usage:**
```tsx
import { ProductCard } from "@/components/shop";

<ProductCard product={product} />
```

**Props:**
- `product: Product` - Product data from database

---

### ProductGrid
Responsive grid layout for displaying multiple products.

**Features:**
- Responsive: 2 cols mobile, 3 cols tablet, 4 cols desktop
- Loading skeleton states
- Empty state with icon and message
- Auto-adjusts to product count

**Usage:**
```tsx
import { ProductGrid } from "@/components/shop";

<ProductGrid
  products={products}
  loading={isLoading}
/>
```

**Props:**
- `products: Product[]` - Array of products to display
- `loading?: boolean` - Show skeleton loaders (default: false)

---

### ProductGallery
Full-featured product image gallery with thumbnails and lightbox.

**Features:**
- Main large image with thumbnail strip
- Click thumbnails to change main image
- Zoom on hover with visual indicator
- Lightbox/modal view for full-size images
- Video support if `videoUrl` exists
- Responsive thumbnail grid

**Usage:**
```tsx
import { ProductGallery } from "@/components/shop";

<ProductGallery
  featuredImage={product.featuredImageUrl}
  galleryImages={product.galleryImages}
  videoUrl={product.videoUrl}
  productName={product.name}
/>
```

**Props:**
- `featuredImage: string` - Main product image URL
- `galleryImages?: string[]` - Additional gallery images
- `videoUrl?: string | null` - Optional product video URL
- `productName: string` - Product name for alt text

---

### VariantSelector
Interactive variant selection with visual swatches and availability.

**Features:**
- Automatic option extraction (Size, Color, etc.)
- Visual color swatches for color options
- Button groups for other options
- Disabled state for out-of-stock variants
- Real-time price updates on variant change
- Smart availability checking

**Usage:**
```tsx
import { VariantSelector } from "@/components/shop";

const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
const [price, setPrice] = useState(product.basePrice);

<VariantSelector
  variants={product.variants || []}
  basePrice={product.basePrice}
  onVariantChange={(variant, price) => {
    setSelectedVariant(variant);
    setPrice(price);
  }}
/>
```

**Props:**
- `variants: ProductVariant[]` - Array of product variants
- `basePrice: number` - Base product price
- `onVariantChange: (variant: ProductVariant | null, price: number) => void` - Callback when variant selection changes
- `className?: string` - Optional CSS classes

**Color Support:**
The component includes a built-in color mapping for common hunting/outdoor colors:
- Black, White, Gray, Brown
- Olive, Camo, Blaze, Navy
- Tan, Khaki
- And standard colors (Red, Blue, Green, etc.)

---

### AddToCartButton
Full add-to-cart functionality with quantity selection.

**Features:**
- Quantity selector with +/- buttons
- Input validation and bounds checking
- Loading state during add operation
- Success toast notification with cart icon
- Out of stock detection and disabled state
- Inventory availability display
- Auto-reset quantity after successful add

**Usage:**
```tsx
import { AddToCartButton } from "@/components/shop";

<AddToCartButton
  product={product}
  selectedVariant={selectedVariant}
  disabled={!selectedVariant}
/>
```

**Props:**
- `product: Product` - Product data
- `selectedVariant: ProductVariant | null` - Currently selected variant
- `disabled?: boolean` - Disable the button (default: false)
- `className?: string` - Optional CSS classes

---

### CartItem
Display and manage individual cart items.

**Features:**
- Product thumbnail with link
- Product name and variant details (size, color, SKU)
- Quantity selector with update
- Remove item button
- Line total calculation
- Price with compare-at-price for sales
- Savings display for discounted items

**Usage:**
```tsx
import { CartItem } from "@/components/shop";
import { useCartStore } from "@/stores/cartStore";

const items = useCartStore((state) => state.items);

{items.map((item) => (
  <CartItem key={`${item.product_id}-${item.variant_id}`} item={item} />
))}
```

**Props:**
- `item: CartItem` - Cart item data from cart store

---

### ProductFilters
Comprehensive filtering sidebar for shop pages.

**Features:**
- Category filter with active state
- Price range slider
- Size filter (for apparel)
- Color filter with swatches
- In-stock only toggle
- Sort dropdown (Newest, Price Low-High, Price High-Low, Best Selling)
- Active filter count badge
- Clear all filters button

**Usage:**
```tsx
import { ProductFilters, ProductFilterState } from "@/components/shop";

const [filters, setFilters] = useState<ProductFilterState>({
  categoryIds: [],
  sizes: [],
  colors: [],
  inStockOnly: false,
  sortBy: "newest",
});

<ProductFilters
  categories={categories}
  filters={filters}
  onFilterChange={setFilters}
  priceRange={{ min: 0, max: 500 }}
  availableSizes={["XS", "S", "M", "L", "XL", "2XL", "3XL"]}
  availableColors={["Black", "White", "Camo", "Blaze"]}
/>
```

**Props:**
- `categories: ProductCategory[]` - Available product categories
- `filters: ProductFilterState` - Current filter state
- `onFilterChange: (filters: ProductFilterState) => void` - Callback when filters change
- `priceRange?: { min: number; max: number }` - Price range bounds (default: 0-500)
- `availableSizes?: string[]` - Available size options
- `availableColors?: string[]` - Available color options
- `className?: string` - Optional CSS classes

**Filter State Interface:**
```typescript
interface ProductFilterState {
  categoryIds: string[];
  minPrice?: number;
  maxPrice?: number;
  sizes: string[];
  colors: string[];
  inStockOnly: boolean;
  sortBy: "newest" | "price-asc" | "price-desc" | "best-selling";
}
```

---

## Cart Store Integration

All components integrate with the Zustand cart store at `/src/stores/cartStore.ts`.

### Available Cart Functions

```tsx
import { useCartStore } from "@/stores/cartStore";

// Add item to cart
const addItem = useCartStore((state) => state.addItem);

// Update quantity
const updateQuantity = useCartStore((state) => state.updateQuantity);

// Remove item
const removeItem = useCartStore((state) => state.removeItem);

// Get cart totals
const subtotal = useCartStore((state) => state.getSubtotal());
const total = useCartStore((state) => state.getTotal());
const itemCount = useCartStore((state) => state.getItemCount());
```

## Toast Notifications

Components use `sonner` for toast notifications:

```tsx
import { toast } from "sonner";

toast.success("Item added to cart");
toast.error("Failed to add item");
```

Make sure to include the Toaster component in your root layout:

```tsx
import { Toaster } from "sonner";

<Toaster position="top-right" />
```

## Example: Complete Product Page

```tsx
"use client";

import { useState } from "react";
import {
  ProductGallery,
  VariantSelector,
  AddToCartButton
} from "@/components/shop";
import { Product } from "@/types";

export default function ProductPage({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [price, setPrice] = useState(product.basePrice);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <ProductGallery
          featuredImage={product.featuredImageUrl}
          galleryImages={product.galleryImages}
          videoUrl={product.videoUrl}
          productName={product.name}
        />

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {product.name}
            </h1>
            <p className="mt-2 text-2xl font-bold text-[#2D5A3D]">
              ${price.toFixed(2)}
            </p>
          </div>

          <p className="text-gray-600">{product.description}</p>

          {/* Variant Selection */}
          {product.variants && product.variants.length > 0 && (
            <VariantSelector
              variants={product.variants}
              basePrice={product.basePrice}
              onVariantChange={(variant, newPrice) => {
                setSelectedVariant(variant);
                setPrice(newPrice);
              }}
            />
          )}

          {/* Add to Cart */}
          <AddToCartButton
            product={product}
            selectedVariant={selectedVariant}
            disabled={!selectedVariant && product.variants && product.variants.length > 0}
          />
        </div>
      </div>
    </div>
  );
}
```

## Example: Shop Page with Filters

```tsx
"use client";

import { useState } from "react";
import {
  ProductGrid,
  ProductFilters,
  ProductFilterState
} from "@/components/shop";

export default function ShopPage({
  products,
  categories
}: {
  products: Product[];
  categories: ProductCategory[];
}) {
  const [filters, setFilters] = useState<ProductFilterState>({
    categoryIds: [],
    sizes: [],
    colors: [],
    inStockOnly: false,
    sortBy: "newest",
  });

  // Apply filters to products (implement your filter logic)
  const filteredProducts = applyFilters(products, filters);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <ProductFilters
            categories={categories}
            filters={filters}
            onFilterChange={setFilters}
          />
        </aside>

        {/* Product Grid */}
        <main className="lg:col-span-3">
          <ProductGrid products={filteredProducts} />
        </main>
      </div>
    </div>
  );
}
```

## Styling Notes

- All components use Tailwind CSS utility classes
- Brand colors are used consistently throughout
- Hover states and transitions are implemented for better UX
- Responsive breakpoints: `sm`, `md`, `lg`
- Components support dark mode (if theme is configured)

## Accessibility

- Semantic HTML elements used throughout
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus states visible on all interactive elements
- Alt text on all images
- Color contrast meets WCAG AA standards

## Performance

- Next.js Image component used for optimized images
- Lazy loading implemented where appropriate
- Client-side state management with Zustand
- Debounced filter updates (implement in parent component)
- Skeleton loaders for better perceived performance
