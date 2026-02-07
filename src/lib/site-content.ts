import prisma from "@/lib/prisma";

// ============================================================================
// Types
// ============================================================================

export interface TikTokVideo {
  id: string;
  title: string;
}

export interface InstagramPost {
  id: string;
  title: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  featured?: boolean;
}

export type SiteContentKey =
  | "tiktok_videos"
  | "homepage_tiktok_videos"
  | "instagram_posts"
  | "youtube_videos";

type SiteContentValueMap = {
  tiktok_videos: TikTokVideo[];
  homepage_tiktok_videos: TikTokVideo[];
  instagram_posts: InstagramPost[];
  youtube_videos: YouTubeVideo[];
};

// ============================================================================
// Defaults (fallback if DB has no entry)
// ============================================================================

const DEFAULTS: SiteContentValueMap = {
  tiktok_videos: [],
  homepage_tiktok_videos: [],
  instagram_posts: [],
  youtube_videos: [],
};

// ============================================================================
// Helpers
// ============================================================================

export async function getSiteContent<K extends SiteContentKey>(
  key: K
): Promise<SiteContentValueMap[K]> {
  const row = await prisma.siteContent.findUnique({ where: { key } });
  if (!row) return DEFAULTS[key];
  return row.value as unknown as SiteContentValueMap[K];
}

export async function setSiteContent<K extends SiteContentKey>(
  key: K,
  value: SiteContentValueMap[K]
): Promise<void> {
  await prisma.siteContent.upsert({
    where: { key },
    update: { value: value as any },
    create: { key, value: value as any },
  });
}

export async function getAllSiteContent(): Promise<
  Record<string, unknown>
> {
  const rows = await prisma.siteContent.findMany();
  const result: Record<string, unknown> = {};
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return result;
}
