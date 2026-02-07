import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllSiteContent, setSiteContent, SiteContentKey } from "@/lib/site-content";

const VALID_KEYS: SiteContentKey[] = [
  "tiktok_videos",
  "homepage_tiktok_videos",
  "instagram_posts",
  "youtube_videos",
];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const content = await getAllSiteContent();
    return NextResponse.json(content);
  } catch (error) {
    console.error("Error fetching site content:", error);
    return NextResponse.json(
      { error: "Failed to fetch site content" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { key, value } = body as { key: string; value: unknown };

    if (!key || !VALID_KEYS.includes(key as SiteContentKey)) {
      return NextResponse.json(
        { error: `Invalid key. Must be one of: ${VALID_KEYS.join(", ")}` },
        { status: 400 }
      );
    }

    if (!Array.isArray(value)) {
      return NextResponse.json(
        { error: "Value must be an array" },
        { status: 400 }
      );
    }

    await setSiteContent(key as SiteContentKey, value as any);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating site content:", error);
    return NextResponse.json(
      { error: "Failed to update site content" },
      { status: 500 }
    );
  }
}
