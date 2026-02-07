import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { removeContactFromResend } from "@/lib/email";

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email;

    // Unsubscribe from newsletter if subscribed
    if (userEmail) {
      await prisma.newsletterSubscriber
        .update({
          where: { email: userEmail.toLowerCase() },
          data: {
            isSubscribed: false,
            unsubscribedAt: new Date(),
          },
        })
        .catch(() => {
          // No subscriber record exists — that's fine
        });

      // Remove from Resend contacts
      await removeContactFromResend(userEmail.toLowerCase()).catch((err) =>
        console.error("Failed to remove contact from Resend:", err)
      );
    }

    // Delete the user (cascades to addresses, saved recipes; nullifies ratings)
    await prisma.user.delete({
      where: { id: session.user.id },
    });

    return NextResponse.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
