'use client';

import { useEffect } from 'react';

interface InstagramEmbedProps {
  postId: string;
  captioned?: boolean;
}

export function InstagramEmbed({ postId, captioned = false }: InstagramEmbedProps) {
  useEffect(() => {
    // Load Instagram embed script
    const script = document.createElement('script');
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    document.body.appendChild(script);

    // Process embeds after script loads
    const timer = setTimeout(() => {
      if ((window as any).instgrm) {
        (window as any).instgrm.Embeds.process();
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [postId]);

  return (
    <blockquote
      className="instagram-media"
      data-instgrm-captioned={captioned ? 'true' : undefined}
      data-instgrm-permalink={`https://www.instagram.com/p/${postId}/`}
      data-instgrm-version="14"
      style={{
        background: '#FFF',
        border: 0,
        borderRadius: '12px',
        boxShadow: 'none',
        margin: 0,
        maxWidth: '540px',
        minWidth: '326px',
        padding: 0,
        width: '100%',
      }}
    >
      <div style={{ padding: '16px' }}>
        <a
          href={`https://www.instagram.com/p/${postId}/`}
          style={{
            background: '#FFFFFF',
            lineHeight: 0,
            padding: '0 0',
            textAlign: 'center',
            textDecoration: 'none',
            width: '100%',
          }}
          target="_blank"
          rel="noopener noreferrer"
        >
          View this post on Instagram
        </a>
      </div>
    </blockquote>
  );
}

interface InstagramGridProps {
  posts: { id: string; captioned?: boolean }[];
}

export function InstagramGrid({ posts }: InstagramGridProps) {
  useEffect(() => {
    // Load Instagram embed script once for all embeds
    const script = document.createElement('script');
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    document.body.appendChild(script);

    // Process embeds after script loads
    const timer = setTimeout(() => {
      if ((window as any).instgrm) {
        (window as any).instgrm.Embeds.process();
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <div key={post.id} className="flex justify-center">
          <div className="overflow-hidden rounded-xl shadow-md">
            <InstagramEmbed postId={post.id} captioned={post.captioned} />
          </div>
        </div>
      ))}
    </div>
  );
}
