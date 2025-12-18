import prisma from "@/lib/prisma";
import { ProductEditor } from "@/components/admin/ProductEditor";

async function getCategories() {
  const categories = await prisma.productCategory.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return categories;
}

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Create Product</h2>
        <p className="text-muted-foreground">
          Add a new product to your store
        </p>
      </div>

      <ProductEditor categories={categories} />
    </div>
  );
}
