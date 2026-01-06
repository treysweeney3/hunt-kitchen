import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChefHat, ShoppingBag, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecipeGrid } from '@/components/recipes/RecipeGrid';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { NewsletterForm } from '@/components/shared/NewsletterForm';
import prisma from '@/lib/prisma';
import type { Recipe, Product, GameType } from '@/types';

async function getFeaturedRecipes(): Promise<Recipe[]> {
  const recipes = await prisma.recipe.findMany({
    where: { isPublished: true, isFeatured: true },
    include: { gameType: true },
    take: 4,
    orderBy: { publishedAt: 'desc' },
  });

  return recipes.map((recipe) => ({
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
  })) as Recipe[];
}

async function getFeaturedProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    take: 4,
    orderBy: { createdAt: 'desc' },
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    featuredImageUrl: product.featuredImageUrl,
    basePrice: Number(product.basePrice),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
  })) as Product[];
}

async function getGameTypes(): Promise<GameType[]> {
  return [
    {
      id: '1',
      name: 'Venison',
      slug: 'venison',
      description: 'Delicious deer recipes',
      imageUrl: '/images/game-types/venison.jpg',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Elk',
      slug: 'elk',
      description: 'Hearty elk dishes',
      imageUrl: '/images/game-types/elk.jpg',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      name: 'Wild Boar',
      slug: 'wild-boar',
      description: 'Savory wild boar meals',
      imageUrl: '/images/game-types/wild-boar.jpg',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '4',
      name: 'Duck',
      slug: 'duck',
      description: 'Waterfowl recipes',
      imageUrl: '/images/game-types/duck.jpg',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '5',
      name: 'Wild Turkey',
      slug: 'wild-turkey',
      description: 'Traditional turkey dishes',
      imageUrl: '/images/game-types/turkey.jpg',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '6',
      name: 'Rabbit',
      slug: 'rabbit',
      description: 'Tender rabbit recipes',
      imageUrl: '/images/game-types/rabbit.jpg',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
}

export default async function HomePage() {
  const featuredRecipes = await getFeaturedRecipes();
  const featuredProducts = await getFeaturedProducts();
  const gameTypes = await getGameTypes();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[600px] w-full overflow-hidden bg-gradient-to-br from-[#2D5A3D] via-[#3d6b4d] to-[#4A3728]">
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zM22.344 0L13.858 8.485 15.272 9.9l9.9-9.9h-2.828zM32 0l-3.657 3.657 1.414 1.414L searching 0H32zM0 5.373l.828-.83 1.415 1.415L0 8.2V5.374zm0 5.656l.828-.829 1.415 1.415L0 13.857v-2.83zm0 5.656l.828-.828 1.415 1.414L0 19.514v-2.83zm0 5.657l.828-.828 1.415 1.414L0 25.172v-2.83zM0 32l3.657-3.657 1.414 1.414L0 34.828V32zm60-28.627l-.828.83-1.415-1.415L60 0v2.373zm0 5.656l-.828.83-1.415-1.415L60 5.373v2.656zm0 5.657l-.828.828-1.415-1.414L60 11.03v2.656zm0 5.657l-.828.828-1.415-1.414L60 16.686v2.657zM60 32l-3.657-3.657-1.414 1.414L60 34.828V32z\' fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }} />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-6 text-white">
            <h1 className="font-serif text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl">
              From Field to Fork
            </h1>
            <p className="text-xl sm:text-2xl text-stone">
              Master the art of wild game cooking with expert recipes, techniques, and tips from The Hunt Kitchen.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-[#E07C24] text-white hover:bg-[#E07C24]/90"
              >
                <Link href="/recipes">
                  Explore Recipes
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
              >
                <Link href="/shop">Visit Shop</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Recipes Section */}
      <section className="bg-cream py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#4A3728] sm:text-4xl">
                Featured Recipes
              </h2>
              <p className="mt-2 text-lg text-slate">
                Try our most popular wild game dishes
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/recipes">
                View All Recipes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {featuredRecipes.length > 0 ? (
            <RecipeGrid recipes={featuredRecipes} />
          ) : (
            <div className="rounded-lg border-2 border-dashed border-slate/30 bg-white/50 p-12 text-center">
              <ChefHat className="mx-auto h-12 w-12 text-slate/50" />
              <h3 className="mt-4 font-semibold text-lg text-[#4A3728]">
                No featured recipes yet
              </h3>
              <p className="mt-2 text-slate">
                Check back soon for delicious wild game recipes
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Browse by Game Type Section */}
      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="font-serif text-3xl font-bold text-[#4A3728] sm:text-4xl">
              Browse by Game Type
            </h2>
            <p className="mt-2 text-lg text-slate">
              Find recipes for your favorite wild game
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-6">
            {gameTypes.map((gameType) => (
              <Link
                key={gameType.id}
                href={`/recipes/game/${gameType.slug}`}
                className="group relative aspect-square overflow-hidden rounded-lg bg-stone shadow-sm transition-shadow hover:shadow-lg"
              >
                {gameType.imageUrl && (
                  <Image
                    src={gameType.imageUrl}
                    alt={gameType.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                  <h3 className="font-semibold text-white text-sm sm:text-base">
                    {gameType.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="bg-stone py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#4A3728] sm:text-4xl">
                Featured Products
              </h2>
              <p className="mt-2 text-lg text-slate">
                Gear up with our exclusive merchandise
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/shop">
                Shop All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          {featuredProducts.length > 0 ? (
            <ProductGrid products={featuredProducts} />
          ) : (
            <div className="rounded-lg border-2 border-dashed border-slate/30 bg-white/50 p-12 text-center">
              <ShoppingBag className="mx-auto h-12 w-12 text-slate/50" />
              <h3 className="mt-4 font-semibold text-lg text-[#4A3728]">
                No featured products yet
              </h3>
              <p className="mt-2 text-slate">
                Check back soon for exclusive merchandise
              </p>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="bg-cream py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src="/images/about-preview.jpg"
                alt="About The Hunt Kitchen"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="font-serif text-3xl font-bold text-[#4A3728] sm:text-4xl">
                About The Hunt Kitchen
              </h2>
              <p className="mt-6 text-lg text-[#333333] leading-relaxed">
                We're passionate hunters who believe that the harvest is just
                the beginning. At The Hunt Kitchen, we transform wild game into
                extraordinary meals that honor the animal and celebrate the
                hunting tradition.
              </p>
              <p className="mt-4 text-lg text-[#333333] leading-relaxed">
                From field to fork, we'll guide you through every step of
                preparing wild game with recipes that range from traditional
                favorites to innovative culinary creations.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild size="lg">
                  <Link href="/about" className="bg-[#2D5A3D] hover:bg-[#234a30]">
                    Our Story
                    <BookOpen className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/contact">Get in Touch</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-[#2D5A3D] py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
              Join The Hunt Kitchen Community
            </h2>
            <p className="mt-4 text-lg text-stone">
              Get weekly recipes, cooking tips, and exclusive offers delivered
              straight to your inbox.
            </p>
            <div className="mt-8 flex justify-center">
              <NewsletterForm />
            </div>
            <p className="mt-4 text-sm text-stone">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
