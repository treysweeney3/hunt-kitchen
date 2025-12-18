import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Type for request body
interface ContactBody {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactBody = await request.json();

    // Validate required fields
    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!body.email || !isValidEmail(body.email)) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    if (!body.message || body.message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Validate message length
    if (body.message.length > 5000) {
      return NextResponse.json(
        { error: "Message is too long (max 5000 characters)" },
        { status: 400 }
      );
    }

    // Create contact submission
    const submission = await prisma.contactSubmission.create({
      data: {
        name: body.name.trim(),
        email: body.email.toLowerCase().trim(),
        subject: body.subject?.trim() || null,
        message: body.message.trim(),
        isRead: false,
        isReplied: false,
      },
    });

    // TODO: Send email notification to admin
    // TODO: Send confirmation email to user

    return NextResponse.json(
      {
        message: "Thank you for contacting us. We will get back to you soon.",
        submission: {
          id: submission.id,
          createdAt: submission.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return NextResponse.json(
      { error: "Failed to submit contact form" },
      { status: 500 }
    );
  }
}

// Simple email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
