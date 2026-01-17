'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';

interface TikTokOEmbedData {
  thumbnailUrl: string;
  title: string;
  authorName: string;
}

interface TikTokEmbedProps {
  videoId: string;
  username?: string;
}

export function TikTokEmbed({ videoId, username = 'the_hunt_kitchen' }: TikTokEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [oembedData, setOembedData] = useState<TikTokOEmbedData | null>(null);

  useEffect(() => {
    // Fetch thumbnail data
    fetch(`/api/tiktok/oembed?videoId=${videoId}&username=${username}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.thumbnailUrl) {
          setOembedData(data);
        }
      })
      .catch(console.error);
  }, [videoId, username]);

  useEffect(() => {
    if (!isLoaded) return;

    const existingScript = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
    if (existingScript) {
      (window as any).tiktokEmbed?.lib?.render();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.tiktok.com/embed.js';
    script.async = true;
    document.body.appendChild(script);
  }, [isLoaded]);

  if (!isLoaded) {
    return (
      <button
        onClick={() => setIsLoaded(true)}
        className="group relative flex aspect-[9/16] w-full max-w-[325px] min-w-[290px] items-center justify-center overflow-hidden rounded-xl bg-black/90 transition-all hover:bg-black"
      >
        {oembedData?.thumbnailUrl && (
          <Image
            src={oembedData.thumbnailUrl}
            alt={oembedData.title || 'TikTok video'}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="325px"
          />
        )}
        <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
          <div className="rounded-full bg-[#ff0050] p-4 shadow-lg transition-transform group-hover:scale-110">
            <Play className="h-8 w-8 fill-white" />
          </div>
          <span className="rounded-full bg-black/50 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            @{username}
          </span>
        </div>
      </button>
    );
  }

  return (
    <blockquote
      className="tiktok-embed"
      cite={`https://www.tiktok.com/@${username}/video/${videoId}`}
      data-video-id={videoId}
      style={{ maxWidth: '605px', minWidth: '325px' }}
    >
      <section>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`https://www.tiktok.com/@${username}`}
        >
          @{username}
        </a>
      </section>
    </blockquote>
  );
}

interface TikTokGridProps {
  videos: { id: string; title?: string }[];
  username?: string;
}

function TikTokGridItem({ video, username }: { video: { id: string; title?: string }; username: string }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [oembedData, setOembedData] = useState<TikTokOEmbedData | null>(null);

  useEffect(() => {
    // Fetch thumbnail data
    fetch(`/api/tiktok/oembed?videoId=${video.id}&username=${username}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.thumbnailUrl) {
          setOembedData(data);
        }
      })
      .catch(console.error);
  }, [video.id, username]);

  useEffect(() => {
    if (!isLoaded) return;

    const existingScript = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
    if (existingScript) {
      (window as any).tiktokEmbed?.lib?.render();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.tiktok.com/embed.js';
    script.async = true;
    document.body.appendChild(script);
  }, [isLoaded]);

  if (!isLoaded) {
    return (
      <button
        onClick={() => setIsLoaded(true)}
        className="group relative flex aspect-[9/16] w-full max-w-[325px] min-w-[290px] items-center justify-center overflow-hidden rounded-xl bg-black/90 transition-all"
      >
        {oembedData?.thumbnailUrl && (
          <Image
            src={oembedData.thumbnailUrl}
            alt={oembedData.title || video.title || 'TikTok video'}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="325px"
          />
        )}
        <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
          <div className="rounded-full bg-[#ff0050] p-4 shadow-lg transition-transform group-hover:scale-110">
            <Play className="h-8 w-8 fill-white" />
          </div>
          <span className="rounded-full bg-black/50 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            @{username}
          </span>
        </div>
      </button>
    );
  }

  return (
    <div className="tiktok-wrapper overflow-hidden rounded-xl">
      <blockquote
        className="tiktok-embed"
        cite={`https://www.tiktok.com/@${username}/video/${video.id}`}
        data-video-id={video.id}
        style={{ maxWidth: '325px', minWidth: '290px', margin: 0 }}
      >
        <section>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`https://www.tiktok.com/@${username}`}
          >
            @{username}
          </a>
        </section>
      </blockquote>
    </div>
  );
}

export function TikTokGrid({ videos, username = 'the_hunt_kitchen' }: TikTokGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <div key={video.id} className="flex justify-center">
          <TikTokGridItem video={video} username={username} />
        </div>
      ))}
    </div>
  );
}
