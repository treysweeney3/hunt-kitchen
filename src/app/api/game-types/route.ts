import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const gameTypes = await prisma.gameType.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
      include: {
        _count: {
          select: {
            recipes: {
              where: {
                isPublished: true,
              },
            },
          },
        },
      },
    });

    const formattedGameTypes = gameTypes.map((gameType) => ({
      id: gameType.id,
      name: gameType.name,
      slug: gameType.slug,
      description: gameType.description,
      imageUrl: gameType.imageUrl,
      isActive: gameType.isActive,
      recipesCount: gameType._count.recipes,
    }));

    return NextResponse.json({ gameTypes: formattedGameTypes });
  } catch (error) {
    console.error("Error fetching game types:", error);
    return NextResponse.json(
      { error: "Failed to fetch game types" },
      { status: 500 }
    );
  }
}
