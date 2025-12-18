"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  ShoppingBag,
  ShoppingCart,
  Users,
  Tag,
  FolderTree,
  Settings,
  BarChart3,
  PawPrint,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Recipes",
    href: "/admin/recipes",
    icon: BookOpen,
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: ShoppingBag,
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    name: "Customers",
    href: "/admin/customers",
    icon: Users,
  },
  {
    name: "Discounts",
    href: "/admin/discounts",
    icon: Tag,
  },
  {
    name: "Categories",
    href: "/admin/categories",
    icon: FolderTree,
  },
  {
    name: "Game Types",
    href: "/admin/game-types",
    icon: PawPrint,
  },
  {
    name: "Reports",
    href: "/admin/reports",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-[#2D5A3D] text-white">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-[#1e4a2d] px-6">
        <Link href="/admin" className="flex items-center space-x-2">
          <PawPrint className="h-8 w-8 text-[#E07C24]" />
          <span className="text-xl font-bold">THK Admin</span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#E07C24] text-white"
                    : "text-[#F5F0E6]/90 hover:bg-[#1e4a2d] hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator className="bg-[#1e4a2d]" />

      {/* User section */}
      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-[#F5F0E6]/90 hover:bg-[#1e4a2d] hover:text-white"
          asChild
        >
          <Link href="/api/auth/signout">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Link>
        </Button>
      </div>
    </div>
  );
}
