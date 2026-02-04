import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await prisma.recipeCategory.findMany({
      orderBy: {
        displayOrder: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching recipe categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch recipe categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    const existingCategory = await prisma.recipeCategory.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "A category with this slug already exists" },
        { status: 400 }
      );
    }

    // Auto-calculate next display order
    const maxOrder = await prisma.recipeCategory.aggregate({
      _max: { displayOrder: true },
    });
    const nextDisplayOrder = (maxOrder._max.displayOrder ?? -1) + 1;

    const category = await prisma.recipeCategory.create({
      data: {
        name,
        slug,
        description: description || null,
        displayOrder: nextDisplayOrder,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating recipe category:", error);
    return NextResponse.json(
      { error: "Failed to create recipe category" },
      { status: 500 }
    );
  }
}
