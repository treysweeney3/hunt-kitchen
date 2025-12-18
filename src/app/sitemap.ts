import { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/recipes`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  try {
    // Fetch all published recipes
    const recipes = await prisma.recipe.findMany({
      where: {
        isPublished: true,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const recipePages: MetadataRoute.Sitemap = recipes.map((recipe) => ({
      url: `${baseUrl}/recipes/${recipe.slug}`,
      lastModified: recipe.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // Fetch all recipe categories
    const recipeCategories = await prisma.recipeCategory.findMany({
      where: {
        isActive: true,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    const recipeCategoryPages: MetadataRoute.Sitemap = recipeCategories.map((category) => ({
      url: `${baseUrl}/recipes/category/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    // Fetch all game types
    const gameTypes = await prisma.gameType.findMany({
      where: {
        isActive: true,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    const gameTypePages: MetadataRoute.Sitemap = gameTypes.map((gameType) => ({
      url: `${baseUrl}/recipes/game/${gameType.slug}`,
      lastModified: gameType.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    // Fetch all active products
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const productPages: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/shop/product/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // Fetch all product categories
    const productCategories = await prisma.productCategory.findMany({
      where: {
        isActive: true,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    const productCategoryPages: MetadataRoute.Sitemap = productCategories.map((category) => ({
      url: `${baseUrl}/shop/category/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [
      ...staticPages,
      ...recipePages,
      ...recipeCategoryPages,
      ...gameTypePages,
      ...productPages,
      ...productCategoryPages,
    ];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return static pages if database query fails
    return staticPages;
  }
}
