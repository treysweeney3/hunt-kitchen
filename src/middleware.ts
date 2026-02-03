import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin routes - check for ADMIN role
    if (path.startsWith("/admin")) {
      if (token?.role !== "ADMIN") {
        // Non-admin users get redirected to account page
        return NextResponse.redirect(new URL("/account", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Protected routes require authentication
        if (path.startsWith("/account") || path.startsWith("/admin")) {
          return !!token;
        }

        // All other routes are public
        return true;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/account/:path*",
    "/admin/:path*",
  ],
};
