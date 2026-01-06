import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { ProductFiltersClient } from '@/components/shop/ProductFiltersClient';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Search, ArrowRight } from 'lucide-react';
import type { Product, ProductCategory, PaginatedResponse, ProductFilters as ProductFiltersType } from '@/types';
import prisma from '@/lib/prisma';
import { getImageUrl } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Shop Wild Game Merchandise',
  description: 'Browse our collection of wild game cookbooks, apparel, and accessories.',
};

interface ShopPageProps {
  searchParams: Promise<{
    page?: string;
    sort?: string;
    search?: string;
  }>;
}

async function getProducts(filters: ProductFiltersType): Promise<PaginatedResponse<Product>> {
  const page = filters.page || 1;
  const limit = filters.limit || 12;
  const skip = (page - 1) * limit;

  // Build orderBy
  let orderBy: any = { createdAt: 'desc' };
  switch (filters.sortBy) {
    case 'price-asc':
      orderBy = { basePrice: 'asc' };
      break;
    case 'price-desc':
      orderBy = { basePrice: 'desc' };
      break;
    case 'name-asc':
      orderBy = { name: 'asc' };
      break;
    case 'name-desc':
      orderBy = { name: 'desc' };
      break;
  }

  // Build where clause
  const where: any = { isActive: true };
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: true,
        variants: { where: { isActive: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  const formattedProducts: Product[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    shortDescription: p.shortDescription,
    productType: p.productType as Product['productType'],
    categoryId: p.categoryId,
    category: p.category ? {
      id: p.category.id,
      name: p.category.name,
      slug: p.category.slug,
      description: p.category.description,
      imageUrl: p.category.imageUrl,
      parentId: p.category.parentId,
      displayOrder: p.category.displayOrder,
      isActive: p.category.isActive,
      createdAt: p.category.createdAt,
      updatedAt: p.category.updatedAt,
    } : undefined,
    basePrice: Number(p.basePrice),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    costPerItem: p.costPerItem ? Number(p.costPerItem) : null,
    sku: p.sku,
    barcode: p.barcode,
    trackInventory: p.trackInventory,
    weightOz: p.weightOz ? Number(p.weightOz) : null,
    featuredImageUrl: p.featuredImageUrl || '',
    galleryImages: (p.galleryImages as unknown as string[]) || [],
    isFeatured: p.isFeatured,
    isActive: p.isActive,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    variants: p.variants.map((v) => ({
      id: v.id,
      productId: v.productId,
      name: v.name,
      sku: v.sku,
      price: v.price ? Number(v.price) : null,
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
      option1Name: v.option1Name,
      option1Value: v.option1Value,
      option2Name: v.option2Name,
      option2Value: v.option2Value,
      option3Name: v.option3Name,
      option3Value: v.option3Value,
      imageUrl: v.imageUrl,
      inventoryQuantity: v.inventoryQty,
      weightOz: v.weightOz ? Number(v.weightOz) : null,
      isActive: v.isActive,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    })),
  }));

  return {
    data: formattedProducts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

async function getFeaturedProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    take: 4,
    include: {
      category: true,
      variants: { where: { isActive: true } },
    },
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    shortDescription: p.shortDescription,
    productType: p.productType as Product['productType'],
    categoryId: p.categoryId,
    category: p.category ? {
      id: p.category.id,
      name: p.category.name,
      slug: p.category.slug,
      description: p.category.description,
      imageUrl: p.category.imageUrl,
      parentId: p.category.parentId,
      displayOrder: p.category.displayOrder,
      isActive: p.category.isActive,
      createdAt: p.category.createdAt,
      updatedAt: p.category.updatedAt,
    } : undefined,
    basePrice: Number(p.basePrice),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    costPerItem: p.costPerItem ? Number(p.costPerItem) : null,
    sku: p.sku,
    barcode: p.barcode,
    trackInventory: p.trackInventory,
    weightOz: p.weightOz ? Number(p.weightOz) : null,
    featuredImageUrl: p.featuredImageUrl || '',
    galleryImages: (p.galleryImages as unknown as string[]) || [],
    isFeatured: p.isFeatured,
    isActive: p.isActive,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    variants: p.variants.map((v) => ({
      id: v.id,
      productId: v.productId,
      name: v.name,
      sku: v.sku,
      price: v.price ? Number(v.price) : null,
      compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
      option1Name: v.option1Name,
      option1Value: v.option1Value,
      option2Name: v.option2Name,
      option2Value: v.option2Value,
      option3Name: v.option3Name,
      option3Value: v.option3Value,
      imageUrl: v.imageUrl,
      inventoryQuantity: v.inventoryQty,
      weightOz: v.weightOz ? Number(v.weightOz) : null,
      isActive: v.isActive,
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    })),
  }));
}

async function getProductCategories(): Promise<ProductCategory[]> {
  const categories = await prisma.productCategory.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    imageUrl: c.imageUrl,
    parentId: c.parentId,
    displayOrder: c.displayOrder,
    isActive: c.isActive,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const sortBy = (params.sort as ProductFiltersType['sortBy']) || 'newest';
  const search = params.search || '';

  const filters: ProductFiltersType = {
    page,
    limit: 12,
    sortBy,
    search: search || undefined,
  };

  const { data: products, pagination } = await getProducts(filters);
  const featuredProducts = await getFeaturedProducts();
  const categories = await getProductCategories();

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Banner */}
      <section className="relative h-80 w-full overflow-hidden bg-[#2D5A3D]">
        <div className="absolute inset-0">
          <Image
            src="/images/shop-hero.jpg"
            alt="Shop merchandise"
            fill
            className="object-cover opacity-40"
            priority
          />
        </div>
        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-4 text-white">
            <h1 className="font-serif text-5xl font-bold leading-tight sm:text-6xl">
              Shop The Hunt Kitchen
            </h1>
            <p className="text-xl text-stone">
              Quality gear and merchandise for passionate hunters and cooks
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Shop</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Category Navigation Cards */}
        <section className="mb-12">
          <h2 className="mb-6 font-serif text-2xl font-bold text-[#4A3728]">
            Shop by Category
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/shop/category/${category.slug}`}
                className="group relative aspect-video overflow-hidden rounded-lg bg-stone shadow-sm transition-shadow hover:shadow-lg"
              >
                <Image
                  src={getImageUrl(category.imageUrl, 'category')}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="font-serif text-2xl font-bold text-white">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="mt-1 text-sm text-stone">{category.description}</p>
                  )}
                  <div className="mt-3 flex items-center text-sm text-white">
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-6 font-serif text-2xl font-bold text-[#4A3728]">
              Featured Products
            </h2>
            <ProductGrid products={featuredProducts} />
          </section>
        )}

        {/* All Products Section */}
        <section>
          <h2 className="mb-6 font-serif text-2xl font-bold text-[#4A3728]">
            All Products
          </h2>

          {/* Search and Sort Controls */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate" />
              <Input
                type="search"
                placeholder="Search products..."
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
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            {/* Filters Sidebar */}
            <aside className="space-y-6">
              <ProductFiltersClient />
            </aside>

            {/* Products Grid */}
            <div className="space-y-6">
              {products.length > 0 ? (
                <>
                  <div className="text-sm text-slate">
                    Showing {(pagination.page - 1) * pagination.limit + 1}-
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                    {pagination.total} products
                  </div>
                  <ProductGrid products={products} />

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          {pagination.page > 1 && (
                            <PaginationItem>
                              <PaginationPrevious href={`/shop?page=${pagination.page - 1}`} />
                            </PaginationItem>
                          )}

                          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                            .filter((pageNum) => {
                              return (
                                pageNum === 1 ||
                                pageNum === pagination.totalPages ||
                                Math.abs(pageNum - pagination.page) <= 1
                              );
                            })
                            .map((pageNum, idx, arr) => {
                              const prevPageNum = arr[idx - 1];
                              const showEllipsis = prevPageNum && pageNum - prevPageNum > 1;

                              return (
                                <div key={pageNum} className="flex">
                                  {showEllipsis && (
                                    <PaginationItem>
                                      <PaginationEllipsis />
                                    </PaginationItem>
                                  )}
                                  <PaginationItem>
                                    <PaginationLink
                                      href={`/shop?page=${pageNum}`}
                                      isActive={pageNum === pagination.page}
                                    >
                                      {pageNum}
                                    </PaginationLink>
                                  </PaginationItem>
                                </div>
                              );
                            })}

                          {pagination.page < pagination.totalPages && (
                            <PaginationItem>
                              <PaginationNext href={`/shop?page=${pagination.page + 1}`} />
                            </PaginationItem>
                          )}
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-lg border-2 border-dashed border-slate/30 bg-white p-12 text-center">
                  <h3 className="font-semibold text-lg text-[#4A3728]">
                    No products found
                  </h3>
                  <p className="mt-2 text-slate">
                    {search
                      ? 'Try adjusting your search or filters'
                      : 'Check back soon for new products'}
                  </p>
                  {search && (
                    <Button asChild variant="outline" className="mt-4">
                      <a href="/shop">Clear Search</a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
