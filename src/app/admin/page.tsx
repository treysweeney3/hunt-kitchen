import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  BookOpen,
  Eye,
  Film,
  FolderTree,
  BarChart3,
  Target,
} from "lucide-react";
import prisma from "@/lib/prisma";

async function getDashboardData() {
  const [
    totalRecipes,
    publishedRecipes,
    totalGameTypes,
    totalCategories,
  ] = await Promise.all([
    prisma.recipe.count(),
    prisma.recipe.count({
      where: { isPublished: true },
    }),
    prisma.gameType.count(),
    prisma.recipeCategory.count(),
  ]);

  return {
    totalRecipes,
    publishedRecipes,
    totalGameTypes,
    totalCategories,
  };
}

export default async function AdminDashboard() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Button asChild>
          <Link href="/admin/recipes/new">
            <Plus className="mr-2 h-4 w-4" />
            New Recipe
          </Link>
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Recipes
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalRecipes}</div>
            <p className="text-xs text-muted-foreground">
              All recipes in database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Published Recipes
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.publishedRecipes}</div>
            <p className="text-xs text-muted-foreground">
              Live on the website
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Game Types
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalGameTypes}</div>
            <p className="text-xs text-muted-foreground">
              Types of wild game
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Categories
            </CardTitle>
            <FolderTree className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCategories}</div>
            <p className="text-xs text-muted-foreground">
              Recipe categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Button variant="outline" className="h-auto flex-col py-4" asChild>
            <Link href="/admin/content">
              <Film className="mb-2 h-6 w-6" />
              <span>Edit Content</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto flex-col py-4" asChild>
            <Link href="/admin/recipes">
              <Eye className="mb-2 h-6 w-6" />
              <span>View Recipes</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto flex-col py-4" asChild>
            <Link href="/admin/reports">
              <BarChart3 className="mb-2 h-6 w-6" />
              <span>Reports</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto flex-col py-4" asChild>
            <Link href="/admin/categories">
              <FolderTree className="mb-2 h-6 w-6" />
              <span>Manage Categories</span>
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Shop Note */}
      <Card>
        <CardHeader>
          <CardTitle>Shop Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Products, orders, customers, and discounts are managed through{" "}
            <a
              href="https://admin.shopify.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:no-underline"
            >
              Shopify Admin
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
