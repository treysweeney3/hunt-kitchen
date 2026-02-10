import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  buildNewsletterHtml,
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
    const { subject, heroHeading, heroText, recipeIds, product, contentHtml } =
      body;

    // Fetch recipe data if IDs provided
    let recipes: NewsletterRecipe[] = [];
    if (recipeIds && recipeIds.length > 0) {
      recipes = await prisma.recipe.findMany({
        where: { id: { in: recipeIds } },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          featuredImageUrl: true,
        },
      });
    }

    const newsletterData: NewsletterData = {
      subject: subject?.trim() || "Newsletter Preview",
      heroHeading: heroHeading?.trim() || undefined,
      heroText: heroText?.trim() || undefined,
      recipes: recipes.length > 0 ? recipes : undefined,
      product: product?.name ? product : undefined,
      contentHtml: contentHtml?.trim() || undefined,
    };

    const html = buildNewsletterHtml(
      newsletterData,
      "https://thehuntkitchen.com/unsubscribe"
    );

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("Error generating preview:", error);
    return NextResponse.json(
      { error: "Failed to generate preview" },
      { status: 500 }
    );
  }
}
