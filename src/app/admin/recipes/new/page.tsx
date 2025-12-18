import prisma from "@/lib/prisma";
import { RecipeEditor } from "@/components/admin/RecipeEditor";

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

export default async function NewRecipePage() {
  const { gameTypes, categories } = await getFormData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Create Recipe</h2>
        <p className="text-muted-foreground">
          Add a new recipe to your collection
        </p>
      </div>

      <RecipeEditor gameTypes={gameTypes} categories={categories} />
    </div>
  );
}
