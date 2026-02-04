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

    const gameTypes = await prisma.gameType.findMany({
      include: {
        _count: {
          select: {
            recipes: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(gameTypes);
  } catch (error) {
    console.error("Error fetching game types:", error);
    return NextResponse.json(
      { error: "Failed to fetch game types" },
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
    const { name, slug, description, imageUrl, isActive } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    const existingGameType = await prisma.gameType.findUnique({
      where: { slug },
    });

    if (existingGameType) {
      return NextResponse.json(
        { error: "A game type with this slug already exists" },
        { status: 400 }
      );
    }

    const gameType = await prisma.gameType.create({
      data: {
        name,
        slug,
        description: description || null,
        imageUrl: imageUrl || null,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(gameType, { status: 201 });
  } catch (error) {
    console.error("Error creating game type:", error);
    return NextResponse.json(
      { error: "Failed to create game type" },
      { status: 500 }
    );
  }
}
