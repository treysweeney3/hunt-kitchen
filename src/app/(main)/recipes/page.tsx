import type { Metadata } from 'next';
import { RecipeGrid } from '@/components/recipes/RecipeGrid';
import { RecipeFiltersClient } from '@/components/recipes/RecipeFiltersClient';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import type { Recipe, PaginatedResponse, RecipeFilters } from '@/types';
import prisma from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Top 10 Recipes',
  description: 'Our top 10 featured wild game recipes including venison, elk, duck, and more.',
};

interface RecipesPageProps {
  searchParams: Promise<{
    page?: string;
    sort?: string;
    search?: string;
    gameType?: string;
    category?: string;
    featured?: string;
  }>;
}

async function getRecipes(filters: RecipeFilters): Promise<PaginatedResponse<Recipe>> {
  const page = 1; // Always page 1 - no pagination for Top 10
  const limit = 10; // Top 10 featured recipes only
  const skip = 0;

  // Build orderBy
  let orderBy: any = { publishedAt: 'desc' };
  switch (filters.sortBy) {
    case 'popular':
      orderBy = { viewCount: 'desc' };
      break;
    case 'rating':
      orderBy = { createdAt: 'desc' }; // Fallback - would need aggregation for true rating sort
      break;
    case 'prepTime':
      orderBy = { prepTimeMinutes: 'asc' };
      break;
    case 'cookTime':
      orderBy = { cookTimeMinutes: 'asc' };
      break;
  }

  // Build where clause - only featured recipes
  const where: any = { isPublished: true, isFeatured: true };
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  if (filters.gameTypeIds && filters.gameTypeIds.length > 0) {
    where.gameTypeId = { in: filters.gameTypeIds };
  }
  if (filters.categoryIds && filters.categoryIds.length > 0) {
    where.categories = { some: { categoryId: { in: filters.categoryIds } } };
  }

  const [recipes, total] = await Promise.all([
    prisma.recipe.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        gameType: true,
        categories: { include: { category: true } },
        ratings: { where: { isApproved: true } },
      },
    }),
    prisma.recipe.count({ where }),
  ]);

  const formattedRecipes: Recipe[] = recipes.map((r) => {
    const avgRating = r.ratings.length > 0
      ? r.ratings.reduce((sum, rating) => sum + rating.rating, 0) / r.ratings.length
      : 0;

    return {
      id: r.id,
      title: r.title,
      slug: r.slug,
      description: r.description,
      featuredImageUrl: r.featuredImageUrl || '',
      galleryImages: (r.galleryImages as unknown as string[]) || [],
      ingredients: r.ingredients as unknown as Recipe['ingredients'],
      instructions: r.instructions as unknown as Recipe['instructions'],
      prepTimeMinutes: r.prepTimeMinutes ?? 0,
      cookTimeMinutes: r.cookTimeMinutes ?? 0,
      totalTimeMinutes: r.totalTimeMinutes ?? 0,
      servings: r.servings ?? 1,
      gameTypeId: r.gameTypeId,
      gameType: r.gameType ? {
        id: r.gameType.id,
        name: r.gameType.name,
        slug: r.gameType.slug,
        description: r.gameType.description,
        imageUrl: r.gameType.imageUrl,
        isActive: r.gameType.isActive,
        createdAt: r.gameType.createdAt,
        updatedAt: r.gameType.updatedAt,
      } : undefined,
      categories: r.categories.map((c) => ({
        id: c.category.id,
        name: c.category.name,
        slug: c.category.slug,
        description: c.category.description,
        imageUrl: c.category.imageUrl,
        displayOrder: c.category.displayOrder,
        isActive: c.category.isActive,
        createdAt: c.category.createdAt,
        updatedAt: c.category.updatedAt,
      })),
      tips: r.tips,
      nutritionInfo: r.nutritionInfo as unknown as Recipe['nutritionInfo'],
      videoUrl: r.videoUrl,
      isFeatured: r.isFeatured,
      isPublished: r.isPublished,
      publishedAt: r.publishedAt,
      viewCount: r.viewCount,
      averageRating: Math.round(avgRating * 10) / 10,
      ratingCount: r.ratings.length,
      metaTitle: r.metaTitle,
      metaDescription: r.metaDescription,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  });

  return {
    data: formattedRecipes,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const sortBy = (params.sort as RecipeFilters['sortBy']) || 'newest';
  const search = params.search || '';

  const filters: RecipeFilters = {
    page,
    limit: 12,
    sortBy,
    search: search || undefined,
  };

  const { data: recipes, pagination } = await getRecipes(filters);

  return (
    <div className="min-h-screen bg-cream py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Recipes</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-barkBrown sm:text-5xl">
            Top 10 Recipes
          </h1>
          <p className="mt-2 text-lg text-slate">
            Our most popular wild game recipes, handpicked for you
          </p>
        </div>

        {/* Search and Sort Controls */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate" />
            <Input
              type="search"
              placeholder="Search recipes..."
              className="pl-10"
              defaultValue={search}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate whitespace-nowrap">Sort by:</span>
            <Select defaultValue={sortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="prepTime">Prep Time</SelectItem>
                <SelectItem value="cookTime">Cook Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Filters Sidebar */}
          <aside className="space-y-6">
            <RecipeFiltersClient />
          </aside>

          {/* Recipes Grid */}
          <div className="space-y-6">
            {recipes.length > 0 ? (
              <>
                <div className="text-sm text-slate">
                  Showing {recipes.length} featured recipes
                </div>
                <RecipeGrid recipes={recipes} />
              </>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-slate/30 bg-white p-12 text-center">
                <h3 className="font-semibold text-lg text-barkBrown">
                  No recipes found
                </h3>
                <p className="mt-2 text-slate">
                  {search
                    ? 'Try adjusting your search or filters'
                    : 'Check back soon for delicious wild game recipes'}
                </p>
                {search && (
                  <Button asChild variant="outline" className="mt-4">
                    <a href="/recipes">Clear Search</a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
