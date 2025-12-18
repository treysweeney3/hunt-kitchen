import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin routes protection
    if (path.startsWith("/admin")) {
      if (!token) {
        return NextResponse.redirect(
          new URL(`/login?callbackUrl=${encodeURIComponent(path)}`, req.url)
        );
      }

      if (token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/account", req.url));
      }
    }

    // Account routes protection
    if (path.startsWith("/account")) {
      if (!token) {
        return NextResponse.redirect(
          new URL(`/login?callbackUrl=${encodeURIComponent(path)}`, req.url)
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Allow access to public routes
        if (
          path.startsWith("/login") ||
          path.startsWith("/register") ||
          path.startsWith("/api/auth") ||
          !path.startsWith("/account") &&
          !path.startsWith("/admin")
        ) {
          return true;
        }

        // Require authentication for protected routes
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api routes that don't need protection
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth/register).*)",
    "/account/:path*",
    "/admin/:path*",
  ],
};
