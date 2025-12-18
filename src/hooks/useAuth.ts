"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useCallback } from "react";
import type { UserRole } from "@/generated/prisma";

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
}

export function useAuth() {
  const { data: session, status, update } = useSession();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  const user = session?.user || null;
  const isAdmin = user?.role === "ADMIN";
  const isCustomer = user?.role === "CUSTOMER";

  const login = useCallback(
    async (credentials: LoginCredentials, callbackUrl?: string) => {
      try {
        const result = await signIn("credentials", {
          email: credentials.email,
          password: credentials.password,
          redirect: false,
        });

        if (result?.error) {
          throw new Error(result.error);
        }

        if (result?.ok) {
          // Redirect after successful login
          if (callbackUrl) {
            window.location.href = callbackUrl;
          } else {
            window.location.href = "/account";
          }
        }

        return result;
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    []
  );

  const register = useCallback(async (data: RegisterData) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      return result;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }, []);

  const logout = useCallback(async (callbackUrl?: string) => {
    try {
      await signOut({
        redirect: true,
        callbackUrl: callbackUrl || "/",
      });
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }, []);

  const loginWithGoogle = useCallback(
    async (callbackUrl?: string) => {
      try {
        await signIn("google", {
          callbackUrl: callbackUrl || "/account",
        });
      } catch (error) {
        console.error("Google login error:", error);
        throw error;
      }
    },
    []
  );

  const updateSession = useCallback(
    async (data: Partial<typeof session>) => {
      try {
        await update(data);
      } catch (error) {
        console.error("Session update error:", error);
        throw error;
      }
    },
    [update]
  );

  return {
    // Session state
    session,
    user,
    isLoading,
    isAuthenticated,

    // Role checks
    isAdmin,
    isCustomer,

    // Auth methods
    login,
    register,
    logout,
    loginWithGoogle,
    updateSession,
  };
}
