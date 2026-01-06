import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { RecipeHero } from '@/components/recipes/RecipeHero';
import { IngredientList } from '@/components/recipes/IngredientList';
import { InstructionSteps } from '@/components/recipes/InstructionSteps';
import { RecipeRating } from '@/components/recipes/RecipeRating';
import { RecipeGrid } from '@/components/recipes/RecipeGrid';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, Lightbulb, Play } from 'lucide-react';
import { generateMetadata as generateSEOMetadata, generateRecipeStructuredData } from '@/lib/seo';
import { siteConfig } from '@/config/site';
import type { Recipe, Product } from '@/types';

interface RecipePageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getRecipe(slug: string): Promise<Recipe | null> {
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
        where: { isApproved: true },
        select: { rating: true },
      },
    },
  });

  if (!recipe) return null;

  // Calculate average rating
  const ratingCount = recipe.ratings.length;
  const averageRating = ratingCount > 0
    ? recipe.ratings.reduce((sum, r) => sum + r.rating, 0) / ratingCount
    : 0;

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
    metaTitle: recipe.metaTitle,
    metaDescription: recipe.metaDescription,
    isFeatured: recipe.isFeatured,
    isPublished: recipe.isPublished,
    publishedAt: recipe.publishedAt,
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
  } as Recipe;
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
        where: { isApproved: true },
        select: { rating: true },
      },
    },
    take: 4,
    orderBy: { publishedAt: 'desc' },
  });

  return recipes.map((recipe) => {
    const ratingCount = recipe.ratings.length;
    const averageRating = ratingCount > 0
      ? recipe.ratings.reduce((sum, r) => sum + r.rating, 0) / ratingCount
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

async function getRelatedProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    take: 3,
    orderBy: { createdAt: 'desc' },
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    featuredImageUrl: product.featuredImageUrl,
    basePrice: Number(product.basePrice),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
  })) as Product[];
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
  const recipe = await getRecipe(slug);

  if (!recipe) {
    notFound();
  }

  const relatedRecipes = await getRelatedRecipes(recipe.id, recipe.gameType?.id);
  const relatedProducts = await getRelatedProducts();

  // Generate Recipe structured data
  const recipeUrl = `${siteConfig.url}/recipes/${slug}`;
  const recipeStructuredData = generateRecipeStructuredData(recipe as any, recipeUrl);

  // Build breadcrumb items
  const breadcrumbItems = [
    { name: 'Recipes', href: '/recipes' },
    ...(recipe.gameType ? [{ name: recipe.gameType.name, href: `/recipes/game/${recipe.gameType.slug}` }] : []),
    { name: recipe.title },
  ];

  return (
    <div className="min-h-screen bg-cream">
      {/* JSON-LD Structured Data */}
      <JsonLd data={recipeStructuredData as unknown as Record<string, unknown>} />

      {/* Recipe Hero */}
      <RecipeHero recipe={recipe} />

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumbs with Structured Data */}
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />

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

            {/* Chef's Tips */}
            {recipe.tips && (
              <Card className="border-[#E07C24] bg-[#E07C24]/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-serif text-2xl text-[#4A3728]">
                    <Lightbulb className="h-6 w-6 text-[#E07C24]" />
                    Chef's Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-[#333333] leading-relaxed">
                    {recipe.tips}
                  </p>
                </CardContent>
              </Card>
            )}

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

            {/* Rating and Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl text-[#4A3728]">
                  Ratings & Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RecipeRating
                  recipeId={recipe.id}
                  averageRating={recipe.averageRating || 0}
                  ratingCount={recipe.ratingCount || 0}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif text-xl text-[#4A3728]">
                    You Might Also Like
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {relatedProducts.slice(0, 3).map((product) => (
                      <div key={product.id}>
                        {/* Product preview - simplified version */}
                        <p className="text-sm">{product.name}</p>
                        <Separator className="mt-4" />
                      </div>
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
            <RecipeGrid recipes={relatedRecipes.slice(0, 4)} />
          </section>
        )}
      </div>
    </div>
  );
}
