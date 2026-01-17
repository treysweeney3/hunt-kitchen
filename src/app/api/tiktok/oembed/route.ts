import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const videoId = searchParams.get('videoId');
  const username = searchParams.get('username') || 'the_hunt_kitchen';

  if (!videoId) {
    return NextResponse.json({ error: 'Missing videoId' }, { status: 400 });
  }

  try {
    const tiktokUrl = `https://www.tiktok.com/@${username}/video/${videoId}`;
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(tiktokUrl)}`;

    const response = await fetch(oembedUrl, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      throw new Error('Failed to fetch TikTok oEmbed data');
    }

    const data = await response.json();

    return NextResponse.json({
      thumbnailUrl: data.thumbnail_url,
      title: data.title,
      authorName: data.author_name,
      thumbnailWidth: data.thumbnail_width,
      thumbnailHeight: data.thumbnail_height,
    });
  } catch (error) {
    console.error('TikTok oEmbed error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch TikTok data' },
      { status: 500 }
    );
  }
}
