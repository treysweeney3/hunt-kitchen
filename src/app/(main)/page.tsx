import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChefHat, ShoppingBag, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecipeGridWithSave } from '@/components/recipes/RecipeGridWithSave';
import { ShopifyProductGrid } from '@/components/shop/ShopifyProductGrid';
import { NewsletterForm } from '@/components/shared/NewsletterForm';
import { GameTypeCarousel } from '@/components/shared/GameTypeCarousel';
import { TikTokGrid } from '@/components/content/TikTokEmbed';
import { siteConfig } from '@/config/site';
import prisma from '@/lib/prisma';
import { getProductsByHandles, isShopifyConfigured } from '@/lib/shopify';
import { getSiteContent } from '@/lib/site-content';
import type { Recipe } from '@/types';

// TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

async function getFeaturedRecipes(): Promise<Recipe[]> {
  const recipes = await prisma.recipe.findMany({
    where: { isPublished: true, isFeatured: true },
    include: {
      gameType: true,
      ratings: {
        select: { rating: true },
      },
    },
    take: 4,
    orderBy: [{ displayOrder: 'asc' }, { publishedAt: 'desc' }],
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

// Featured product handles for the landing page
const FEATURED_PRODUCT_HANDLES = [
  "cookbook-venison-edition",
  "tshirt", // The Hunt Kitchen Mossy Oak Hat
  "full-logo-t-shirt",
  "logo-hoodie",
];

export default async function HomePage() {
  const [featuredRecipes, featuredProducts, tiktokVideos] = await Promise.all([
    getFeaturedRecipes(),
    isShopifyConfigured() ? getProductsByHandles(FEATURED_PRODUCT_HANDLES) : Promise.resolve([]),
    getSiteContent('homepage_tiktok_videos'),
  ]);

  return (
    <div className="flex flex-col">
      {/* Hero Section - Special accent section */}
      <section className="relative min-h-[80vh] w-full overflow-hidden">
        <Image
          src="/images/hero-background.jpeg"
          alt=""
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-forestGreen/80" />
        <div className="relative z-10 mx-auto flex min-h-[80vh] max-w-7xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-8 text-center text-white">
            <div className="flex justify-center">
              <Image
                src="/images/logo-white.png"
                alt="The Hunt Kitchen"
                width={280}
                height={100}
                className="h-auto w-auto max-w-[320px]"
                priority
              />
            </div>
            <h1 className="font-serif text-5xl font-bold leading-tight sm:text-6xl lg:text-6xl">
              Hunt Hard | Eat Better
            </h1>
            <p className="mx-auto max-w-2xl text-xl sm:text-2xl text-white/90">
              Master the art of wild game cooking with recipes, techniques, and tips from The Hunt Kitchen.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-hunterOrange text-white hover:bg-hunterOrange/90"
              >
                <Link href="/shop">
                  Shop
                  <ShoppingBag className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-forestGreen"
              >
                <Link href="/content">Content</Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-forestGreen"
              >
                <Link href="/recipes">Recipes</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - Cream background */}
      <section className="bg-cream py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="relative aspect-[4/3] overflow-hidden">
              <GameTypeCarousel />
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="font-serif text-3xl font-bold text-forestGreen sm:text-4xl">
                About The Hunt Kitchen
              </h2>
              <p className="mt-6 text-lg text-slate leading-relaxed">
                We're passionate hunters who believe that the harvest is just
                the beginning. At The Hunt Kitchen, we transform wild game into
                extraordinary meals that honor the animal and celebrate the
                hunting tradition.
              </p>
              <p className="mt-4 text-lg text-slate leading-relaxed">
                From field to fork, we'll guide you through every step of
                preparing wild game with recipes that range from traditional
                favorites to innovative culinary creations.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-hunterOrange text-white hover:bg-hunterOrange/90"
                >
                  <Link href="/about">
                    Our Story
                    <BookOpen className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="border-2 border-forestGreen bg-transparent text-forestGreen hover:bg-forestGreen hover:text-white"
                >
                  <Link href="/contact">Get in Touch</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section - White background */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <h2 className="font-serif text-3xl font-bold text-forestGreen sm:text-4xl">
                Featured Products
              </h2>
              <p className="mt-2 text-lg text-slate">
                Gear up with our exclusive merchandise
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="border-2 border-forestGreen bg-transparent text-forestGreen hover:bg-forestGreen hover:text-white"
            >
              <Link href="/shop">
                Shop All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {featuredProducts.length > 0 ? (
            <ShopifyProductGrid products={featuredProducts} />
          ) : (
            <div className="rounded-lg border-2 border-dashed border-slate/30 bg-cream/50 p-12 text-center">
              <ShoppingBag className="mx-auto h-12 w-12 text-slate/50" />
              <h3 className="mt-4 font-semibold text-lg text-forestGreen">
                No featured products yet
              </h3>
              <p className="mt-2 text-slate">
                Check back soon for exclusive merchandise
              </p>
            </div>
          )}
        </div>
      </section>

      {/* TikTok Content Section - Cream background */}
      <section className="bg-cream py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-forestGreen p-2">
                <TikTokIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-serif text-3xl font-bold text-forestGreen sm:text-4xl">
                  Latest Content
                </h2>
                <p className="mt-1 text-lg text-slate">
                  Quick tips and cooking inspiration
                </p>
              </div>
            </div>
            <Button
              asChild
              size="lg"
              className="border-2 border-forestGreen bg-transparent text-forestGreen hover:bg-forestGreen hover:text-white"
            >
              <Link href="/content">
                View All Content
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <TikTokGrid videos={tiktokVideos} />
          <div className="mt-8 text-center">
            <Button
              asChild
              className="bg-hunterOrange text-white hover:bg-hunterOrange/90"
            >
              <a
                href={siteConfig.links.tiktok}
                target="_blank"
                rel="noopener noreferrer"
              >
                <TikTokIcon className="mr-2 h-4 w-4" />
                Follow on TikTok
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Recipes Section - White background */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <h2 className="font-serif text-3xl font-bold text-forestGreen sm:text-4xl">
                Featured Recipes
              </h2>
              <p className="mt-2 text-lg text-slate">
                Try our most popular wild game dishes
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="border-2 border-forestGreen bg-transparent text-forestGreen hover:bg-forestGreen hover:text-white"
            >
              <Link href="/recipes">
                View All Recipes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {featuredRecipes.length > 0 ? (
            <RecipeGridWithSave recipes={featuredRecipes} />
          ) : (
            <div className="rounded-lg border-2 border-dashed border-slate/30 bg-cream/50 p-12 text-center">
              <ChefHat className="mx-auto h-12 w-12 text-slate/50" />
              <h3 className="mt-4 font-semibold text-lg text-forestGreen">
                No featured recipes yet
              </h3>
              <p className="mt-2 text-slate">
                Check back soon for delicious wild game recipes
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section - Special accent section */}
      <section className="bg-forestGreen py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
              Join The Hunt Kitchen Community
            </h2>
            <p className="mt-4 text-lg text-white/80">
              Get weekly recipes, cooking tips, and exclusive offers delivered
              straight to your inbox.
            </p>
            <div className="mt-8 flex justify-center">
              <NewsletterForm />
            </div>
            <p className="mt-4 text-sm text-white/70">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
