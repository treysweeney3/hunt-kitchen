import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Type for request body
interface SubscribeBody {
  email: string;
  firstName?: string;
  source?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SubscribeBody = await request.json();

    // Validate email
    if (!body.email || !isValidEmail(body.email)) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: body.email.toLowerCase() },
    });

    if (existingSubscriber) {
      // If previously unsubscribed, resubscribe
      if (!existingSubscriber.isSubscribed) {
        await prisma.newsletterSubscriber.update({
          where: { email: body.email.toLowerCase() },
          data: {
            isSubscribed: true,
            subscribedAt: new Date(),
            unsubscribedAt: null,
            firstName: body.firstName || existingSubscriber.firstName,
            source: body.source || existingSubscriber.source,
          },
        });

        return NextResponse.json(
          {
            message: "Successfully resubscribed to newsletter",
            resubscribed: true,
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: "Email is already subscribed" },
        { status: 400 }
      );
    }

    // Create new subscriber
    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email: body.email.toLowerCase(),
        firstName: body.firstName || null,
        source: body.source || "website",
        isSubscribed: true,
      },
    });

    return NextResponse.json(
      {
        message: "Successfully subscribed to newsletter",
        subscriber: {
          email: subscriber.email,
          subscribedAt: subscriber.subscribedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    return NextResponse.json(
      { error: "Failed to subscribe to newsletter" },
      { status: 500 }
    );
  }
}

// Simple email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
