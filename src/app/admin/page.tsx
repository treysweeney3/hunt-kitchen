import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Package,
  Plus,
  BookOpen,
  ShoppingBag,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { format } from "date-fns";

async function getDashboardData() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    todayOrders,
    todayRevenue,
    pendingOrders,
    lowStockProducts,
    recentOrders,
  ] = await Promise.all([
    // Today's orders count
    prisma.order.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    }),
    // Today's revenue
    prisma.order.aggregate({
      where: {
        createdAt: {
          gte: today,
        },
        paymentStatus: "PAID",
      },
      _sum: {
        total: true,
      },
    }),
    // Pending orders
    prisma.order.count({
      where: {
        status: "PENDING",
      },
    }),
    // Low stock products (less than 10 items)
    prisma.productVariant.count({
      where: {
        inventoryQty: {
          lt: 10,
        },
        isActive: true,
      },
    }),
    // Recent orders
    prisma.order.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        orderNumber: true,
        email: true,
        total: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    todayOrders,
    todayRevenue: todayRevenue._sum.total || 0,
    pendingOrders,
    lowStockProducts,
    recentOrders,
  };
}

export default async function AdminDashboard() {
  const data = await getDashboardData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/recipes/new">
              <Plus className="mr-2 h-4 w-4" />
              New Recipe
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              New Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Orders
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.todayOrders}</div>
            <p className="text-xs text-muted-foreground">
              Orders placed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${Number(data.todayRevenue).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue from paid orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Orders
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Stock Alerts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Products with low inventory
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
            <Link href="/admin/recipes/new">
              <BookOpen className="mb-2 h-6 w-6" />
              <span>Create Recipe</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto flex-col py-4" asChild>
            <Link href="/admin/products/new">
              <ShoppingBag className="mb-2 h-6 w-6" />
              <span>Add Product</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto flex-col py-4" asChild>
            <Link href="/admin/orders">
              <ShoppingCart className="mb-2 h-6 w-6" />
              <span>View Orders</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto flex-col py-4" asChild>
            <Link href="/admin/customers">
              <Plus className="mb-2 h-6 w-6" />
              <span>Manage Customers</span>
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Order #{order.orderNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-medium">
                    ${Number(order.total).toFixed(2)}
                  </p>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                      {order.status}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {data.recentOrders.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                No orders yet
              </p>
            )}
          </div>
          {data.recentOrders.length > 0 && (
            <div className="mt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/orders">View All Orders</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
