import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, slug, description, imageUrl, isActive } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    const existingGameType = await prisma.gameType.findUnique({
      where: { id },
    });

    if (!existingGameType) {
      return NextResponse.json(
        { error: "Game type not found" },
        { status: 404 }
      );
    }

    // Check if slug is taken by another game type
    const slugConflict = await prisma.gameType.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    });

    if (slugConflict) {
      return NextResponse.json(
        { error: "A game type with this slug already exists" },
        { status: 400 }
      );
    }

    const gameType = await prisma.gameType.update({
      where: { id },
      data: {
        name,
        slug,
        description: description || null,
        imageUrl: imageUrl || null,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(gameType);
  } catch (error) {
    console.error("Error updating game type:", error);
    return NextResponse.json(
      { error: "Failed to update game type" },
      { status: 500 }
    );
  }
}

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

    const existingGameType = await prisma.gameType.findUnique({
      where: { id },
      include: {
        _count: {
          select: { recipes: true },
        },
      },
    });

    if (!existingGameType) {
      return NextResponse.json(
        { error: "Game type not found" },
        { status: 404 }
      );
    }

    if (existingGameType._count.recipes > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete game type with ${existingGameType._count.recipes} associated recipe(s). Remove recipes first.`,
        },
        { status: 400 }
      );
    }

    await prisma.gameType.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting game type:", error);
    return NextResponse.json(
      { error: "Failed to delete game type" },
      { status: 500 }
    );
  }
}
