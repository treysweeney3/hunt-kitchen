import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { RecipeGridWithSave } from '@/components/recipes/RecipeGridWithSave';
import { RecipeFiltersClient } from '@/components/recipes/RecipeFiltersClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Search } from 'lucide-react';
import type { Recipe, RecipeCategory, PaginatedResponse, RecipeFilters as RecipeFiltersType } from '@/types';

interface CategoryRecipesPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
    sort?: string;
    search?: string;
  }>;
}

async function getCategory(slug: string): Promise<RecipeCategory | null> {
  // TODO: Implement actual API call
  return null;
}

async function getRecipesByCategory(
  categoryId: string,
  filters: RecipeFiltersType
): Promise<PaginatedResponse<Recipe>> {
  // TODO: Implement actual API call
  return {
    data: [],
    pagination: {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0,
      hasMore: false,
    },
  };
}

export async function generateMetadata({ params }: CategoryRecipesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} Recipes`,
    description: category.description || `Browse our collection of ${category.name.toLowerCase()} wild game recipes.`,
  };
}

export default async function CategoryRecipesPage({ params, searchParams }: CategoryRecipesPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const page = parseInt(resolvedSearchParams.page || '1');
  const sortBy = (resolvedSearchParams.sort as RecipeFiltersType['sortBy']) || 'newest';
  const search = resolvedSearchParams.search || '';

  const filters: RecipeFiltersType = {
    page,
    limit: 12,
    sortBy,
    search: search || undefined,
    categoryIds: [category.id],
  };

  const { data: recipes, pagination } = await getRecipesByCategory(category.id, filters);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header with Image */}
      {category.imageUrl && (
        <div className="relative h-64 w-full overflow-hidden bg-[#2D5A3D]">
          <Image
            src={category.imageUrl}
            alt={category.name}
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="relative z-10 flex h-full items-end">
            <div className="container mx-auto px-4 pb-8 sm:px-6 lg:px-8">
              <h1 className="font-serif text-4xl font-bold text-white sm:text-5xl">
                {category.name}
              </h1>
              {category.description && (
                <p className="mt-2 text-lg text-stone">{category.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
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
              <SelectTrigger className="w-[180px] bg-white">
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
                  Showing {(pagination.page - 1) * pagination.limit + 1}-
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} recipes
                </div>
                <RecipeGridWithSave recipes={recipes} />

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        {pagination.page > 1 && (
                          <PaginationItem>
                            <PaginationPrevious
                              href={`/recipes/category/${slug}?page=${pagination.page - 1}`}
                            />
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
                                    href={`/recipes/category/${slug}?page=${pageNum}`}
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
                            <PaginationNext
                              href={`/recipes/category/${slug}?page=${pagination.page + 1}`}
                            />
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
                  No recipes found
                </h3>
                <p className="mt-2 text-slate">
                  {search
                    ? 'Try adjusting your search or filters'
                    : `Check back soon for ${category.name.toLowerCase()} recipes`}
                </p>
                {search && (
                  <Button asChild variant="outline" className="mt-4">
                    <a href={`/recipes/category/${slug}`}>Clear Search</a>
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
