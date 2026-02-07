import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { TikTokGrid } from '@/components/content/TikTokEmbed';
import { InstagramGrid } from '@/components/content/InstagramEmbed';
import { getSiteContent } from '@/lib/site-content';

export const metadata: Metadata = {
  title: 'Content',
  description: 'Watch The Hunt Kitchen videos on YouTube and follow us on social media for wild game cooking inspiration, tips, and behind-the-scenes content.',
};

// TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

// YouTube icon component
const YouTubeIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

// Instagram icon component
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

export default async function ContentPage() {
  const [tiktokVideos, instagramPosts, youtubeVideos] = await Promise.all([
    getSiteContent('tiktok_videos'),
    getSiteContent('instagram_posts'),
    getSiteContent('youtube_videos'),
  ]);

  const featuredVideo = youtubeVideos.find(v => v.featured);
  const otherVideos = youtubeVideos.filter(v => !v.featured);

  return (
    <div className="min-h-screen">
      {/* Hero Section - forestGreen accent */}
      <section className="bg-forestGreen py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="font-serif text-5xl font-bold leading-tight sm:text-6xl">
              Hunt Kitchen Content
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-white/80">
              Videos, tips, and inspiration for wild game cooking enthusiasts
            </p>
          </div>
        </div>
      </section>

      {/* TikTok Section - Cream background */}
      <section className="bg-cream py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-full bg-forestGreen p-2">
              <TikTokIcon className="h-6 w-6 text-white" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-forestGreen sm:text-4xl">
              TikTok Videos
            </h2>
          </div>

          <TikTokGrid videos={tiktokVideos} />

          <div className="mt-8 text-center">
            <Button
              asChild
              size="lg"
              className="bg-hunterOrange text-white hover:bg-hunterOrange/90"
            >
              <a
                href={siteConfig.links.tiktok}
                target="_blank"
                rel="noopener noreferrer"
              >
                <TikTokIcon className="mr-2 h-5 w-5" />
                Follow on TikTok
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Instagram Section - White background */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-full bg-forestGreen p-2">
              <InstagramIcon className="h-6 w-6 text-white" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-forestGreen sm:text-4xl">
              Instagram Feed
            </h2>
          </div>
          <p className="mb-6 text-slate">
            Behind-the-scenes content, recipe photos, and hunting adventures
          </p>

          <InstagramGrid posts={instagramPosts} />

          <div className="mt-8 text-center">
            <Button
              asChild
              size="lg"
              className="bg-hunterOrange text-white hover:bg-hunterOrange/90"
            >
              <a
                href={siteConfig.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon className="mr-2 h-5 w-5" />
                Follow @the_hunt_kitchen
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* YouTube Section - Cream background */}
      <section className="bg-cream py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-full bg-forestGreen p-2">
              <YouTubeIcon className="h-6 w-6 text-white" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-forestGreen sm:text-4xl">
              Latest Videos
            </h2>
          </div>

          {/* Featured Video - Full Width */}
          {featuredVideo && (
            <div className="mb-8 overflow-hidden rounded-xl">
              <div className="relative aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${featuredVideo.id}`}
                  title={featuredVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </div>
          )}

          {/* More Videos - 3 Column Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {otherVideos.map((video, index) => (
              <div key={index} className="overflow-hidden rounded-xl">
                <div className="relative aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button
              asChild
              size="lg"
              className="bg-hunterOrange text-white hover:bg-hunterOrange/90"
            >
              <a
                href={siteConfig.links.youtube}
                target="_blank"
                rel="noopener noreferrer"
              >
                <YouTubeIcon className="mr-2 h-5 w-5" />
                Subscribe on YouTube
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action - forestGreen accent */}
      <section className="bg-forestGreen py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
              Want to Collaborate?
            </h2>
            <p className="mt-4 text-lg text-white/80">
              We're always looking for fellow hunters and brands to partner with.
              Get in touch to discuss collaboration opportunities.
            </p>
            <div className="mt-8">
              <Button
                asChild
                size="lg"
                className="bg-hunterOrange text-white hover:bg-hunterOrange/90"
              >
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
