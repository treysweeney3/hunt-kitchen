import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { addContactToResend, removeContactFromResend } from "@/lib/email";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: session.user.email.toLowerCase() },
    });

    return NextResponse.json({
      preferences: {
        newsletter: subscriber?.isSubscribed ?? false,
      },
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const newsletter: boolean = body.preferences?.newsletter;
    const email = session.user.email.toLowerCase();
    const firstName = session.user.firstName || null;

    if (newsletter) {
      // Subscribe: upsert into newsletter_subscriber + add to Resend
      const existing = await prisma.newsletterSubscriber.findUnique({
        where: { email },
      });

      if (existing) {
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: {
            isSubscribed: true,
            subscribedAt: new Date(),
            unsubscribedAt: null,
            firstName: firstName || existing.firstName,
          },
        });
      } else {
        await prisma.newsletterSubscriber.create({
          data: {
            email,
            firstName,
            isSubscribed: true,
            source: "account_settings",
          },
        });
      }

      try {
        await addContactToResend({ email, firstName });
      } catch (err) {
        console.error("Error adding contact to Resend:", err);
      }
    } else {
      // Unsubscribe: update newsletter_subscriber + remove from Resend
      const existing = await prisma.newsletterSubscriber.findUnique({
        where: { email },
      });

      if (existing) {
        await prisma.newsletterSubscriber.update({
          where: { email },
          data: {
            isSubscribed: false,
            unsubscribedAt: new Date(),
          },
        });
      }

      try {
        await removeContactFromResend(email);
      } catch (err) {
        console.error("Error removing contact from Resend:", err);
      }
    }

    return NextResponse.json({
      preferences: { newsletter },
    });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
