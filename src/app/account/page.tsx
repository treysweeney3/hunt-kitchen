import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Heart,
  MapPin,
  Settings,
  ArrowRight,
  ShoppingBag
} from "lucide-react";
import { Order, Recipe } from "@/types";
import { format } from "date-fns";

async function getRecentOrders(userId: string): Promise<Order[]> {
  try {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/account/orders?limit=3`,
      {
        cache: "no-store",
        headers: {
          "x-user-id": userId,
        },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.orders || [];
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return [];
  }
}

async function getSavedRecipes(userId: string): Promise<Recipe[]> {
  try {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/account/saved-recipes?limit=4`,
      {
        cache: "no-store",
        headers: {
          "x-user-id": userId,
        },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.recipes || [];
  } catch (error) {
    console.error("Failed to fetch saved recipes:", error);
    return [];
  }
}

function getOrderStatusBadge(status: string) {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", className: string }> = {
    pending: { variant: "secondary", className: "bg-yellow-100 text-yellow-800" },
    processing: { variant: "default", className: "bg-blue-100 text-blue-800" },
    shipped: { variant: "default", className: "bg-purple-100 text-purple-800" },
    delivered: { variant: "default", className: "bg-green-100 text-green-800" },
    cancelled: { variant: "destructive", className: "bg-red-100 text-red-800" },
    refunded: { variant: "secondary", className: "bg-gray-100 text-gray-800" },
  };

  const config = variants[status] || variants.pending;

  return (
    <Badge variant={config.variant} className={config.className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export default async function AccountDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const [recentOrders, savedRecipes] = await Promise.all([
    getRecentOrders(session.user.id),
    getSavedRecipes(session.user.id),
  ]);

  const quickLinks = [
    {
      title: "Orders",
      description: "View and track your orders",
      icon: Package,
      href: "/account/orders",
      count: recentOrders.length > 0 ? `${recentOrders.length}+ orders` : "No orders yet",
    },
    {
      title: "Saved Recipes",
      description: "Your favorite recipes",
      icon: Heart,
      href: "/account/saved-recipes",
      count: savedRecipes.length > 0 ? `${savedRecipes.length}+ saved` : "No recipes saved",
    },
    {
      title: "Addresses",
      description: "Manage shipping addresses",
      icon: MapPin,
      href: "/account/addresses",
      count: "Manage addresses",
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
          Manage your orders, saved recipes, and account settings.
        </p>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/account/orders">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 rounded-lg border hover:border-[#2D5A3D] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-gray-100">
                        <ShoppingBag className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Order #{order.orderNumber}
                        </p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(order.createdAt), "MMM d, yyyy")} •{" "}
                          {order.items?.length || 0} items
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getOrderStatusBadge(order.status)}
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${order.total.toFixed(2)}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No orders yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start shopping to see your orders here.
              </p>
              <Button asChild className="bg-[#2D5A3D] hover:bg-[#234a30]">
                <Link href="/shop">Browse Products</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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
                      src={recipe.featuredImageUrl}
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
