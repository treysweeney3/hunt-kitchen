import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  verifyUnsubscribeSignature,
  removeContactFromResend,
} from "@/lib/email";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const sig = searchParams.get("sig");

  if (!email || !sig) {
    return NextResponse.redirect(
      new URL("/unsubscribe?error=invalid", request.url)
    );
  }

  let valid = false;
  try {
    valid = verifyUnsubscribeSignature(email, sig);
  } catch {
    // Invalid hex in sig or missing secret
  }

  if (!valid) {
    return NextResponse.redirect(
      new URL("/unsubscribe?error=invalid", request.url)
    );
  }

  try {
    // Mark as unsubscribed in DB (idempotent — handles already-unsubscribed)
    await prisma.newsletterSubscriber.updateMany({
      where: { email: email.toLowerCase() },
      data: {
        isSubscribed: false,
        unsubscribedAt: new Date(),
      },
    });

    // Remove from Resend contacts (fire-and-forget, non-blocking)
    removeContactFromResend(email.toLowerCase()).catch((err) =>
      console.error("[UNSUBSCRIBE] Failed to remove from Resend:", err)
    );
  } catch (error) {
    console.error("[UNSUBSCRIBE] Database error:", error);
    return NextResponse.redirect(
      new URL("/unsubscribe?error=server", request.url)
    );
  }

  return NextResponse.redirect(
    new URL("/unsubscribe?success=true", request.url)
  );
}
