import type { Metadata } from 'next';
import { RecipeGridWithSave } from '@/components/recipes/RecipeGridWithSave';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { Recipe, PaginatedResponse, RecipeFilters } from '@/types';
import prisma from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Top 10 Recipes',
  description: 'Our top 10 featured wild game recipes including venison, elk, duck, and more.',
};

interface RecipesPageProps {
  searchParams: Promise<{
    sort?: string;
  }>;
}

async function getRecipes(sortBy: string = 'popular'): Promise<PaginatedResponse<Recipe>> {
  const page = 1;
  const limit = 10; // Top 10 featured recipes only
  const skip = 0;

  // Build orderBy - default to popular for Top 10
  let orderBy: any = { viewCount: 'desc' };
  switch (sortBy) {
    case 'newest':
      orderBy = { publishedAt: 'desc' };
      break;
    case 'popular':
      orderBy = { viewCount: 'desc' };
      break;
    case 'rating':
      orderBy = { createdAt: 'desc' };
      break;
    case 'prepTime':
      orderBy = { prepTimeMinutes: 'asc' };
      break;
    case 'cookTime':
      orderBy = { cookTimeMinutes: 'asc' };
      break;
  }

  // Only show featured recipes
  const where = { isPublished: true, isFeatured: true };

  const [recipes, total] = await Promise.all([
    prisma.recipe.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        gameType: true,
        categories: { include: { category: true } },
        ratings: true,
      },
    }),
    prisma.recipe.count({ where }),
  ]);

  const formattedRecipes: Recipe[] = recipes.map((r) => {
    // Calculate average from ALL ratings, rounded to 1 decimal
    const avgRating = r.ratings.length > 0
      ? Math.round((r.ratings.reduce((sum, rating) => sum + rating.rating, 0) / r.ratings.length) * 10) / 10
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
      averageRating: avgRating,
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
  const sortBy = params.sort || 'popular';

  const { data: recipes } = await getRecipes(sortBy);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-forestGreen py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="font-serif text-5xl font-bold leading-tight sm:text-6xl">
              Top 10 Recipes
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-white/80">
              Our most popular wild game recipes, handpicked for you
            </p>
          </div>
        </div>
      </section>

      <div className="bg-cream py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Sort Controls */}
          <div className="mb-8 flex justify-end">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate whitespace-nowrap">Sort by:</span>
              <Select defaultValue={sortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="prepTime">Prep Time</SelectItem>
                  <SelectItem value="cookTime">Cook Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Recipes Grid - Full Width */}
          <div className="space-y-6">
            {recipes.length > 0 ? (
              <RecipeGridWithSave recipes={recipes} />
            ) : (
              <div className="rounded-lg border-2 border-dashed border-slate/30 bg-white p-12 text-center">
                <h3 className="font-semibold text-lg text-forestGreen">
                  No recipes found
                </h3>
                <p className="mt-2 text-slate">
                  Check back soon for delicious wild game recipes
                </p>
              </div>
            )}
          </div>

          {/* Browse All Link */}
          <div className="mt-12 text-center">
            <p className="text-slate mb-4">Looking for more recipes?</p>
            <Button
              asChild
              size="lg"
              className="border-2 border-forestGreen bg-transparent text-forestGreen hover:bg-forestGreen hover:text-white"
            >
              <a href="/recipes/all">Browse All Recipes</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
