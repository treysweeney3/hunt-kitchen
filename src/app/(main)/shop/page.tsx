import type { Metadata } from "next";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { ShopifyProductGrid } from "@/components/shop/ShopifyProductGrid";
import { ShopFilters } from "@/components/shop/ShopFilters";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  getProducts,
  mapSortOption,
  buildSearchQuery,
  isShopifyConfigured,
} from "@/lib/shopify";
import type { NormalizedShopifyProduct } from "@/types/shopify";

export const metadata: Metadata = {
  title: "Shop Wild Game Merchandise",
  description:
    "Browse our collection of wild game cookbooks, apparel, and accessories.",
};

interface ShopPageProps {
  searchParams: Promise<{
    page?: string;
    sort?: string;
    search?: string;
  }>;
}

const PRODUCTS_PER_PAGE = 12;

async function getShopifyProducts(params: {
  page: number;
  sort: string;
  search: string;
}): Promise<{
  products: NormalizedShopifyProduct[];
  totalCount: number;
  hasNextPage: boolean;
}> {
  console.log("[Shop] isShopifyConfigured:", isShopifyConfigured());
  console.log("[Shop] SHOPIFY_STORE_DOMAIN:", process.env.SHOPIFY_STORE_DOMAIN);
  console.log("[Shop] SHOPIFY_STOREFRONT_ACCESS_TOKEN exists:", !!process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN);

  if (!isShopifyConfigured()) {
    console.log("[Shop] Shopify not configured, returning empty");
    return { products: [], totalCount: 0, hasNextPage: false };
  }

  try {
    const { sortKey, reverse } = mapSortOption(params.sort);
    // Temporarily remove available filter to debug
    const query = buildSearchQuery({
      search: params.search || undefined,
      // available: true,  // Commented out for debugging
    });
    console.log("[Shop] Query:", query, "SortKey:", sortKey, "Reverse:", reverse);

    // Shopify's cursor-based pagination requires fetching all previous pages
    // For simplicity, we fetch more products and slice for the current page
    // A more robust solution would cache cursors or use infinite scroll
    const { products, pageInfo } = await getProducts({
      first: PRODUCTS_PER_PAGE * params.page,
      sortKey,
      reverse,
      query,
    });

    // Slice products for the current page
    const startIndex = (params.page - 1) * PRODUCTS_PER_PAGE;
    const pageProducts = products.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);

    console.log("[Shop] Fetched", products.length, "products from Shopify");
    return {
      products: pageProducts,
      totalCount: products.length,
      hasNextPage: pageInfo.hasNextPage || products.length > params.page * PRODUCTS_PER_PAGE,
    };
  } catch (error) {
    console.error("[Shop] Failed to fetch Shopify products:", error);
    return { products: [], totalCount: 0, hasNextPage: false };
  }
}

function buildPaginationUrl(page: number, searchParams: URLSearchParams): string {
  const params = new URLSearchParams(searchParams.toString());
  if (page > 1) {
    params.set("page", page.toString());
  } else {
    params.delete("page");
  }
  const queryString = params.toString();
  return `/shop${queryString ? `?${queryString}` : ""}`;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const sort = params.sort || "newest";
  const search = params.search || "";

  const { products, totalCount, hasNextPage } = await getShopifyProducts({
    page,
    sort,
    search,
  });

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE) || 1;
  const showingStart = totalCount > 0 ? (page - 1) * PRODUCTS_PER_PAGE + 1 : 0;
  const showingEnd = Math.min(page * PRODUCTS_PER_PAGE, totalCount);

  // Build search params for pagination links
  const currentSearchParams = new URLSearchParams();
  if (sort && sort !== "newest") currentSearchParams.set("sort", sort);
  if (search) currentSearchParams.set("search", search);

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="bg-forestGreen py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="font-serif text-5xl font-bold leading-tight sm:text-6xl">
              Shop The Hunt Kitchen
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-white/80">
              Quality gear and merchandise for passionate hunters and cooks
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* All Products Section */}
        <section>
          <h2 className="mb-6 font-serif text-2xl font-bold text-[#4A3728]">
            All Products
          </h2>

          {/* Search and Sort Controls */}
          <Suspense
            fallback={
              <div className="mb-6 flex h-10 animate-pulse gap-4 bg-stone/20" />
            }
          >
            <ShopFilters className="mb-6" />
          </Suspense>

          {/* Products Grid */}
          <div className="space-y-6">
            {!isShopifyConfigured() ? (
              <div className="rounded-lg border-2 border-dashed border-amber-500/30 bg-amber-50 p-12 text-center">
                <h3 className="text-lg font-semibold text-amber-800">
                  Shop Coming Soon
                </h3>
                <p className="mt-2 text-amber-700">
                  Our online store is being set up. Check back soon for great
                  products!
                </p>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="text-sm text-slate">
                  Showing {showingStart}-{showingEnd} of {totalCount} products
                </div>
                <ShopifyProductGrid products={products} />

                {/* Pagination */}
                {(totalPages > 1 || hasNextPage) && (
                  <div className="mt-8 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        {page > 1 && (
                          <PaginationItem>
                            <PaginationPrevious
                              href={buildPaginationUrl(page - 1, currentSearchParams)}
                            />
                          </PaginationItem>
                        )}

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter((pageNum) => {
                            return (
                              pageNum === 1 ||
                              pageNum === totalPages ||
                              Math.abs(pageNum - page) <= 1
                            );
                          })
                          .map((pageNum, idx, arr) => {
                            const prevPageNum = arr[idx - 1];
                            const showEllipsis =
                              prevPageNum && pageNum - prevPageNum > 1;

                            return (
                              <div key={pageNum} className="flex">
                                {showEllipsis && (
                                  <PaginationItem>
                                    <PaginationEllipsis />
                                  </PaginationItem>
                                )}
                                <PaginationItem>
                                  <PaginationLink
                                    href={buildPaginationUrl(
                                      pageNum,
                                      currentSearchParams
                                    )}
                                    isActive={pageNum === page}
                                  >
                                    {pageNum}
                                  </PaginationLink>
                                </PaginationItem>
                              </div>
                            );
                          })}

                        {(page < totalPages || hasNextPage) && (
                          <PaginationItem>
                            <PaginationNext
                              href={buildPaginationUrl(page + 1, currentSearchParams)}
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
                <h3 className="text-lg font-semibold text-[#4A3728]">
                  No products found
                </h3>
                <p className="mt-2 text-slate">
                  {search
                    ? "Try adjusting your search or filters"
                    : "Check back soon for new products"}
                </p>
                {search && (
                  <Button asChild variant="outline" className="mt-4">
                    <a href="/shop">Clear Search</a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
