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
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

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

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-forestGreen text-white transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-barkBrown px-3">
        <Link
          href="/admin"
          className={cn(
            "flex items-center overflow-hidden",
            collapsed ? "justify-center w-full" : "px-3"
          )}
        >
          <span className="text-xl font-bold whitespace-nowrap">
            {collapsed ? "THK" : "THK Admin"}
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            const linkContent = (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center rounded-lg text-sm font-medium transition-colors",
                  collapsed
                    ? "justify-center px-2 py-2.5"
                    : "gap-3 px-3 py-2.5",
                  isActive
                    ? "bg-white/20 text-white border-l-2 border-white"
                    : "text-white/90 hover:bg-barkBrown hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && item.name}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right">{item.name}</TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </nav>
      </ScrollArea>

      <Separator className="bg-barkBrown" />

      {/* Sign out + collapse toggle */}
      <div className="p-2">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-full text-white/90 hover:bg-barkBrown hover:text-white"
                asChild
              >
                <Link href="/api/auth/signout">
                  <LogOut className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Sign Out</TooltipContent>
          </Tooltip>
        ) : (
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
        )}

        <Separator className="my-2 bg-barkBrown" />

        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-full text-white/90 hover:bg-barkBrown hover:text-white"
                onClick={onToggle}
              >
                <PanelLeftOpen className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Expand sidebar</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start text-white/90 hover:bg-barkBrown hover:text-white"
            onClick={onToggle}
          >
            <PanelLeftClose className="mr-2 h-4 w-4" />
            Collapse
          </Button>
        )}
      </div>
    </div>
  );
}
