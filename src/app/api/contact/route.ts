import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  sendContactAdminNotification,
  sendContactUserConfirmation,
} from "@/lib/email";

// Type for request body
interface ContactBody {
  name: string;
  email: string;
  subject?: string;
  message: string;
  inquiryType?: string;
  companyName?: string;
  jobTitle?: string;
  collaborationType?: string;
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

    // Build subject and message with business details encoded
    const isBusiness = body.inquiryType === "business";
    let subject = body.subject?.trim() || null;
    let message = body.message.trim();

    if (isBusiness) {
      const prefix = "[BUSINESS]";
      const companyPart = body.companyName ? ` - ${body.companyName.trim()}` : "";
      subject = subject
        ? `${prefix}${companyPart} ${subject}`
        : `${prefix}${companyPart} Business Inquiry`;

      const businessLines = [
        "",
        "---",
        `Inquiry Type: Business Collaboration`,
        body.companyName ? `Company: ${body.companyName.trim()}` : null,
        body.jobTitle ? `Role/Title: ${body.jobTitle.trim()}` : null,
        body.collaborationType
          ? `Collaboration Type: ${body.collaborationType}`
          : null,
      ]
        .filter(Boolean)
        .join("\n");

      message = message + "\n" + businessLines;
    }

    // Create contact submission
    const submission = await prisma.contactSubmission.create({
      data: {
        name: body.name.trim(),
        email: body.email.toLowerCase().trim(),
        subject,
        message,
        isRead: false,
        isReplied: false,
      },
    });

    // Send emails (failures logged but don't fail the request)
    console.log("[CONTACT] Submission saved, sending emails...");
    const emailData = {
      name: body.name.trim(),
      email: body.email.toLowerCase().trim(),
      subject,
      message,
      inquiryType: body.inquiryType,
      companyName: body.companyName?.trim(),
      jobTitle: body.jobTitle?.trim(),
      collaborationType: body.collaborationType,
    };

    try {
      await Promise.all([
        sendContactAdminNotification(emailData),
        sendContactUserConfirmation(emailData),
      ]);
    } catch (emailError) {
      console.error("Error sending contact emails:", emailError);
    }

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
