import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { UserRole } from "@/generated/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: UserRole;
      emailVerified: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    emailVerified: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    emailVerified: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    newUser: "/account",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user) {
          throw new Error("Invalid email or password");
        }

        // Check if user has a password (credentials-based user)
        if (!user.passwordHash) {
          throw new Error("Please sign in with your social account");
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        // Return user object
        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          emailVerified: user.emailVerified,
        };
      },
    }),
    // Google OAuth Provider (optional - requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
          firstName: profile.given_name || "",
          lastName: profile.family_name || "",
          role: "CUSTOMER" as UserRole,
          emailVerified: profile.email_verified || false,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
        token.emailVerified = !!user.emailVerified;
      }

      // Handle session updates
      if (trigger === "update" && session) {
        token.firstName = session.firstName || token.firstName;
        token.lastName = session.lastName || token.lastName;
        token.email = session.email || token.email;
      }

      return token;
    },
    async session({ session, token }) {
      // Add user data to session
      if (token) {
        session.user = {
          id: token.id,
          email: token.email,
          firstName: token.firstName,
          lastName: token.lastName,
          role: token.role,
          emailVerified: token.emailVerified,
        };
      }

      return session;
    },
    async signIn({ user, account }) {
      // For OAuth providers, ensure user exists in database
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
              emailVerified: !!user.emailVerified,
              passwordHash: null,
            },
          });
        }
      }

      return true;
    },
  },
  events: {
    async signIn({ user, isNewUser }) {
      if (isNewUser) {
        console.log(`New user registered: ${user.email}`);
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
};
