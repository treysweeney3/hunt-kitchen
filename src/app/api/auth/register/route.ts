import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { UserRole } from "@/generated/prisma";
import { z } from "zod";
import { createVerificationToken } from "@/lib/verification-token";
import { sendVerificationEmail, sendNewsletterWelcome, addContactToResend } from "@/lib/email";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  subscribeNewsletter: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, subscribeNewsletter } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        role: "CUSTOMER",
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // Fire-and-forget verification email
    const token = createVerificationToken(user.id, user.email);
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
    sendVerificationEmail({
      email: user.email,
      firstName: user.firstName,
      verificationUrl,
    }).catch((err) =>
      console.error("Failed to send verification email:", err)
    );

    // Subscribe to newsletter if opted in
    if (subscribeNewsletter) {
      const lowerEmail = email.toLowerCase();

      // Create or resubscribe in DB
      const existingSub = await prisma.newsletterSubscriber.findUnique({
        where: { email: lowerEmail },
      });

      if (!existingSub) {
        await prisma.newsletterSubscriber.create({
          data: {
            email: lowerEmail,
            firstName,
            source: "registration",
            isSubscribed: true,
          },
        });
      } else if (!existingSub.isSubscribed) {
        await prisma.newsletterSubscriber.update({
          where: { email: lowerEmail },
          data: {
            isSubscribed: true,
            subscribedAt: new Date(),
            unsubscribedAt: null,
            firstName,
            source: "registration",
          },
        });
      }

      // Add contact to Resend (independent of welcome email)
      try {
        await addContactToResend({ email: lowerEmail, firstName });
      } catch (err) {
        console.error("Failed to add contact to Resend:", err);
      }

      // Send welcome email
      try {
        await sendNewsletterWelcome({ email: lowerEmail, firstName });
      } catch (err) {
        console.error("Failed to send newsletter welcome:", err);
      }
    }

    return NextResponse.json(
      {
        message: "Account created successfully",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
