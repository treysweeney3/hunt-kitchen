import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Heart, Leaf, Users } from 'lucide-react';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about The Hunt Kitchen, our mission to transform wild game into extraordinary meals, and our commitment to ethical hunting and sustainable practices.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="bg-forestGreen py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="font-serif text-5xl font-bold leading-tight sm:text-6xl">
              Our Story
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-xl text-white/80">
              Honoring the hunt, celebrating the harvest, mastering the meal
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="mx-auto max-w-4xl space-y-16">
          {/* Our Mission Section */}
          <section>
            <h2 className="mb-6 font-serif text-3xl font-bold text-[#4A3728] sm:text-4xl">
              From Field to Fork
            </h2>
            <div className="space-y-4 text-lg text-[#333333] leading-relaxed">
              <p>
                At The Hunt Kitchen, we believe that the harvest is just the beginning of
                the journey. Wild game meat is some of the most flavorful, sustainable,
                and ethically sourced protein available—and we're passionate about
                helping hunters transform their harvests into extraordinary meals.
              </p>
              <p>
                Whether you're a seasoned hunter or new to wild game cooking, our recipes
                and techniques will guide you through every step of the process. From
                field dressing to final presentation, we're here to ensure that every
                animal you harvest is treated with respect and transformed into something
                truly special.
              </p>
              <p>
                Our mission is simple: to celebrate the hunting tradition while elevating
                wild game cooking to an art form. We combine time-tested techniques with
                innovative approaches to create recipes that honor both the animal and
                the hunter.
              </p>
            </div>
          </section>

          {/* Values Grid */}
          <section>
            <h2 className="mb-8 font-serif text-3xl font-bold text-[#4A3728] text-center sm:text-4xl">
              Our Values
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <Card>
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <div className="mb-4 rounded-full bg-[#2D5A3D]/10 p-4">
                    <Target className="h-8 w-8 text-[#2D5A3D]" />
                  </div>
                  <h3 className="mb-2 font-serif text-xl font-bold text-[#4A3728]">
                    Respect for the Hunt
                  </h3>
                  <p className="text-slate">
                    We honor the hunting tradition and the animals that provide for our
                    tables. Every recipe is created with respect for the harvest.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <div className="mb-4 rounded-full bg-[#2D5A3D]/10 p-4">
                    <Leaf className="h-8 w-8 text-[#2D5A3D]" />
                  </div>
                  <h3 className="mb-2 font-serif text-xl font-bold text-[#4A3728]">
                    Sustainable Practices
                  </h3>
                  <p className="text-slate">
                    Wild game is one of the most sustainable protein sources available.
                    We promote ethical hunting and responsible stewardship of our natural
                    resources.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <div className="mb-4 rounded-full bg-[#2D5A3D]/10 p-4">
                    <Heart className="h-8 w-8 text-[#2D5A3D]" />
                  </div>
                  <h3 className="mb-2 font-serif text-xl font-bold text-[#4A3728]">
                    Passion for Cooking
                  </h3>
                  <p className="text-slate">
                    We're dedicated to helping hunters become confident cooks, with
                    recipes and techniques that make wild game cooking accessible and
                    enjoyable.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col items-center p-8 text-center">
                  <div className="mb-4 rounded-full bg-[#2D5A3D]/10 p-4">
                    <Users className="h-8 w-8 text-[#2D5A3D]" />
                  </div>
                  <h3 className="mb-2 font-serif text-xl font-bold text-[#4A3728]">
                    Community Connection
                  </h3>
                  <p className="text-slate">
                    We're building a community of hunters and cooks who share knowledge,
                    recipes, and the joy of wild game cooking.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Image Gallery Section */}
          <section>
            <h2 className="mb-8 font-serif text-3xl font-bold text-[#4A3728] text-center sm:text-4xl">
              A Glimpse Into Our World
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <div
                  key={index}
                  className="relative aspect-square overflow-hidden rounded-lg bg-stone"
                >
                  <Image
                    src={`/images/gallery/about-${index}.jpg`}
                    alt={`Gallery image ${index}`}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Team Section */}
          <section>
            <h2 className="mb-8 font-serif text-3xl font-bold text-[#4A3728] text-center sm:text-4xl">
              Meet the Team
            </h2>
            <div className="space-y-12">
              <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                  <Image
                    src="/images/team/founder.jpg"
                    alt="Founder"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="font-serif text-2xl font-bold text-[#4A3728]">
                    John Doe
                  </h3>
                  <p className="mt-1 text-lg text-[#E07C24]">Founder & Head Chef</p>
                  <p className="mt-4 text-[#333333] leading-relaxed">
                    John has been hunting since childhood and discovered his passion for
                    wild game cooking in his early twenties. After years of experimenting
                    in the kitchen and perfecting his craft, he founded The Hunt Kitchen
                    to share his knowledge with fellow hunters and outdoor enthusiasts.
                  </p>
                  <p className="mt-4 text-[#333333] leading-relaxed">
                    His philosophy is simple: every animal deserves to be prepared with
                    care, creativity, and respect for the hunting tradition.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="rounded-lg bg-forestGreen p-8 text-center text-white sm:p-12">
            <h2 className="font-serif text-3xl font-bold sm:text-4xl">
              Join Our Community
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
              Connect with fellow hunters and wild game enthusiasts. Share recipes,
              techniques, and stories from the field.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                asChild
                size="lg"
                className="bg-[#E07C24] text-white hover:bg-[#E07C24]/90"
              >
                <Link href="/recipes">Explore Recipes</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
              >
                <Link href="/contact">Get in Touch</Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
