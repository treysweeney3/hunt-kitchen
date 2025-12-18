import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { RecipeEditor } from "@/components/admin/RecipeEditor";

async function getRecipe(id: string) {
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: {
      categories: {
        select: {
          categoryId: true,
        },
      },
    },
  });

  if (!recipe) {
    return null;
  }

  // Convert Prisma null values to undefined for RecipeFormValues compatibility
  return {
    id: recipe.id,
    title: recipe.title,
    slug: recipe.slug,
    description: recipe.description,
    featuredImageUrl: recipe.featuredImageUrl ?? undefined,
    gameTypeId: recipe.gameTypeId,
    categoryIds: recipe.categories.map((c) => c.categoryId),
    prepTimeMinutes: recipe.prepTimeMinutes ?? undefined,
    cookTimeMinutes: recipe.cookTimeMinutes ?? undefined,
    servings: recipe.servings ?? undefined,
    ingredients: recipe.ingredients as { amount: string; unit: string; ingredient: string; notes?: string }[],
    instructions: recipe.instructions as { step: string; imageUrl?: string }[],
    tips: recipe.tips ?? undefined,
    videoUrl: recipe.videoUrl ?? undefined,
    metaTitle: recipe.metaTitle ?? undefined,
    metaDescription: recipe.metaDescription ?? undefined,
    isFeatured: recipe.isFeatured,
    isPublished: recipe.isPublished,
  };
}

async function getFormData() {
  const [gameTypes, categories] = await Promise.all([
    prisma.gameType.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.recipeCategory.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return { gameTypes, categories };
}

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [recipe, { gameTypes, categories }] = await Promise.all([
    getRecipe(id),
    getFormData(),
  ]);

  if (!recipe) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Edit Recipe</h2>
        <p className="text-muted-foreground">
          Update recipe information
        </p>
      </div>

      <RecipeEditor
        recipe={recipe}
        gameTypes={gameTypes}
        categories={categories}
      />
    </div>
  );
}
