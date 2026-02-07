import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { removeContactFromResend } from "@/lib/email";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get email before deleting so we can remove from Resend
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { id },
      select: { email: true },
    });

    await prisma.newsletterSubscriber.delete({
      where: { id },
    });

    if (subscriber) {
      try {
        await removeContactFromResend(subscriber.email);
      } catch (emailError) {
        console.error("Error removing contact from Resend:", emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting subscriber:", error);
    return NextResponse.json(
      { error: "Failed to delete subscriber" },
      { status: 500 }
    );
  }
}
