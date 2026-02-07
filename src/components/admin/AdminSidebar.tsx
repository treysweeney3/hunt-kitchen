"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  FolderTree,
  Film,
  Mail,
  Users,
  Send,
  Settings,
  BarChart3,
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
    name: "Categories",
    href: "/admin/categories",
    icon: FolderTree,
  },
  {
    name: "Content",
    href: "/admin/content",
    icon: Film,
  },
  {
    name: "Submissions",
    href: "/admin/submissions",
    icon: Mail,
  },
  {
    name: "Subscribers",
    href: "/admin/subscribers",
    icon: Users,
  },
  {
    name: "Newsletter",
    href: "/admin/newsletter",
    icon: Send,
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
    <div className="flex h-full w-64 flex-col bg-forestGreen text-white">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-barkBrown px-6">
        <Link href="/admin">
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
                    ? "bg-white/20 text-white border-l-2 border-white"
                    : "text-white/90 hover:bg-barkBrown hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator className="bg-barkBrown" />

      {/* User section */}
      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-white/90 hover:bg-barkBrown hover:text-white"
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
