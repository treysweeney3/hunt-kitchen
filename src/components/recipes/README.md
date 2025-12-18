# Recipe Components

A comprehensive collection of React components for The Hunt Kitchen's recipe features. All components are built with TypeScript, Tailwind CSS, and shadcn/ui.

## Design Colors

- **Forest Green**: `#2D5A3D` - Used for game type badges, primary actions
- **Hunter Orange**: `#E07C24` - Used for ratings, highlights, accent actions
- **Bark Brown**: `#4A3728` - Used for text elements
- **Cream**: `#F5F2EB` - Used for background accents

## Components

### 1. RecipeCard

A visually rich card component for displaying recipe summaries in grid layouts.

**Features:**
- Featured image with hover zoom effect
- Game type and category badges
- Prep and cook time display
- Star rating display
- Save/favorite functionality with heart icon
- Copy link button
- Responsive design

**Usage:**
```tsx
import { RecipeCard } from "@/components/recipes";

<RecipeCard
  recipe={recipe}
  onSave={handleSaveRecipe}
  isSaved={false}
/>
```

**Props:**
- `recipe: Recipe` - Recipe data object
- `onSave?: (recipeId: string) => Promise<void>` - Save handler function
- `isSaved?: boolean` - Whether recipe is saved (default: false)
- `className?: string` - Additional CSS classes

---

### 2. RecipeGrid

Responsive grid layout for displaying multiple recipe cards.

**Features:**
- Responsive grid: 1 col mobile, 2 cols tablet, 3-4 cols desktop
- Loading skeleton states
- Empty state with message
- Automatic saved state management

**Usage:**
```tsx
import { RecipeGrid } from "@/components/recipes";

<RecipeGrid
  recipes={recipes}
  onSaveRecipe={handleSave}
  savedRecipeIds={savedIds}
  isLoading={isLoading}
  emptyMessage="No recipes found. Try adjusting your filters."
/>
```

**Props:**
- `recipes: Recipe[]` - Array of recipes to display
- `onSaveRecipe?: (recipeId: string) => Promise<void>` - Save handler
- `savedRecipeIds?: string[]` - Array of saved recipe IDs
- `isLoading?: boolean` - Loading state (default: false)
- `emptyMessage?: string` - Custom empty state message
- `className?: string` - Additional CSS classes

---

### 3. RecipeFilters

Comprehensive filtering sidebar/panel for recipe search.

**Features:**
- Game type checkboxes with counts
- Category checkboxes with counts
- Cook time range filters
- Active filters display with clear buttons
- Mobile responsive (collapsible Sheet on mobile)
- URL-synced filters via onChange callback
- Persistent filter state

**Usage:**
```tsx
import { RecipeFilters } from "@/components/recipes";

// Desktop version
<RecipeFilters
  gameTypes={gameTypes}
  categories={categories}
  filterCounts={counts}
  filters={currentFilters}
  onChange={handleFilterChange}
/>

// Mobile version
<RecipeFilters
  gameTypes={gameTypes}
  categories={categories}
  filters={currentFilters}
  onChange={handleFilterChange}
  isMobile={true}
/>
```

**Props:**
- `gameTypes: GameType[]` - Available game types
- `categories: RecipeCategory[]` - Available categories
- `filterCounts?: FilterCounts` - Count of recipes per filter
- `filters: RecipeFiltersType` - Current active filters
- `onChange: (filters: RecipeFiltersType) => void` - Filter change handler
- `isMobile?: boolean` - Use mobile Sheet layout (default: false)
- `className?: string` - Additional CSS classes

**Cook Time Ranges:**
- Under 30 min (0-29 minutes)
- 30-60 min (30-60 minutes)
- 1-2 hours (61-120 minutes)
- 2+ hours (121+ minutes)

---

### 4. RecipeRating

Complete rating and review system for recipes.

**Features:**
- Rating summary with average and count
- Interactive star selector for new reviews
- Review submission form with optional text
- Reviews list display
- User's existing rating highlight
- Authentication check

**Usage:**
```tsx
import { RecipeRating } from "@/components/recipes";

<RecipeRating
  recipeId={recipe.id}
  averageRating={recipe.averageRating || 0}
  ratingCount={recipe.ratingCount || 0}
  ratings={ratings}
  userRating={userRating}
  onSubmitRating={handleSubmitRating}
  isAuthenticated={isAuthenticated}
/>
```

**Props:**
- `recipeId: string` - Recipe ID
- `averageRating: number` - Average rating (0-5)
- `ratingCount: number` - Total number of ratings
- `ratings?: RecipeRatingType[]` - Array of all ratings/reviews
- `userRating?: RecipeRatingType | null` - Current user's rating
- `onSubmitRating?: (input: RecipeRatingInput) => Promise<void>` - Submit handler
- `isAuthenticated?: boolean` - User authentication status

**Sub-components:**
- `StarDisplay` - Display-only star rating
- `InteractiveStarSelector` - Interactive star selector for reviews

---

### 5. IngredientList

Interactive ingredient checklist with persistence.

**Features:**
- Checkbox for each ingredient
- Strikethrough styling when checked
- Amount, unit, ingredient name, notes display
- "Clear all" reset button
- LocalStorage persistence (if recipeId provided)
- Completion indicator
- Interactive hover states

**Usage:**
```tsx
import { IngredientList } from "@/components/recipes";

<IngredientList
  ingredients={recipe.ingredients}
  recipeId={recipe.id}
/>
```

**Props:**
- `ingredients: RecipeIngredient[]` - Array of ingredients
- `recipeId?: string` - Recipe ID for localStorage persistence
- `className?: string` - Additional CSS classes

**Storage:**
- Saves checked state to `localStorage` with key: `recipe-ingredients-{recipeId}`
- Automatically loads on mount

---

### 6. InstructionSteps

Step-by-step cooking instructions with progress tracking.

**Features:**
- Numbered step list with interactive completion
- Optional step images with aspect ratio control
- Progress bar and percentage
- Visual timeline indicator
- LocalStorage persistence (if recipeId provided)
- Completion celebration message
- Step-by-step navigation

**Usage:**
```tsx
import { InstructionSteps } from "@/components/recipes";

<InstructionSteps
  instructions={recipe.instructions}
  recipeId={recipe.id}
/>
```

**Props:**
- `instructions: RecipeInstruction[]` - Array of instruction steps
- `recipeId?: string` - Recipe ID for localStorage persistence
- `className?: string` - Additional CSS classes

**Storage:**
- Saves completed steps to `localStorage` with key: `recipe-steps-{recipeId}`
- Automatically loads on mount

---

### 7. RecipeHero

Full-width hero section for single recipe pages.

**Features:**
- Full-width featured image with gradient overlay
- Recipe title and description overlay
- Game type and category badges
- Comprehensive meta info bar (prep, cook, total time, servings, rating)
- Save button
- Print button
- Share dropdown (copy link, Facebook, Twitter)
- Fully responsive design

**Usage:**
```tsx
import { RecipeHero } from "@/components/recipes";

<RecipeHero
  recipe={recipe}
  onSave={handleSave}
  isSaved={isSaved}
/>
```

**Props:**
- `recipe: Recipe` - Complete recipe object
- `onSave?: (recipeId: string) => Promise<void>` - Save handler
- `isSaved?: boolean` - Whether recipe is saved (default: false)
- `className?: string` - Additional CSS classes

**Share Options:**
- Copy Link - Copies recipe URL to clipboard
- Facebook - Opens Facebook share dialog
- Twitter - Opens Twitter share dialog

---

## Type Definitions

All components use TypeScript types from `@/types/index.ts`:

- `Recipe` - Complete recipe data
- `RecipeIngredient` - Ingredient with amount, unit, name, notes
- `RecipeInstruction` - Step number, text, optional image
- `RecipeRating` - Rating data with user info
- `RecipeRatingInput` - Input for submitting ratings
- `GameType` - Game type taxonomy
- `RecipeCategory` - Recipe category taxonomy
- `RecipeFilters` - Filter parameters

## Common Patterns

### Authentication Handling

Components that require authentication (save, rating) accept optional handlers and show appropriate messages when unavailable:

```tsx
// If no handler provided, shows "Please log in" message
<RecipeCard
  recipe={recipe}
  onSave={undefined} // No handler = not authenticated
/>

// With handler = authenticated
<RecipeCard
  recipe={recipe}
  onSave={handleSave}
/>
```

### LocalStorage Persistence

Components that support persistence (IngredientList, InstructionSteps) use the `recipeId` prop to store state:

```tsx
// With recipeId = persistence enabled
<IngredientList
  ingredients={ingredients}
  recipeId={recipe.id}
/>

// Without recipeId = no persistence (useful for previews)
<IngredientList
  ingredients={ingredients}
/>
```

### Responsive Design

All components are fully responsive:
- Mobile: Single column, touch-friendly
- Tablet: 2 columns where applicable
- Desktop: 3-4 columns where applicable
- RecipeFilters has dedicated mobile Sheet UI

### Toast Notifications

Components use `sonner` for user feedback:
- Success messages (save, copy, submit)
- Error messages (failed operations)
- Info messages (login required)

## Icons

All icons use `lucide-react`:
- Clock - Time information
- Users - Servings
- Star - Ratings
- Heart - Save/favorite
- Copy - Copy link
- Share2 - Share menu
- Printer - Print
- CheckCircle2 - Completed steps
- RotateCcw - Reset/clear
- UtensilsCrossed - Empty state

## Styling

Components use Tailwind CSS with custom colors:

```css
/* Forest Green */
bg-[#2D5A3D] text-white

/* Hunter Orange */
bg-[#E07C24] text-white

/* Bark Brown */
text-[#4A3728]

/* Cream */
bg-[#F5F2EB]
```

## Best Practices

1. **Always provide TypeScript types** - All props are fully typed
2. **Handle loading states** - Use skeleton loaders for better UX
3. **Provide fallbacks** - Default values for optional props
4. **Use semantic HTML** - Proper landmarks and ARIA labels
5. **Optimize images** - Use Next.js Image component with proper sizing
6. **LocalStorage safely** - Check for availability and handle errors
7. **Mobile-first** - Design for mobile, enhance for desktop

## Example: Complete Recipe Page

```tsx
import {
  RecipeHero,
  RecipeRating,
  IngredientList,
  InstructionSteps,
} from "@/components/recipes";

export default function RecipePage({ recipe }) {
  return (
    <div>
      <RecipeHero
        recipe={recipe}
        onSave={handleSave}
        isSaved={isSaved}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <InstructionSteps
              instructions={recipe.instructions}
              recipeId={recipe.id}
            />
          </div>

          <div className="space-y-8">
            <IngredientList
              ingredients={recipe.ingredients}
              recipeId={recipe.id}
            />
          </div>
        </div>

        <div className="mt-12">
          <RecipeRating
            recipeId={recipe.id}
            averageRating={recipe.averageRating || 0}
            ratingCount={recipe.ratingCount || 0}
            ratings={ratings}
            userRating={userRating}
            onSubmitRating={handleSubmitRating}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>
    </div>
  );
}
```

## Example: Recipes Browse Page

```tsx
import {
  RecipeGrid,
  RecipeFilters,
} from "@/components/recipes";

export default function RecipesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <aside className="hidden lg:block">
          <RecipeFilters
            gameTypes={gameTypes}
            categories={categories}
            filterCounts={counts}
            filters={filters}
            onChange={setFilters}
          />
        </aside>

        <div className="lg:col-span-3">
          {/* Mobile filters */}
          <div className="lg:hidden mb-6">
            <RecipeFilters
              gameTypes={gameTypes}
              categories={categories}
              filters={filters}
              onChange={setFilters}
              isMobile
            />
          </div>

          <RecipeGrid
            recipes={recipes}
            onSaveRecipe={handleSave}
            savedRecipeIds={savedIds}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
```
