import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Youtube, Instagram } from 'lucide-react';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Content',
  description: 'Watch The Hunt Kitchen videos on YouTube and follow us on social media for wild game cooking inspiration, tips, and behind-the-scenes content.',
};

// Placeholder YouTube video IDs - replace with actual videos
const youtubeVideos = [
  { id: 'geDFMhYxRbQ', title: 'These Venison Enchiladas Will Make You a Believer in Venison!' },
  { id: 'dQw4w9WgXcQ', title: 'Perfect Venison Steak Every Time' },
  { id: 'dQw4w9WgXcQ', title: 'Field to Fork: Processing Your Harvest' },
  { id: 'dQw4w9WgXcQ', title: 'Wild Boar BBQ Masterclass' },
];

export default function ContentPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-forestGreen py-20">
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full bg-[url('/images/pattern.png')] bg-repeat" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="font-serif text-5xl font-bold leading-tight sm:text-6xl">
              Hunt Kitchen Content
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-cream/80">
              Videos, tips, and inspiration for wild game cooking enthusiasts
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Content</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* YouTube Section */}
        <section className="mb-16">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-full bg-red-600 p-2">
              <Youtube className="h-6 w-6 text-white" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-barkBrown sm:text-4xl">
              Latest Videos
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {youtubeVideos.map((video, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="relative aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-barkBrown">{video.title}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button
              asChild
              size="lg"
              className="bg-red-600 text-white hover:bg-red-700"
            >
              <a
                href={siteConfig.links.youtube}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Youtube className="mr-2 h-5 w-5" />
                Subscribe on YouTube
              </a>
            </Button>
          </div>
        </section>

        {/* Social Media Section */}
        <section className="mb-16">
          <h2 className="mb-8 font-serif text-3xl font-bold text-barkBrown text-center sm:text-4xl">
            Follow Us
          </h2>
          <div className="mx-auto grid max-w-2xl gap-6 sm:grid-cols-2">
            {/* Instagram */}
            <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <div className="mb-4 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4">
                  <Instagram className="h-10 w-10 text-white" />
                </div>
                <h3 className="mb-2 font-serif text-xl font-bold text-barkBrown">
                  Instagram
                </h3>
                <p className="mb-4 text-slate">
                  Behind-the-scenes content, recipe photos, and hunting adventures
                </p>
                <Button
                  asChild
                  className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white hover:opacity-90"
                >
                  <a
                    href={siteConfig.links.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Follow @the_hunt_kitchen
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* TikTok */}
            <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
              <CardContent className="flex flex-col items-center p-8 text-center">
                <div className="mb-4 rounded-full bg-black p-4">
                  <svg
                    className="h-10 w-10 text-white"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </div>
                <h3 className="mb-2 font-serif text-xl font-bold text-barkBrown">
                  TikTok
                </h3>
                <p className="mb-4 text-slate">
                  Quick tips, cooking hacks, and entertaining wild game content
                </p>
                <Button
                  asChild
                  className="bg-black text-white hover:bg-gray-800"
                >
                  <a
                    href="https://tiktok.com/@thehuntkitchen"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Follow on TikTok
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="rounded-lg bg-forestGreen p-8 text-center text-white sm:p-12">
          <h2 className="font-serif text-3xl font-bold sm:text-4xl">
            Want to Collaborate?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-cream/80">
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
        </section>
      </div>
    </div>
  );
}
