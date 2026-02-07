import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  sendNewsletter,
  sendNewsletterPreview,
  type NewsletterData,
  type NewsletterRecipe,
} from "@/lib/email";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      subject,
      heroHeading,
      heroText,
      recipeIds,
      product,
      contentHtml,
      previewOnly,
    } = body;

    if (!subject || subject.trim().length === 0) {
      return NextResponse.json(
        { error: "Subject is required" },
        { status: 400 }
      );
    }

    // Fetch recipe data if IDs provided
    let recipes: NewsletterRecipe[] = [];
    if (recipeIds && recipeIds.length > 0) {
      const dbRecipes = await prisma.recipe.findMany({
        where: { id: { in: recipeIds } },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          featuredImageUrl: true,
        },
      });
      recipes = dbRecipes;
    }

    const newsletterData: NewsletterData = {
      subject: subject.trim(),
      heroHeading: heroHeading?.trim() || undefined,
      heroText: heroText?.trim() || undefined,
      recipes: recipes.length > 0 ? recipes : undefined,
      product: product?.name ? product : undefined,
      contentHtml: contentHtml?.trim() || undefined,
    };

    // Preview mode — send only to admin
    if (previewOnly) {
      await sendNewsletterPreview(newsletterData, session.user.email);
      return NextResponse.json({ sent: 1, errors: 0, preview: true });
    }

    // Fetch all active subscribers
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { isSubscribed: true },
      select: { email: true },
    });

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: "No active subscribers found" },
        { status: 400 }
      );
    }

    const result = await sendNewsletter(newsletterData, subscribers);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error sending newsletter:", error);
    return NextResponse.json(
      { error: "Failed to send newsletter" },
      { status: 500 }
    );
  }
}
