"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { AdminSidebar } from "./AdminSidebar";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close mobile drawer on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="flex flex-1 min-h-0">
      {isMobile ? (
        <>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent side="left" className="w-64 p-0 bg-forestGreen border-none">
              <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
              <AdminSidebar
                collapsed={false}
                onToggle={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>
          <main className="flex-1 overflow-y-auto bg-cream">
            <div className="sticky top-0 z-10 flex items-center border-b border-stone/30 bg-cream px-4 py-2 lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="text-forestGreen hover:bg-forestGreen/10 hover:text-forestGreen"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <span className="ml-2 font-semibold text-forestGreen">Admin</span>
            </div>
            <div className="p-6">{children}</div>
          </main>
        </>
      ) : (
        <>
          <AdminSidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed(!collapsed)}
          />
          <main className="flex-1 overflow-y-auto bg-cream p-6">
            {children}
          </main>
        </>
      )}
    </div>
  );
}
