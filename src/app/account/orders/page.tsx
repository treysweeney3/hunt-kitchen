"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Package, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { Order } from "@/types";
import { format } from "date-fns";
import { toast } from "sonner";

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/account/orders?page=${currentPage}&limit=${ordersPerPage}`
        );
        if (!res.ok) throw new Error("Failed to fetch orders");

        const data = await res.json();
        setOrders(data.orders || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [currentPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#2D5A3D]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Order History</h1>
        <p className="mt-2 text-gray-600">
          View and track all your orders in one place.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            <>
              <div className="space-y-4">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/account/orders/${order.id}`}
                    className="block"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border hover:border-[#2D5A3D] transition-colors gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 rounded-lg bg-gray-100 flex-shrink-0">
                          <ShoppingBag className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 mb-1">
                            Order #{order.orderNumber}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            {format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.items?.length || 0} {order.items?.length === 1 ? "item" : "items"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 sm:flex-shrink-0">
                        <div className="flex flex-col sm:items-end gap-2">
                          {getOrderStatusBadge(order.status)}
                          <p className="font-semibold text-gray-900">
                            ${order.total.toFixed(2)}
                          </p>
                        </div>
                        <ArrowRight className="hidden sm:block h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}
                              className="cursor-pointer"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}

                      {totalPages > 5 && <PaginationEllipsis />}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
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
    </div>
  );
}
