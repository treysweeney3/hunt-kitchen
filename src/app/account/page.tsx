import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Settings,
  ArrowRight,
} from "lucide-react";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import prisma from "@/lib/prisma";

export default async function AccountDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const [savedRecipeRows, dbUser] = await Promise.all([
    prisma.savedRecipe.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        recipe: {
          select: {
            id: true,
            title: true,
            slug: true,
            featuredImageUrl: true,
          },
        },
      },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true },
    }),
  ]);

  const savedRecipes = savedRecipeRows.map((sr) => sr.recipe);

  const emailVerified = dbUser?.emailVerified ?? session.user.emailVerified;

  const quickLinks = [
    {
      title: "Saved Recipes",
      description: "Your favorite recipes",
      icon: Heart,
      href: "/account/saved-recipes",
      count: savedRecipes.length > 0 ? `${savedRecipes.length}+ saved` : "No recipes saved",
    },
    {
      title: "Settings",
      description: "Account preferences",
      icon: Settings,
      href: "/account/settings",
      count: "Update profile",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session.user.firstName || "Hunter"}!
        </h1>
        <p className="mt-2 text-gray-600">
          Manage your saved recipes and account settings.
        </p>
      </div>

      {!emailVerified && <EmailVerificationBanner />}

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-[#2D5A3D]/10">
                          <Icon className="h-5 w-5 text-[#2D5A3D]" />
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {link.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {link.description}
                      </p>
                      <p className="text-xs text-[#2D5A3D] font-medium">
                        {link.count}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Saved Recipes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Saved Recipes</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/account/saved-recipes">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {savedRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {savedRecipes.map((recipe) => (
                <Link
                  key={recipe.id}
                  href={`/recipes/${recipe.slug}`}
                  className="group"
                >
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-2">
                    <Image
                      src={recipe.featuredImageUrl || "/placeholder-recipe.jpg"}
                      alt={recipe.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-[#E07C24] transition-colors">
                    {recipe.title}
                  </h4>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No saved recipes yet
              </h3>
              <p className="text-gray-600 mb-4">
                Browse recipes and save your favorites.
              </p>
              <Button asChild className="bg-[#2D5A3D] hover:bg-[#234a30]">
                <Link href="/recipes">Browse Recipes</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
