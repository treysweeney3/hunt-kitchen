import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { RecipeHeroWithSave } from '@/components/recipes/RecipeHeroWithSave';
import { IngredientList } from '@/components/recipes/IngredientList';
import { InstructionSteps } from '@/components/recipes/InstructionSteps';
import { RecipeRatingSection } from '@/components/recipes/RecipeRatingSection';
import { QuickRating } from '@/components/recipes/QuickRating';
import { RecipeGridWithSave } from '@/components/recipes/RecipeGridWithSave';
import { ShopifyProductCard } from '@/components/shop/ShopifyProductCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Lightbulb, Play } from 'lucide-react';
import { generateMetadata as generateSEOMetadata, generateRecipeStructuredData } from '@/lib/seo';
import { siteConfig } from '@/config/site';
import { getProducts, isShopifyConfigured } from '@/lib/shopify';
import type { Recipe, RecipeRating as RecipeRatingType } from '@/types';

interface RecipePageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface RecipeWithRatings extends Recipe {
  ratings: RecipeRatingType[];
}

async function getRecipe(slug: string): Promise<RecipeWithRatings | null> {
  const recipe = await prisma.recipe.findUnique({
    where: { slug, isPublished: true },
    include: {
      gameType: true,
      categories: {
        include: {
          category: true,
        },
      },
      ratings: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!recipe) return null;

  // Calculate average from ALL ratings (not just approved)
  const allRatings = recipe.ratings;
  const ratingCount = allRatings.length;
  const averageRating = ratingCount > 0
    ? Math.round((allRatings.reduce((sum, r) => sum + r.rating, 0) / ratingCount) * 10) / 10
    : 0;

  // Filter to only approved ratings for display
  const approvedRatings = allRatings.filter((r) => r.isApproved);

  const ratings: RecipeRatingType[] = approvedRatings.map((r) => ({
    id: r.id,
    recipeId: r.recipeId,
    userId: r.userId,
    rating: r.rating,
    reviewText: r.reviewText,
    isApproved: r.isApproved,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    user: r.user ? {
      id: r.user.id,
      firstName: r.user.firstName,
      lastName: r.user.lastName,
    } : undefined,
  }));

  return {
    id: recipe.id,
    title: recipe.title,
    slug: recipe.slug,
    description: recipe.description,
    featuredImageUrl: recipe.featuredImageUrl,
    galleryImages: (recipe.galleryImages as unknown as string[]) ?? [],
    gameTypeId: recipe.gameTypeId,
    prepTimeMinutes: recipe.prepTimeMinutes ?? 0,
    cookTimeMinutes: recipe.cookTimeMinutes ?? 0,
    totalTimeMinutes: recipe.totalTimeMinutes ?? 0,
    servings: recipe.servings ?? 0,
    ingredients: recipe.ingredients as unknown as Recipe['ingredients'],
    instructions: recipe.instructions as unknown as Recipe['instructions'],
    tips: recipe.tips,
    videoUrl: recipe.videoUrl,
    nutritionInfo: recipe.nutritionInfo as unknown as Recipe['nutritionInfo'],
    viewCount: recipe.viewCount,
    gameType: recipe.gameType ? {
      id: recipe.gameType.id,
      name: recipe.gameType.name,
      slug: recipe.gameType.slug,
    } : undefined,
    categories: recipe.categories.map((c) => ({
      id: c.category.id,
      name: c.category.name,
      slug: c.category.slug,
    })),
    averageRating,
    ratingCount,
    ratings,
    metaTitle: recipe.metaTitle,
    metaDescription: recipe.metaDescription,
    isFeatured: recipe.isFeatured,
    isPublished: recipe.isPublished,
    publishedAt: recipe.publishedAt,
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
  } as RecipeWithRatings;
}

async function getUserRating(recipeId: string, userId: string | undefined): Promise<RecipeRatingType | null> {
  if (!userId) return null;

  const rating = await prisma.recipeRating.findFirst({
    where: {
      recipeId,
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!rating) return null;

  return {
    id: rating.id,
    recipeId: rating.recipeId,
    userId: rating.userId,
    rating: rating.rating,
    reviewText: rating.reviewText,
    isApproved: rating.isApproved,
    createdAt: rating.createdAt,
    updatedAt: rating.updatedAt,
    user: rating.user ? {
      id: rating.user.id,
      firstName: rating.user.firstName,
      lastName: rating.user.lastName,
    } : undefined,
  };
}

async function getRelatedRecipes(recipeId: string, gameTypeId?: string): Promise<Recipe[]> {
  const recipes = await prisma.recipe.findMany({
    where: {
      isPublished: true,
      id: { not: recipeId },
      ...(gameTypeId && { gameTypeId }),
    },
    include: {
      gameType: true,
      ratings: {
        select: { rating: true },
      },
    },
    take: 4,
    orderBy: { publishedAt: 'desc' },
  });

  return recipes.map((recipe) => {
    // Calculate average from ALL ratings, rounded to 1 decimal
    const ratingCount = recipe.ratings.length;
    const averageRating = ratingCount > 0
      ? Math.round((recipe.ratings.reduce((sum, r) => sum + r.rating, 0) / ratingCount) * 10) / 10
      : 0;

    return {
      id: recipe.id,
      title: recipe.title,
      slug: recipe.slug,
      description: recipe.description,
      featuredImageUrl: recipe.featuredImageUrl,
      gameTypeId: recipe.gameTypeId,
      prepTimeMinutes: recipe.prepTimeMinutes ?? 0,
      cookTimeMinutes: recipe.cookTimeMinutes ?? 0,
      totalTimeMinutes: recipe.totalTimeMinutes ?? 0,
      servings: recipe.servings ?? 0,
      viewCount: recipe.viewCount,
      gameType: recipe.gameType ? {
        id: recipe.gameType.id,
        name: recipe.gameType.name,
        slug: recipe.gameType.slug,
      } : undefined,
      averageRating,
      ratingCount,
    };
  }) as Recipe[];
}


export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await getRecipe(slug);

  if (!recipe) {
    return {
      title: 'Recipe Not Found',
    };
  }

  const keywords = [
    recipe.title,
    recipe.gameType?.name || '',
    ...(recipe.categories?.map((cat) => cat.name) || []),
    'wild game recipe',
    'hunting recipe',
  ].filter(Boolean);

  return generateSEOMetadata({
    title: recipe.metaTitle || recipe.title,
    description: recipe.metaDescription || recipe.description,
    keywords,
    image: recipe.featuredImageUrl,
    canonical: `${siteConfig.url}/recipes/${slug}`,
    type: 'article',
  });
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { slug } = await params;
  const [recipe, session] = await Promise.all([
    getRecipe(slug),
    getServerSession(authOptions),
  ]);

  if (!recipe) {
    notFound();
  }

  const [relatedRecipes, featuredProducts, userRating] = await Promise.all([
    getRelatedRecipes(recipe.id, recipe.gameType?.id),
    isShopifyConfigured() ? getProducts({ query: 'tag:featured', first: 4 }).then(r => r.products) : Promise.resolve([]),
    getUserRating(recipe.id, session?.user?.id),
  ]);

  // Generate Recipe structured data
  const recipeUrl = `${siteConfig.url}/recipes/${slug}`;
  const recipeStructuredData = generateRecipeStructuredData(recipe as any, recipeUrl);

  return (
    <div className="min-h-screen bg-cream">
      {/* JSON-LD Structured Data */}
      <JsonLd data={recipeStructuredData as unknown as Record<string, unknown>} />

      {/* Recipe Hero */}
      <RecipeHeroWithSave recipe={recipe} />

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Recipe Content */}
          <div className="space-y-8">
            {/* Video Player */}
            {recipe.videoUrl && (
              <Card>
                <CardContent className="p-0">
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                    <div className="flex h-full items-center justify-center">
                      <Play className="h-16 w-16 text-white/50" />
                      <p className="sr-only">Video player placeholder</p>
                    </div>
                    {/* TODO: Implement actual video player */}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ingredients */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl text-[#4A3728]">
                  Ingredients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <IngredientList ingredients={recipe.ingredients} />
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl text-[#4A3728]">
                  Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <InstructionSteps instructions={recipe.instructions} />
              </CardContent>
            </Card>

            {/* Nutrition Information */}
            {recipe.nutritionInfo && (
              <Collapsible>
                <Card>
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="font-serif text-2xl text-[#4A3728]">
                        Nutrition Information
                      </CardTitle>
                      <ChevronDown className="h-5 w-5 text-slate transition-transform duration-200 ui-expanded:rotate-180" />
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {recipe.nutritionInfo.calories && (
                          <div>
                            <p className="text-sm text-slate">Calories</p>
                            <p className="font-semibold text-[#4A3728]">
                              {recipe.nutritionInfo.calories}
                            </p>
                          </div>
                        )}
                        {recipe.nutritionInfo.protein && (
                          <div>
                            <p className="text-sm text-slate">Protein</p>
                            <p className="font-semibold text-[#4A3728]">
                              {recipe.nutritionInfo.protein}g
                            </p>
                          </div>
                        )}
                        {recipe.nutritionInfo.carbohydrates && (
                          <div>
                            <p className="text-sm text-slate">Carbs</p>
                            <p className="font-semibold text-[#4A3728]">
                              {recipe.nutritionInfo.carbohydrates}g
                            </p>
                          </div>
                        )}
                        {recipe.nutritionInfo.fat && (
                          <div>
                            <p className="text-sm text-slate">Fat</p>
                            <p className="font-semibold text-[#4A3728]">
                              {recipe.nutritionInfo.fat}g
                            </p>
                          </div>
                        )}
                        {recipe.nutritionInfo.fiber && (
                          <div>
                            <p className="text-sm text-slate">Fiber</p>
                            <p className="font-semibold text-[#4A3728]">
                              {recipe.nutritionInfo.fiber}g
                            </p>
                          </div>
                        )}
                        {recipe.nutritionInfo.sodium && (
                          <div>
                            <p className="text-sm text-slate">Sodium</p>
                            <p className="font-semibold text-[#4A3728]">
                              {recipe.nutritionInfo.sodium}mg
                            </p>
                          </div>
                        )}
                      </div>
                      {recipe.nutritionInfo.servingSize && (
                        <p className="mt-4 text-sm text-slate">
                          Per serving: {recipe.nutritionInfo.servingSize}
                        </p>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )}

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl text-[#4A3728]">
                  Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RecipeRatingSection
                  recipeId={recipe.id}
                  recipeSlug={recipe.slug}
                  averageRating={recipe.averageRating || 0}
                  ratingCount={recipe.ratingCount || 0}
                  ratings={recipe.ratings}
                  userRating={userRating}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Rating Summary - Quick Rating */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-xl text-[#4A3728]">
                  Rate this Recipe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QuickRating
                  recipeSlug={recipe.slug}
                  averageRating={recipe.averageRating || 0}
                  ratingCount={recipe.ratingCount || 0}
                  userRating={userRating?.rating ?? null}
                />
              </CardContent>
            </Card>

            {/* Chef's Tips */}
            {recipe.tips && (
              <Card className="border-[#E07C24] bg-[#E07C24]/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-serif text-xl text-[#4A3728]">
                    <Lightbulb className="h-5 w-5 text-[#E07C24]" />
                    Chef's Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-[#333333] leading-relaxed text-sm">
                    {recipe.tips}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Featured Products */}
            {featuredProducts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-xl text-[#4A3728]">
                    Shop The Hunt Kitchen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {featuredProducts.slice(0, 4).map((product) => (
                      <ShopifyProductCard key={product.id} product={product} hideAddToCart />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </aside>
        </div>

        {/* Related Recipes */}
        {relatedRecipes.length > 0 && (
          <section className="mt-16">
            <div className="mb-8">
              <h2 className="font-serif text-3xl font-bold text-[#4A3728]">
                Related Recipes
              </h2>
              <p className="mt-2 text-lg text-slate">
                More {recipe.gameType?.name} recipes you might enjoy
              </p>
            </div>
            <RecipeGridWithSave recipes={relatedRecipes.slice(0, 4)} />
          </section>
        )}
      </div>
    </div>
  );
}
