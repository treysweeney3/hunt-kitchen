import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ProductEditor } from "@/components/admin/ProductEditor";

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: true,
    },
  });

  if (!product) {
    return null;
  }

  // Convert Prisma null values to undefined for ProductFormValues compatibility
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription: product.shortDescription ?? undefined,
    productType: product.productType as "PHYSICAL" | "DIGITAL",
    categoryId: product.categoryId,
    basePrice: Number(product.basePrice),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
    costPerItem: product.costPerItem ? Number(product.costPerItem) : undefined,
    sku: product.sku ?? undefined,
    barcode: product.barcode ?? undefined,
    trackInventory: product.trackInventory,
    weightOz: product.weightOz ? Number(product.weightOz) : undefined,
    metaTitle: product.metaTitle ?? undefined,
    metaDescription: product.metaDescription ?? undefined,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    variants: product.variants.map((v) => ({
      name: v.name,
      sku: v.sku ?? undefined,
      price: v.price ? Number(v.price) : undefined,
      option1Name: v.option1Name ?? undefined,
      option1Value: v.option1Value ?? undefined,
      option2Name: v.option2Name ?? undefined,
      option2Value: v.option2Value ?? undefined,
      inventoryQty: v.inventoryQty,
      isActive: v.isActive,
    })),
  };
}

async function getCategories() {
  const categories = await prisma.productCategory.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return categories;
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProduct(id),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
        <p className="text-muted-foreground">
          Update product information
        </p>
      </div>

      <ProductEditor product={product} categories={categories} />
    </div>
  );
}
