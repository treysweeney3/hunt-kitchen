"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
  loadingComponent?: ReactNode;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  redirectTo = "/login",
  loadingComponent,
}: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        const currentPath = window.location.pathname;
        router.push(`${redirectTo}?callbackUrl=${encodeURIComponent(currentPath)}`);
      } else if (requireAdmin && !isAdmin) {
        router.push("/account");
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, requireAdmin, redirectTo, router]);

  if (isLoading) {
    return loadingComponent || <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireAdmin && !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
